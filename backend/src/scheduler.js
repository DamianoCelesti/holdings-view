const { ingestSubredditNewPosts, getAutoSubreddits } = require("./post-workflow");

const EIGHT_HOURS = 8 * 60 * 60 * 1000;

function getNextRunDate() {
    const now = new Date();

    const next = new Date(now);
    next.setMinutes(0);
    next.setSeconds(0);
    next.setMilliseconds(0);

    const hour = now.getHours();
    const nextHour = Math.ceil((hour + 1) / 8) * 8;

    if (nextHour >= 24) {
        next.setDate(next.getDate() + 1);
        next.setHours(0);
    } else {
        next.setHours(nextHour);
    }

    return next;
}

async function runAutoFetchOnce() {
    const subreddits = await getAutoSubreddits();

    if (subreddits.length === 0) {
        console.log("[scheduler] No subreddits configured");
        return;
    }

    for (const sub of subreddits) {
        try {
            const result = await ingestSubredditNewPosts(sub, 30);

            console.log(
                `[scheduler] r/${sub} fetched=${result.fetched} inserted=${result.inserted} skipped=${result.skipped}`
            );
        } catch (err) {
            console.error(`[scheduler] error fetching r/${sub}`, err.message);
        }
    }
}

function startAutoFetchScheduler() {
    const now = new Date();
    const nextRun = getNextRunDate();
    const delay = nextRun.getTime() - now.getTime();

    console.log("[scheduler] First run at", nextRun.toLocaleString());

    setTimeout(() => {
        runAutoFetchOnce();

        setInterval(() => {
            runAutoFetchOnce();
        }, EIGHT_HOURS);

    }, delay);
}

module.exports = {
    startAutoFetchScheduler,
};