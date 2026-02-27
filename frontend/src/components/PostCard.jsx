import { useState } from "react";
import {
    summarizePost,
    savePost,
    dismissNewPost,
    restoreDismissedPost,
} from "../api";

export default function PostCard({ post, onRemove, mode = "new" }) {
    const [summary, setSummary] = useState("");
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [saving, setSaving] = useState(false);
    const [dismissing, setDismissing] = useState(false);
    const [restoring, setRestoring] = useState(false);
    const [showOriginal, setShowOriginal] = useState(false);

    const originalText = post.selftext?.trim() || "";
    const hasOriginalText = originalText.length > 0;

    const redditUrl = post.permalink;
    //console.log(post)
    async function handleSummarize() {
        try {
            setLoadingSummary(true);

            const data = await summarizePost(post.id);
            setSummary(data.summaryMd);

        } catch (err) {
            alert("Errore durante il riassunto");
        } finally {
            setLoadingSummary(false);
        }
    }

    async function handleSave() {
        if (!summary) return;

        try {
            setSaving(true);
            await savePost(post.id, summary);
            onRemove?.(post.id);
        } catch (err) {
            console.error("save error:", err);
            alert(err.message || "Errore durante il salvataggio");
        } finally {
            setSaving(false);
        }
    }

    async function handleDismiss() {
        try {
            setDismissing(true);
            await dismissNewPost(post.id);
            onRemove?.(post.id);
        } catch (err) {
            console.error("dismiss error:", err);
            alert(err.message || "Errore nel segnare come visualizzato");
        } finally {
            setDismissing(false);
        }
    }

    async function handleRestore() {
        try {
            setRestoring(true);
            await restoreDismissedPost(post.id);
            onRemove?.(post.id);
        } catch (err) {
            console.error("restore error:", err);
            alert(err.message || "Errore nel ripristinare il post");
        } finally {
            setRestoring(false);
        }
    }

    const disableSummarize = loadingSummary || saving;
    const disableSave = saving || !summary;
    const disableDismiss = dismissing || saving || loadingSummary;
    const disableRestore = restoring;

    return (
        <div className="card">
            <h3 className="card-title">{post.title}</h3>

            <p className="card-meta">
                Score: {post.score ?? 0} — Commenti: {post.numComments ?? 0}
            </p>

            <div>
                <a href={redditUrl} target="_blank" rel="noreferrer">
                    Apri su Reddit
                </a>

                <button
                    className="button button-secondary"
                    type="button"
                    onClick={() => setShowOriginal((v) => !v)}
                >
                    {showOriginal ? "Nascondi testo" : "Testo originale"}
                </button>
            </div>

            <div>
                {mode === "new" && (
                    <button
                        className="button button-secondary"
                        type="button"
                        onClick={handleDismiss}
                        disabled={disableDismiss}
                    >
                        {dismissing ? "..." : "Visualizzato"}
                    </button>
                )}

                {mode === "dismissed" && (
                    <button
                        className="button button-secondary"
                        type="button"
                        onClick={handleRestore}
                        disabled={disableRestore}
                    >
                        {restoring ? "..." : "Ripristina tra i nuovi"}
                    </button>
                )}

                <button
                    className="button button-primary"
                    type="button"
                    onClick={handleSummarize}
                    disabled={disableSummarize}
                >
                    {loadingSummary ? "..." : "Riassumi (IT)"}
                </button>

                <button
                    className="button button-primary"
                    type="button"
                    onClick={handleSave}
                    disabled={disableSave}
                >
                    {saving ? "..." : "Salva"}
                </button>
            </div>

            {showOriginal && (
                <div className="card-content">
                    <h4>Testo originale</h4>
                    <pre>{hasOriginalText ? originalText : "(nessun testo, solo link)"}</pre>
                </div>
            )}

            {summary && (
                <div className="card-content">
                    <h4>Riassunto</h4>
                    <pre>{summary}</pre>
                </div>
            )}
        </div>
    );
}