const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const controller = require("../controllers/savedPosts.controller");

const router = express.Router();

router.get(
    "/saved-posts",
    asyncHandler(controller.listSavedPosts)
);

router.delete(
    "/saved-posts/:id",
    asyncHandler(controller.deleteSavedPost)
);

module.exports = router;
