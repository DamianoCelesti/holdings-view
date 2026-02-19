const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { fetchHotPosts } = require("./reddit");
const { summarizePostToMarkdownIT } = require("./ai");

const prisma = new PrismaClient();
const router = express.Router();

router.post("/ingest/:subreddit", async (req, res) => {
    try {
        const subreddit = req.params.subreddit;
        const limit = Number(req.query.limit || 25);

        const posts = await fetchHotPosts(subreddit, limit);

        let processed = 0;

        for (const p of posts) {
            await prisma.rawPost.upsert({
                where: { redditId: p.redditId },
                update: {
                    subreddit: p.subreddit,
                    title: p.title,
                    author: p.author,
                    url: p.url,
                    permalink: p.permalink,
                    selftext: p.selftext,
                    score: p.score,
                    numComments: p.numComments,
                    createdUtc: p.createdUtc,
                    fetchedAt: new Date(),
                },
                create: {
                    redditId: p.redditId,
                    subreddit: p.subreddit,
                    title: p.title,
                    author: p.author,
                    url: p.url,
                    permalink: p.permalink,
                    selftext: p.selftext,
                    score: p.score,
                    numComments: p.numComments,
                    createdUtc: p.createdUtc,
                    firstSeenAt: new Date(),
                    fetchedAt: new Date(),
                    status: "NEW",
                    statusAt: new Date(),
                },
            });

            processed++;
        }

        res.json({ ok: true, subreddit, count: processed });
    } catch (err) {
        res.status(500).json({ ok: false, error: String(err.message || err) });
    }
});

router.get("/raw-posts", async (req, res) => {
    try {
        const items = await prisma.rawPost.findMany({
            where: { status: "NEW" },
            orderBy: { firstSeenAt: "asc" },
        });
        res.json(items);
    } catch (err) {
        res.status(500).json({ ok: false, error: String(err.message || err) });
    }
});

router.get("/raw-posts/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const item = await prisma.rawPost.findUnique({ where: { id } });
        if (!item) return res.status(404).json({ ok: false, error: "Not found" });
        res.json(item);
    } catch (err) {
        res.status(500).json({ ok: false, error: String(err.message || err) });
    }
});

router.patch("/raw-posts/:id/dismiss", async (req, res) => {
    try {
        const id = Number(req.params.id);

        const updated = await prisma.rawPost.update({
            where: { id },
            data: {
                status: "DISMISSED",
                statusAt: new Date(),
            },
        });

        res.json({ ok: true, id: updated.id });
    } catch (err) {
        res.status(500).json({ ok: false, error: String(err.message || err) });
    }
});

router.post("/raw-posts/:id/summarize", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const post = await prisma.rawPost.findUnique({ where: { id } });
        if (!post) return res.status(404).json({ ok: false, error: "Not found" });

        const summaryMd = await summarizePostToMarkdownIT(post);
        res.json({ ok: true, id, summaryMd });
    } catch (err) {
        res.status(500).json({ ok: false, error: String(err.message || err) });
    }
});

router.post("/raw-posts/:id/save", async (req, res) => {
    try {
        const id = Number(req.params.id);

        const post = await prisma.rawPost.findUnique({ where: { id } });
        if (!post) return res.status(404).json({ ok: false, error: "Not found" });

        const { summaryMd } = req.body;
        if (!summaryMd || typeof summaryMd !== "string") {
            return res.status(400).json({ ok: false, error: "summaryMd required" });
        }

        const saved = await prisma.$transaction(async (tx) => {
            const savedRow = await tx.savedPost.upsert({
                where: { rawPostId: post.id },
                update: {
                    summaryMd,
                },
                create: {
                    rawPostId: post.id,
                    summaryMd,
                },
            });

            await tx.rawPost.update({
                where: { id: post.id },
                data: {
                    status: "SAVED",
                    statusAt: new Date(),
                },
            });

            return savedRow;
        });

        res.json({ ok: true, savedId: saved.id });
    } catch (err) {
        res.status(500).json({ ok: false, error: String(err.message || err) });
    }
});

router.get("/saved-posts", async (req, res) => {
    try {
        const items = await prisma.savedPost.findMany({
            include: { rawPost: true },
            orderBy: { savedAt: "desc" },
        });
        res.json(items);
    } catch (err) {
        res.status(500).json({ ok: false, error: String(err.message || err) });
    }
});

module.exports = router;
