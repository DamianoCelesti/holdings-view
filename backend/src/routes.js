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

        let upserted = 0;
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
                    fetchedAt: new Date(),
                },
            });
            upserted++;
        }

        res.json({ ok: true, subreddit, count: upserted });
    } catch (err) {
        res.status(500).json({ ok: false, error: String(err.message || err) });
    }
});


router.get("/raw-posts", async (req, res) => {
    const items = await prisma.rawPost.findMany({
        orderBy: { fetchedAt: "desc" },
    });
    res.json(items);
});


router.get("/raw-posts/:id", async (req, res) => {
    const id = Number(req.params.id);
    const item = await prisma.rawPost.findUnique({ where: { id } });
    if (!item) return res.status(404).json({ ok: false, error: "Not found" });
    res.json(item);
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

        const saved = await prisma.savedPost.upsert({
            where: { redditId: post.redditId },
            update: {
                summaryMd,
                savedAt: new Date(),
            },
            create: {
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
                fetchedAt: post.fetchedAt,
                summaryMd,
            },
        });

        res.json({ ok: true, savedId: saved.id });
    } catch (err) {
        res.status(500).json({ ok: false, error: String(err.message || err) });
    }
});


router.get("/saved-posts", async (req, res) => {
    const items = await prisma.savedPost.findMany({
        orderBy: { savedAt: "desc" },
    });
    res.json(items);
});

module.exports = router;
