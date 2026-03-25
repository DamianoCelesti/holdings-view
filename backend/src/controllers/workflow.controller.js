const service = require("../services/workflow.service");

function getRequestedLimit(req) {
    return req.body?.limit ?? req.query?.limit;
}

async function ingestSubreddit(req, res) {
    const result = await service.ingestSubreddit(req.params.subreddit);

    res.json({
        ok: true,
        subreddit: result.subreddit,
        fetched: result.fetched,
        inserted: result.inserted,
        skipped: result.skipped,
        count: result.inserted,
    });
}

async function processNewPosts(req, res) {
    const result = await service.processNewPosts(getRequestedLimit(req));

    res.json({
        ok: result.errors.length === 0,
        ...result,
    });
}

module.exports = {
    ingestSubreddit,
    processNewPosts,
};
