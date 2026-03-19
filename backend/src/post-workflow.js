const prisma = require("./db");
const { fetchNewPosts, fetchTopComments } = require("./reddit");
const { runManualAIPipeline } = require("./ai");

// --- utils

function normalizeSubredditName(value) {
    return String(value || "")
        .trim()
        .replace(/^r\//i, "")
        .replace(/^\/+|\/+$/g, "");
}

function parseSubredditsList(value) {
    return String(value || "")
        .split(",")
        .map(normalizeSubredditName)
        .filter(Boolean);
}

function toSafeBatchLimit(limit) {
    const n = Number(limit);
    if (!Number.isFinite(n) || n <= 0) return 100;
    return Math.min(Math.floor(n), 200);
}

function decidePostStatus(score, confidence) {
    if (score >= 70 && confidence >= 0.65) return "SAVED";
    if (score <= 35 && confidence >= 0.65) return "DISMISSED";
    return "UNCERTAIN";
}

// --- ingest

function mapPostToDb(post, now) {
    return {
        redditId: post.redditId,
        subreddit: post.subreddit,
        title: post.title,
        author: post.author,
        url: post.url,
        permalink: post.permalink,
        selftext: post.selftext,
        score: post.score,
        numComments: post.numComments,
        createdUtc: post.createdUtc,
        firstSeenAt: now,
        fetchedAt: now,
        status: "NEW",
        statusAt: now,
    };
}

async function ingestSubredditNewPosts(subreddit, limit = 30) {
    const clean = normalizeSubredditName(subreddit);
    if (!clean) throw new Error("subreddit is required");

    const posts = await fetchNewPosts(clean, limit);

    if (!posts.length) {
        return {
            subreddit: clean,
            fetched: 0,
            inserted: 0,
            skipped: 0,
        };
    }

    const now = new Date();

    const result = await prisma.rawPost.createMany({
        data: posts.map((p) => mapPostToDb(p, now)),
        skipDuplicates: true,
    });

    return {
        subreddit: clean,
        fetched: posts.length,
        inserted: result.count,
        skipped: posts.length - result.count,
    };
}

// --- config

async function getAutoSubreddits() {
    const configured = parseSubredditsList(process.env.AUTO_SUBREDDITS);

    const existing = await prisma.rawPost.findMany({
        select: { subreddit: true },
        distinct: ["subreddit"],
    });

    const fromDb = existing.map((r) => normalizeSubredditName(r.subreddit));

    const merged = [...configured, ...fromDb].filter(Boolean);

    return [...new Set(merged)];
}

// --- processing

async function processNewPosts(limit) {
    const take = toSafeBatchLimit(limit);

    const posts = await prisma.rawPost.findMany({
        where: { status: "NEW" },
        orderBy: { firstSeenAt: "asc" },
        take,
    });

    const stats = {
        processedCount: 0,
        savedCount: 0,
        dismissedCount: 0,
        uncertainCount: 0,
        errors: [],
    };

    for (const post of posts) {
        try {
            let comments = [];

            try {
                comments = await fetchTopComments(post.permalink, {
                    sort: "top",
                    limit: 80,
                });
            } catch (err) {
                console.warn("fetchTopComments failed:", err.message);
            }

            const ai = await runManualAIPipeline({
                ...post,
                comments,
            });

            const confidence = Number(ai?.analysis?.confidence ?? 0.5);
            const status = decidePostStatus(ai.aiScore, confidence);
            const now = new Date();

            await prisma.$transaction(async (tx) => {
                await tx.rawPost.update({
                    where: { id: post.id },
                    data: {
                        status,
                        statusAt: now,
                        processedAt: now,
                        aiSummaryMd: ai.aiSummaryMd,
                        aiScore: ai.aiScore,
                        aiDataJson: ai.aiDataJson,

                        aiIsRelevant: ai.analysis.isRelevant,
                        aiImportance: ai.analysis.importance,
                        aiCategory: ai.analysis.category,
                        aiTickers: ai.analysis.tickers,
                        aiReason: ai.analysis.reason,
                    },
                });

                if (status === "SAVED") {
                    await tx.savedPost.upsert({
                        where: { rawPostId: post.id },
                        update: { summaryMd: ai.aiSummaryMd },
                        create: {
                            rawPostId: post.id,
                            summaryMd: ai.aiSummaryMd,
                        },
                    });
                } else {
                    await tx.savedPost.deleteMany({
                        where: { rawPostId: post.id },
                    });
                }
            });

            stats.processedCount++;

            if (status === "SAVED") stats.savedCount++;
            else if (status === "DISMISSED") stats.dismissedCount++;
            else stats.uncertainCount++;
        } catch (err) {
            stats.errors.push({
                id: post.id,
                error: err.message,
            });
        }
    }

    return stats;
}

module.exports = {
    ingestSubredditNewPosts,
    getAutoSubreddits,
    processNewPosts,
};