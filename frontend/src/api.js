const BASE_URL = "http://localhost:3001/api";


async function handleResponse(res, fallbackMessage) {
    if (!res.ok) {
        let message = fallbackMessage;

        try {
            const data = await res.json();
            if (data && data.error) {
                message = data.error;
            }
        } catch (e) {
            console.log("response parse error");
        }

        throw new Error(message);
    }

    return res.json();
}

export async function processNew(limit) {
    const res = await fetch(`${BASE_URL}/process-new`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(limit ? { limit } : {}),
    });

    return handleResponse(res, "Errore durante l'analisi GPU");
}

export async function getRawPostsByStatus(status, limit = 10, offset = 0) {
    const params = new URLSearchParams({
        status,
        limit,
        offset
    });

    const res = await fetch(`${BASE_URL}/raw-posts?${params}`);
    return handleResponse(res, "Errore nel caricamento dei post");
}

export async function getNewPosts() {
    return getRawPostsByStatus("NEW");
}

export async function getUncertainPosts() {
    return getRawPostsByStatus("UNCERTAIN");
}

export async function getSavedRawPosts() {
    return getRawPostsByStatus("SAVED");
}

export async function getDismissedPosts() {
    return getRawPostsByStatus("DISMISSED");
}

export async function saveRawPost(id, summaryMd) {
    const payload = {};

    if (summaryMd) {
        payload.summaryMd = summaryMd;
    }

    const res = await fetch(`${BASE_URL}/raw-posts/${id}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    return handleResponse(res, "Errore durante il salvataggio");
}

export async function dismissRawPost(id) {
    const res = await fetch(`${BASE_URL}/raw-posts/${id}/dismiss`, {
        method: "PATCH",
    });

    return handleResponse(res, "Errore durante il dismiss");
}

export async function restoreRawPost(id) {
    const res = await fetch(`${BASE_URL}/raw-posts/${id}/restore`, {
        method: "PATCH",
    });

    return handleResponse(res, "Errore durante il restore");
}

export async function deleteSavedRawPost(id) {
    return dismissRawPost(id);
}