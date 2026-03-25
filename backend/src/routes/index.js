const express = require("express");

const rawPostsRoutes = require("./rawPosts.routes");
const savedPostsRoutes = require("./savedPosts.routes");
const workflowRoutes = require("./workflow.routes");

const router = express.Router();

router.use(workflowRoutes);
router.use(rawPostsRoutes);
router.use(savedPostsRoutes);

module.exports = router;
