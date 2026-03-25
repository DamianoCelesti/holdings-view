const prisma = require("../db");
const { fetchTopComments } = require("../reddit");
const { summarizePostToMarkdownIT } = require("../ai");

async function getRawPosts(status) {
    return prisma.rawPost.findMany({
        where: { status },
        orderBy: { firstSeenAt: "asc" },
    });
}

async function getDismissedPosts() {
    return prisma.rawPost.findMany({
        where: { status: "DISMISSED" },
        orderBy: { statusAt: "desc" },
    });
}

async function dismissPost(id) {
    return prisma.$transaction(async (tx) => {
        const updated = await tx.rawPost.update({
            where: { id },
            data: {
                status: "DISMISSED",
                statusAt: new Date(),
            },
        });

        await tx.savedPost.deleteMany({
            where: { rawPostId: updated.id },
        });

        return updated;
    });
}

async function restorePost(id) {
    return prisma.rawPost.update({
        where: { id },
        data: {
            status: "NEW",
            statusAt: new Date(),
        },
    });
}

async function summarizePost(post) {
    let comments = [];

    try {
        comments = await fetchTopComments(post.permalink, {
            sort: "top",
            limit: 10,
        });
    } catch (err) {
        console.warn("fetchTopComments failed:", err.message);
    }

    const summaryMd = await summarizePostToMarkdownIT({
        ...post,
        comments,
    });

    return {
        summaryMd,
        commentsCount: comments.length,
    };
}

async function savePost(post, summaryMd) {
    return prisma.$transaction(async (tx) => {
        const saved = await tx.savedPost.upsert({
            where: { rawPostId: post.id },
            update: { summaryMd },
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
                aiSummaryMd: summaryMd,
            },
        });

        return saved;
    });
}

module.exports = {
    getRawPosts,
    getDismissedPosts,
    dismissPost,
    restorePost,
    summarizePost,
    savePost,
};
