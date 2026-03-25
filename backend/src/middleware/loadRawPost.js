const prisma = require("../db");

async function loadRawPost(req, res, next) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ ok: false, error: "Invalid id" });
    }

    const post = await prisma.rawPost.findUnique({
        where: { id },
    });

    if (!post) {
        return res.status(404).json({ ok: false, error: "Not found" });
    }

    req.rawPost = post;
    next();
}

module.exports = loadRawPost;
