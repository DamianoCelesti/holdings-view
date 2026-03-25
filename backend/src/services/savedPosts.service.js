const prisma = require("../db");

async function getSavedPosts() {
    return prisma.savedPost.findMany({
        include: { rawPost: true },
        orderBy: { savedAt: "desc" },
    });
}

async function deleteSavedPost(id) {
    const existing = await prisma.savedPost.findUnique({
        where: { id },
    });

    if (!existing) {
        return null;
    }

    await prisma.$transaction(async (tx) => {
        await tx.savedPost.delete({
            where: { id },
        });

        await tx.rawPost.update({
            where: { id: existing.rawPostId },
            data: {
                status: "DISMISSED",
                statusAt: new Date(),
            },
        });
    });

    return existing;
}

module.exports = {
    getSavedPosts,
    deleteSavedPost,
};
