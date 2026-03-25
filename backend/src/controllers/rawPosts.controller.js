const service = require("../services/rawPosts.service");

const allowedStatuses = new Set([
    "NEW",
    "UNCERTAIN",
    "PROCESSED",
    "DISMISSED",
    "SAVED",
]);

function getStatusFilter(status) {
    const s = String(status || "NEW");
    return allowedStatuses.has(s) ? s : "NEW";
}

async function listRawPosts(req, res) {
    const status = getStatusFilter(req.query.status);
    const posts = await service.getRawPosts(status);
    res.json(posts);
}

async function listDismissed(req, res) {
    const posts = await service.getDismissedPosts();
    res.json(posts);
}

function getPost(req, res) {
    res.json(req.rawPost);
}

async function dismiss(req, res) {
    const post = await service.dismissPost(req.rawPost.id);
    res.json({ ok: true, id: post.id });
}

async function restore(req, res) {
    const post = await service.restorePost(req.rawPost.id);
    res.json({ ok: true, id: post.id });
}

async function summarize(req, res) {
    const result = await service.summarizePost(req.rawPost);

    res.json({
        ok: true,
        id: req.rawPost.id,
        ...result,
    });
}

async function save(req, res) {
    const bodySummary =
        typeof req.body?.summaryMd === "string"
            ? req.body.summaryMd
            : "";

    const summaryMd = bodySummary || req.rawPost.aiSummaryMd;

    if (!summaryMd) {
        return res.status(400).json({
            ok: false,
            error: "summaryMd required",
        });
    }

    const saved = await service.savePost(req.rawPost, summaryMd);

    res.json({
        ok: true,
        savedId: saved.id,
        rawPostId: req.rawPost.id,
    });
}

module.exports = {
    listRawPosts,
    listDismissed,
    getPost,
    dismiss,
    restore,
    summarize,
    save,
};