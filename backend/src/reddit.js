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
        throw new Error(`Reddit error ${resp.status} ${resp.statusText} :: ${text.slice(0, 200)}`);
    }

    return resp.json();
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

module.exports = { fetchHotPosts };
