const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const loadRawPost = require("../middleware/loadRawPost");
const controller = require("../controllers/rawPosts.controller");

const router = express.Router();

router.get(
    "/raw-posts",
    asyncHandler(controller.listRawPosts)
);

router.get(
    "/dismissed-posts",
    asyncHandler(controller.listDismissed)
);

router.get(
    "/raw-posts/:id",
    asyncHandler(loadRawPost),
    controller.getPost
);

router.patch(
    "/raw-posts/:id/dismiss",
    asyncHandler(loadRawPost),
    asyncHandler(controller.dismiss)
);

router.patch(
    "/raw-posts/:id/restore",
    asyncHandler(loadRawPost),
    asyncHandler(controller.restore)
);

router.post(
    "/raw-posts/:id/summarize",
    asyncHandler(loadRawPost),
    asyncHandler(controller.summarize)
);

router.post(
    "/raw-posts/:id/save",
    asyncHandler(loadRawPost),
    asyncHandler(controller.save)
);

module.exports = router;