const BASE_URL = "http://localhost:3001/api";

export async function ingestSubreddit(subreddit) {
    const res = await fetch(`${BASE_URL}/ingest/${subreddit}`, {
        method: "POST",
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Ingest failed (${res.status}): ${text}`);
    }

    return res.json();
}

export async function getRawPosts() {
    const res = await fetch(`${BASE_URL}/raw-posts`);
    return res.json();
}

export async function summarizePost(id) {
    const res = await fetch(`${BASE_URL}/raw-posts/${id}/summarize`, {
        method: "POST",
    });
    return res.json();
}

export async function savePost(id, summaryMd) {
    const res = await fetch(`${BASE_URL}/raw-posts/${id}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summaryMd }),
    });
    return res.json();
}

export async function getSavedPosts() {
    const res = await fetch(`${BASE_URL}/saved-posts`);
    return res.json();
}


export async function dismissRawPost(id) {
    const res = await fetch(`${BASE_URL}/raw-posts/${id}/dismiss`, {
        method: "PATCH",
    });
    return res.json();
}
