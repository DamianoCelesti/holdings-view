async function fetchHotPosts(subreddit, limit = 25) {
    const url = `https://www.reddit.com/r/${encodeURIComponent(
        subreddit
    )}/hot.json?limit=${limit}`;


    const resp = await fetch(url, {
        headers: { "User-Agent": "hw-be/0.1 (by u/anonymous)" },
    });

    if (!resp.ok) {
        throw new Error(`Reddit error ${resp.status} ${resp.statusText}`);
    }

    const json = await resp.json();
    const children = json?.data?.children || [];

    return children
        .map((c) => c.data)
        .filter(Boolean)
        .map((p) => ({
            redditId: p.id,
            subreddit: p.subreddit,
            title: p.title,
            author: p.author,
            url: p.url,
            permalink: `https://www.reddit.com${p.permalink}`,
            selftext: p.selftext || "",
            score: typeof p.score === "number" ? p.score : null,
            numComments: typeof p.num_comments === "number" ? p.num_comments : null,
            createdUtc: p.created_utc ? new Date(p.created_utc * 1000) : null,
        }));
}

module.exports = { fetchHotPosts };
