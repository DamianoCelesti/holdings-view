const service = require("../services/savedPosts.service");

function getSavedPostId(req) {
    const id = Number(req.params.id);
    return Number.isInteger(id) && id > 0 ? id : null;
}

async function listSavedPosts(req, res) {
    const posts = await service.getSavedPosts();
    res.json(posts);
}

async function deleteSavedPost(req, res) {
    const id = getSavedPostId(req);

    if (!id) {
        return res.status(400).json({
            ok: false,
            error: "Invalid id",
        });
    }

    const deleted = await service.deleteSavedPost(id);

    if (!deleted) {
        return res.status(404).json({
            ok: false,
            error: "Not found",
        });
    }

    res.json({ ok: true, id });
}

module.exports = {
    listSavedPosts,
    deleteSavedPost,
};
