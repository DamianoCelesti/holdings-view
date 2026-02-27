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
        const text = await resp.text().catch(() => "");
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
        if (u.pathname?.startsWith("/r/")) return u.pathname.replace(/\/$/, "");
    } catch (e) {

    }

    return "";
}

async function fetchHotPosts(subreddit, limit = 25) {
    const sub = encodeURIComponent(subreddit);
    const base1 = `https://www.reddit.com/r/${sub}/hot.json?limit=${limit}&raw_json=1`;
    const base2 = `https://old.reddit.com/r/${sub}/hot.json?limit=${limit}&raw_json=1`;

    let json;
    try {
        json = await fetchJsonWithHeaders(base1);
    } catch (e) {
        json = await fetchJsonWithHeaders(base2);
    }

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

async function fetchTopComments(permalinkOrUrl, opts = {}) {
    const limit = Number(opts.limit ?? 80);
    const sort = String(opts.sort ?? "top");

    const path = normalizePermalinkToPath(permalinkOrUrl);
    if (!path) return [];


    const url1 = `https://www.reddit.com${path}.json?sort=${sort}&limit=${limit}&raw_json=1`;
    const url2 = `https://old.reddit.com${path}.json?sort=${sort}&limit=${limit}&raw_json=1`;

    let data;
    try {
        data = await fetchJsonWithHeaders(url1);
    } catch (e) {
        data = await fetchJsonWithHeaders(url2);
    }

    const children = data?.[1]?.data?.children || [];

    const comments = children
        .filter((c) => c?.kind === "t1")
        .map((c) => c.data || {})
        .map((c) => ({
            author: c.author || "n/d",
            score: typeof c.score === "number" ? c.score : 0,
            body: (c.body || "").trim(),
        }))
        .filter((c) => c.body && c.body.toLowerCase() !== "[deleted]" && c.body.toLowerCase() !== "[removed]");

    return comments;
}

module.exports = { fetchHotPosts, fetchTopComments };