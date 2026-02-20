import { useState } from "react";
import { summarizePost, savePost, dismissNewPost, restoreDismissedPost } from "../api";

export default function PostCard({ post, onRemove, mode = "new" }) {
    const [summary, setSummary] = useState("");
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [saving, setSaving] = useState(false);
    const [dismissing, setDismissing] = useState(false);
    const [showOriginal, setShowOriginal] = useState(false);
    const [restoring, setRestoring] = useState(false);

    async function handleSummarize() {
        try {
            setLoadingSummary(true);
            const res = await summarizePost(post.id);
            if (!res?.ok) {
                alert(res?.error || "Errore durante il riassunto");
                return;
            }
            setSummary(res.summaryMd || "");
        } catch (err) {
            console.error("summarize error:", err);
            alert("Errore durante il riassunto");
        } finally {
            setLoadingSummary(false);
        }
    }

    async function handleSave() {
        if (!summary) return;

        try {
            setSaving(true);
            const res = await savePost(post.id, summary);
            if (!res?.ok) {
                alert(res?.error || "Errore durante il salvataggio");
                return;
            }

            onRemove?.(post.id);
        } catch (err) {
            console.error("save error:", err);
            alert("Errore durante il salvataggio");
        } finally {
            setSaving(false);
        }
    }

    async function handleDismiss() {
        try {
            setDismissing(true);
            const res = await dismissNewPost(post.id);
            if (!res?.ok) {
                alert(res?.error || "Errore nel segnare come visualizzato");
                return;
            }

            onRemove?.(post.id);
        } catch (err) {
            console.error("dismiss error:", err);
            alert("Errore nel segnare come visualizzato");
        } finally {
            setDismissing(false);
        }
    }

    async function handleRestore() {
        try {
            setRestoring(true);
            const res = await restoreDismissedPost(post.id);
            if (!res?.ok) {
                alert(res?.error || "Errore nel ripristinare il post");
                return;
            }

            onRemove?.(post.id);
        } catch (err) {
            console.error("restore error:", err);
            alert("Errore nel ripristinare il post");
        } finally {
            setRestoring(false);
        }
    }

    const originalText = post.selftext?.trim();
    const isLinkOnly = !originalText;

    return (
        <div>
            <h3>{post.title}</h3>

            <p>
                Score: {post.score ?? 0} — Commenti: {post.numComments ?? 0}
            </p>

            <div>
                <a href={post.permalink || post.url} target="_blank" rel="noreferrer">
                    Apri su Reddit
                </a>

                <button type="button" onClick={() => setShowOriginal((v) => !v)}>
                    {showOriginal ? "Nascondi testo" : "Testo originale"}
                </button>
            </div>

            <div>
                {mode === "new" && (
                    <button type="button" onClick={handleDismiss} disabled={dismissing || saving}>
                        {dismissing ? "..." : "Visualizzato"}
                    </button>
                )}

                {mode === "dismissed" && (
                    <button type="button" onClick={handleRestore} disabled={restoring}>
                        {restoring ? "..." : "Ripristina tra i nuovi"}
                    </button>
                )}

                <button
                    type="button"
                    onClick={handleSummarize}
                    disabled={loadingSummary || saving}
                >
                    {loadingSummary ? "..." : "Riassumi (IT)"}
                </button>

                <button type="button" onClick={handleSave} disabled={!summary || saving}>
                    {saving ? "..." : "Salva"}
                </button>
            </div>

            {showOriginal && (
                <div>
                    <h4>Testo originale</h4>
                    <pre>{isLinkOnly ? "(nessun testo, solo link)" : originalText}</pre>
                </div>
            )}

            {summary && (
                <div>
                    <h4>Riassunto</h4>
                    <pre>{summary}</pre>
                </div>
            )}
        </div>
    );
}