const {
    ingestSubredditNewPosts,
    processNewPosts,
} = require("../post-workflow");

async function ingestSubreddit(subreddit) {
    return ingestSubredditNewPosts(subreddit, 30);
}

async function processQueuedPosts(limit) {
    return processNewPosts(limit);
}

module.exports = {
    ingestSubreddit,
    processNewPosts: processQueuedPosts,
};
