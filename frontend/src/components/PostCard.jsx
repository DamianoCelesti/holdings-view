import { useState } from "react";
import { summarizePost, savePost, dismissNewPost } from "../api";

export default function PostCard({ post, onRemove }) {
    const [summary, setSummary] = useState("");
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [saving, setSaving] = useState(false);
    const [dismissing, setDismissing] = useState(false);
    const [showOriginal, setShowOriginal] = useState(false);

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

    const originalText = post.selftext?.trim();
    const isLinkOnly = !originalText;

    return (
        <div className="post-card">
            <h3 className="post-title">{post.title}</h3>

            <p className="post-meta">
                Score: {post.score ?? 0} — Commenti: {post.numComments ?? 0}
            </p>


            <div className="post-links">
                <a
                    className="post-link"
                    href={post.permalink || post.url}
                    target="_blank"
                    rel="noreferrer"
                >
                    Apri su Reddit
                </a>

                <button
                    className="btn"
                    type="button"
                    onClick={() => setShowOriginal((v) => !v)}
                >
                    {showOriginal ? "Nascondi testo" : "Testo originale"}
                </button>
            </div>

            <div className="post-actions">
                <button
                    className="btn"
                    type="button"
                    onClick={handleDismiss}
                    disabled={dismissing || saving}
                >
                    {dismissing ? "..." : "Visualizzato"}
                </button>

                <button
                    className="btn"
                    type="button"
                    onClick={handleSummarize}
                    disabled={loadingSummary || saving}
                >
                    {loadingSummary ? "..." : "Riassumi (IT)"}
                </button>

                <button
                    className="btn btn-primary"
                    type="button"
                    onClick={handleSave}
                    disabled={!summary || saving}
                >
                    {saving ? "..." : "Salva"}
                </button>
            </div>


            {showOriginal && (
                <div className="post-original">
                    <h4 className="post-section-title">Testo originale</h4>
                    <pre className="post-pre">
                        {isLinkOnly ? "(nessun testo, solo link)" : originalText}
                    </pre>
                </div>
            )}

            {summary && (
                <div className="post-summary">
                    <h4 className="post-section-title">Riassunto</h4>
                    <pre className="post-pre">{summary}</pre>
                </div>
            )}
        </div>
    );
}
