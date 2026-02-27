const BASE_URL = "http://localhost:3001/api";

// -------- INGEST --------

export async function ingestSubreddit(subreddit) {
    const res = await fetch(`${BASE_URL}/ingest/${subreddit}`, {
        method: "POST",
    });

    if (!res.ok) {
        throw new Error("Errore durante il fetch del subreddit");
    }

    return res.json();
}

// -------- NEW POSTS --------

export async function getNewPosts() {
    const res = await fetch(`${BASE_URL}/raw-posts?status=NEW`);

    if (!res.ok) {
        throw new Error("Errore nel caricare i post nuovi");
    }

    return res.json();
}

// -------- DISMISSED POSTS --------

export async function getDismissedPosts() {
    const res = await fetch(`${BASE_URL}/dismissed-posts`);

    if (!res.ok) {
        throw new Error("Errore nel caricare i post visualizzati");
    }

    return res.json();
}

// -------- SUMMARIZE --------

export async function summarizePost(id) {
    const res = await fetch(`${BASE_URL}/raw-posts/${id}/summarize`, {
        method: "POST",
    });

    if (!res.ok) {
        throw new Error("Errore durante il riassunto");
    }

    return res.json();
}

// -------- SAVE --------

export async function savePost(id, summaryMd) {
    const res = await fetch(`${BASE_URL}/raw-posts/${id}/save`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ summaryMd }),
    });

    if (!res.ok) {
        throw new Error("Errore durante il salvataggio");
    }

    return res.json();
}

// -------- SAVED POSTS --------

export async function getSavedPosts() {
    const res = await fetch(`${BASE_URL}/saved-posts`);

    if (!res.ok) {
        throw new Error("Errore nel caricare i post salvati");
    }

    return res.json();
}

// -------- DELETE SAVED --------

export async function deleteSavedPost(id) {
    const res = await fetch(`${BASE_URL}/saved-posts/${id}`, {
        method: "DELETE",
    });

    if (!res.ok) {
        throw new Error("Errore durante l'eliminazione");
    }

    return res.json();
}

// -------- DISMISS --------

export async function dismissNewPost(id) {
    const res = await fetch(`${BASE_URL}/raw-posts/${id}/dismiss`, {
        method: "PATCH",
    });

    if (!res.ok) {
        throw new Error("Errore durante la rimozione");
    }

    return res.json();
}

// -------- RESTORE --------

export async function restoreDismissedPost(id) {
    const res = await fetch(`${BASE_URL}/raw-posts/${id}/restore`, {
        method: "PATCH",
    });

    if (!res.ok) {
        throw new Error("Errore durante il ripristino");
    }

    return res.json();
}