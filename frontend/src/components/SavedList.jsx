import { useState } from "react";
import { deleteSavedPost } from "../api";

function SavedCard({ item, onRemoved }) {
    const [showOriginal, setShowOriginal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const raw = item?.rawPost;
    const title = raw?.title || "(titolo non disponibile)";
    const originalText = raw?.selftext?.trim();
    const isLinkOnly = !originalText;

    const redditHref = raw?.permalink || raw?.url || "#";

    async function handleDelete() {
        try {
            setDeleting(true);
            const res = await deleteSavedPost(item.id);
            if (!res?.ok) {
                alert(res?.error || "Errore nel rimuovere il salvato");
                return;
            }
            onRemoved?.(item.id);
        } catch (err) {
            console.error("deleteSavedPost error:", err);
            alert("Errore nel rimuovere il salvato");
        } finally {
            setDeleting(false);
        }
    }

    return (
        <div className="card">
            <h3 className="card-title">{title}</h3>

            {raw && (
                <p className="card-meta">
                    Score: {raw.score ?? 0} — Commenti: {raw.numComments ?? 0}
                </p>
            )}

            <div>
                <a href={redditHref} target="_blank" rel="noreferrer">
                    Apri su Reddit
                </a>

                <button className="button button-secondary" type="button" onClick={() => setShowOriginal((v) => !v)} disabled={!raw}>
                    {showOriginal ? "Nascondi originale" : "Originale"}
                </button>

                <button className="button button-secondary" type="button" onClick={handleDelete} disabled={deleting}>
                    {deleting ? "..." : "Rimuovi (errore)"}
                </button>
            </div>

            <div className="card-content">
                <h4>Riassunto</h4>
                <pre>{item.summaryMd || "(nessun riassunto)"}</pre>
            </div>

            {showOriginal && (
                <div className="card-content">
                    <h4>Testo originale</h4>
                    <pre>{isLinkOnly ? "(nessun testo, solo link)" : originalText}</pre>
                </div>
            )}
        </div>
    );
}

export default function SavedList({ posts, onRemove }) {
    if (!posts?.length) return <p>Nessun post salvato.</p>;

    return (
        <div>
            {posts.map((item) => (
                <SavedCard key={item.id} item={item} onRemoved={onRemove} />
            ))}
        </div>
    );
}