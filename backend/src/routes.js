// const express = require("express");
// const prisma = require("./db");
// const { fetchTopComments } = require("./reddit");
// const { summarizePostToMarkdownIT } = require("./ai");
// const { ingestSubredditNewPosts, processNewPosts } = require("./post-workflow");

// const router = express.Router();

// const allowedRawPostStatuses = new Set([
//     "NEW",
//     "UNCERTAIN",
//     "PROCESSED",
//     "DISMISSED",
//     "SAVED",
// ]);

// const DEFAULT_LIMIT = 10;
// const MAX_LIMIT = 20;
// const DEFAULT_OFFSET = 0;


// function asyncHandler(fn) {
//     return function (req, res, next) {
//         Promise.resolve(fn(req, res, next)).catch(next);
//     };
// }

// function parsePostId(req, res, next) {
//     req.postId = Number(req.params.id);
//     next();
// }

// async function loadRawPost(req, res, next) {
//     const post = await prisma.rawPost.findUnique({
//         where: { id: req.postId },
//     });

//     if (!post) {
//         return res.status(404).json({ ok: false, error: "Not found" });
//     }

//     req.rawPost = post;
//     next();
// }


// function getRequestedLimit(req) {
//     return req.body?.limit ?? req.query?.limit;
// }

// function getRawPostStatusFilter(status) {
//     const requestedStatus = String(status || "NEW");
//     return allowedRawPostStatuses.has(requestedStatus)
//         ? requestedStatus
//         : "NEW";
// }

// async function fetchCommentsSafe(permalink) {
//     try {
//         return await fetchTopComments(permalink, { sort: "top", limit: 10 });
//     } catch (error) {
//         console.warn("fetchTopComments failed:", error.message);
//         return [];
//     }
// }



// router.post(
//     "/ingest/:subreddit",
//     asyncHandler(async (req, res) => {
//         const subreddit = req.params.subreddit;
//         const result = await ingestSubredditNewPosts(subreddit, 30);

//         res.json({
//             ok: true,
//             subreddit: result.subreddit,
//             fetched: result.fetched,
//             inserted: result.inserted,
//             skipped: result.skipped,
//             count: result.inserted,
//         });
//     })
// );

// async function handleProcessPosts(req, res) {
//     const limit = getRequestedLimit(req);
//     const result = await processNewPosts(limit);

//     res.json({ ok: true, ...result });
// }

// router.post("/process-new", asyncHandler(handleProcessPosts));
// router.post("/process-posts", asyncHandler(handleProcessPosts));


// router.get(
//     "/raw-posts",
//     asyncHandler(async (req, res) => {
//         const statusFilter = getRawPostStatusFilter(req.query.status);

//         const requestedLimit = Number(req.query.limit);
//         let limit = DEFAULT_LIMIT;

//         if (Number.isFinite(requestedLimit) && requestedLimit > 0) {
//             limit = Math.min(requestedLimit, MAX_LIMIT);
//         }
//         console.log("LIMIT:", limit);
//         const requestedOffset = Number(req.query.offset);
//         let offset = DEFAULT_OFFSET;

//         if (Number.isFinite(requestedOffset) && requestedOffset >= 0) {
//             offset = requestedOffset;
//         }

//         const items = await prisma.rawPost.findMany({
//             where: { status: statusFilter },
//             orderBy: { firstSeenAt: "asc" },
//             take: limit,
//             skip: offset,
//         });

//         res.json(items);
//     })
// );
// router.get(
//     "/dismissed-posts",
//     asyncHandler(async (req, res) => {
//         const items = await prisma.rawPost.findMany({
//             where: { status: "DISMISSED" },
//             orderBy: { statusAt: "desc" },
//         });

//         res.json(items);
//     })
// );

// router.get(
//     "/raw-posts/:id",
//     parsePostId,
//     asyncHandler(loadRawPost),
//     (req, res) => {
//         res.json(req.rawPost);
//     }
// );

// router.patch(
//     "/raw-posts/:id/dismiss",
//     parsePostId,
//     asyncHandler(async (req, res) => {
//         const updated = await prisma.rawPost.update({
//             where: { id: req.postId },
//             data: {
//                 status: "DISMISSED",
//                 statusAt: new Date(),
//             },
//         });

//         await prisma.savedPost.deleteMany({
//             where: { rawPostId: updated.id },
//         });

//         res.json({ ok: true, id: updated.id });
//     })
// );

// router.patch(
//     "/raw-posts/:id/restore",
//     parsePostId,
//     asyncHandler(async (req, res) => {
//         const updated = await prisma.rawPost.update({
//             where: { id: req.postId },
//             data: {
//                 status: "NEW",
//                 statusAt: new Date(),
//             },
//         });

//         res.json({ ok: true, id: updated.id });
//     })
// );

// router.post(
//     "/raw-posts/:id/summarize",
//     parsePostId,
//     asyncHandler(loadRawPost),
//     asyncHandler(async (req, res) => {
//         const comments = await fetchCommentsSafe(req.rawPost.permalink);

//         const summaryMd = await summarizePostToMarkdownIT({
//             ...req.rawPost,
//             comments,
//         });

//         res.json({
//             ok: true,
//             id: req.rawPost.id,
//             summaryMd,
//             commentsCount: comments.length,
//         });
//     })
// );

// router.post(
//     "/raw-posts/:id/save",
//     parsePostId,
//     asyncHandler(loadRawPost),
//     asyncHandler(async (req, res) => {
//         const summaryFromBody =
//             typeof req.body?.summaryMd === "string" ? req.body.summaryMd : "";

//         const summaryMd = summaryFromBody || req.rawPost.aiSummaryMd || "";

//         if (!summaryMd) {
//             return res
//                 .status(400)
//                 .json({ ok: false, error: "summaryMd required" });
//         }

//         const saved = await prisma.$transaction(async (tx) => {
//             const savedRow = await tx.savedPost.upsert({
//                 where: { rawPostId: req.rawPost.id },
//                 update: { summaryMd },
//                 create: {
//                     rawPostId: req.rawPost.id,
//                     summaryMd,
//                 },
//             });

//             await tx.rawPost.update({
//                 where: { id: req.rawPost.id },
//                 data: {
//                     status: "SAVED",
//                     statusAt: new Date(),
//                     aiSummaryMd: summaryMd,
//                 },
//             });

//             return savedRow;
//         });

//         res.json({
//             ok: true,
//             savedId: saved.id,
//             rawPostId: req.rawPost.id,
//         });
//     })
// );

// router.get(
//     "/saved-posts",
//     asyncHandler(async (req, res) => {
//         const items = await prisma.savedPost.findMany({
//             include: { rawPost: true },
//             orderBy: { savedAt: "desc" },
//         });

//         res.json(items);
//     })
// );

// router.delete(
//     "/saved-posts/:id",
//     parsePostId,
//     asyncHandler(async (req, res) => {
//         const existing = await prisma.savedPost.findUnique({
//             where: { id: req.postId },
//         });

//         if (!existing) {
//             return res.status(404).json({ ok: false, error: "Not found" });
//         }

//         await prisma.$transaction(async (tx) => {
//             await tx.savedPost.delete({
//                 where: { id: req.postId },
//             });

//             await tx.rawPost.update({
//                 where: { id: existing.rawPostId },
//                 data: {
//                     status: "DISMISSED",
//                     statusAt: new Date(),
//                 },
//             });
//         });

//         res.json({ ok: true, id: req.postId });
//     })
// );

// module.exports = router;