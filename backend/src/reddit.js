async function fetchJsonWithHeaders(url) {
    const resp = await fetch(url, {
        headers: {
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) hw-be/0.1",
            "Accept": "application/json,text/plain,*/*",
            "Accept-Language": "en-US,en;q=0.9,it;q=0.8",
        },
    });

    if (!resp.ok) {
        const text = await resp.text();
        throw new Error(
            `Reddit error ${resp.status} ${resp.statusText} :: ${text.slice(0, 200)}`
        );
    }

    return resp.json();
}

function normalizePermalinkToPath(permalink) {
    if (!permalink) return "";

    if (permalink.startsWith("/r/")) return permalink;

    try {
        const u = new URL(permalink);
        if (u.pathname && u.pathname.startsWith("/r/")) {
            return u.pathname.replace(/\/$/, "");
        }
    } catch (e) { }

    return "";
}

async function fetchNewPosts(subreddit, limit = 30) {
    const sub = encodeURIComponent(subreddit);

    const safeLimit = Number(limit) > 0 ? Math.min(Number(limit), 30) : 30;

    const url = `https://www.reddit.com/r/${sub}/new.json?limit=${safeLimit}&raw_json=1`;

    const json = await fetchJsonWithHeaders(url);

    const children = json.data.children;

    return children.map((c) => {
        const p = c.data;

        return {
            redditId: p.id,
            subreddit: p.subreddit,
            title: p.title,
            author: p.author,
            url: p.url,
            permalink: `https://www.reddit.com${p.permalink}`,
            selftext: p.selftext,
            score: typeof p.score === "number" ? p.score : null,
            numComments: typeof p.num_comments === "number" ? p.num_comments : null,
            createdUtc: p.created_utc
                ? new Date(p.created_utc * 1000)
                : null,
        };
    });
}

async function fetchTopComments(permalinkOrUrl, opts = {}) {
    const limit = Number(opts.limit || 80);
    const sort = String(opts.sort || "top");

    const path = normalizePermalinkToPath(permalinkOrUrl);
    if (!path) return [];

    const url = `https://www.reddit.com${path}.json?sort=${sort}&limit=${limit}&raw_json=1`;

    const data = await fetchJsonWithHeaders(url);

    const children = data[1].data.children;

    const comments = children
        .filter((c) => c.kind === "t1")
        .map((c) => c.data)
        .map((c) => ({
            author: c.author,
            score: typeof c.score === "number" ? c.score : 0,
            body: c.body.trim(),
        }))
        .filter(
            (c) =>
                c.body &&
                c.body.toLowerCase() !== "[deleted]" &&
                c.body.toLowerCase() !== "[removed]"
        );

    return comments;
}

module.exports = {
    fetchNewPosts,
    fetchHotPosts: fetchNewPosts,
    fetchTopComments,
};