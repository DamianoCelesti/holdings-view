const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const controller = require("../controllers/workflow.controller");

const router = express.Router();

router.post(
    "/ingest/:subreddit",
    asyncHandler(controller.ingestSubreddit)
);

router.post(
    "/process-new",
    asyncHandler(controller.processNewPosts)
);

router.post(
    "/process-posts",
    asyncHandler(controller.processNewPosts)
);

module.exports = router;
