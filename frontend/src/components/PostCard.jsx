import { useMemo, useState } from "react";
import {
    saveRawPost,
    dismissRawPost,
    restoreRawPost,
    deleteSavedRawPost,
} from "../api";

export default function PostCard({
    post,
    onRemove,
    mode = "new",
    isAnalyzing = false,
}) {
    const [saving, setSaving] = useState(false);
    const [dismissing, setDismissing] = useState(false);
    const [restoring, setRestoring] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showOriginal, setShowOriginal] = useState(false);

    const redditUrl = post.permalink || post.url;
    const originalText = post.selftext?.trim() || "";

    const aiDataPretty = useMemo(() => {
        if (!post.aiDataJson) return "";

        try {
            if (typeof post.aiDataJson === "string") {
                return JSON.stringify(JSON.parse(post.aiDataJson), null, 2);
            }
            return JSON.stringify(post.aiDataJson, null, 2);
        } catch (e) {
            return String(post.aiDataJson);
        }
    }, [post.aiDataJson]);

    async function handleSave() {
        try {
            setSaving(true);
            await saveRawPost(post.id, post.aiSummaryMd || "");
            onRemove?.(post.id);
        } catch (err) {
            alert(err.message || "Errore durante il salvataggio");
        } finally {
            setSaving(false);
        }
    }

    async function handleDismiss() {
        try {
            setDismissing(true);
            await dismissRawPost(post.id);
            onRemove?.(post.id);
        } catch (err) {
            alert(err.message || "Errore durante il dismiss");
        } finally {
            setDismissing(false);
        }
    }

    async function handleRestore() {
        try {
            setRestoring(true);
            await restoreRawPost(post.id);
            onRemove?.(post.id);
        } catch (err) {
            alert(err.message || "Errore durante il restore");
        } finally {
            setRestoring(false);
        }
    }

    async function handleDeleteSaved() {
        try {
            setDeleting(true);
            await deleteSavedRawPost(post.id);
            onRemove?.(post.id);
        } catch (err) {
            alert(err.message || "Errore durante la cancellazione");
        } finally {
            setDeleting(false);
        }
    }

    const showAiLoading =
        isAnalyzing &&
        mode === "new" &&
        !post.aiSummaryMd &&
        !post.aiDataJson;

    return (
        <div className={`card ${showAiLoading ? "card-analyzing" : ""}`}>
            <div className="card-header-row">
                <h3 className="card-title">{post.title}</h3>

                {showAiLoading && (
                    <span className="ai-badge">AI analyzing...</span>
                )}
            </div>

            <p className="card-meta">
                Score Reddit: {post.score ?? 0} - Commenti: {post.numComments ?? 0}
            </p>

            {showAiLoading && (
                <div className="ai-loading-wrap">
                    <div className="ai-loading-bar">
                        <div className="ai-loading-bar-inner"></div>
                    </div>

                    <div className="skeleton-lines">
                        <div className="skeleton-line skeleton-line-title"></div>
                        <div className="skeleton-line"></div>
                        <div className="skeleton-line skeleton-line-short"></div>
                    </div>
                </div>
            )}

            <div>
                <a
                    className="button button-secondary"
                    href={redditUrl}
                    target="_blank"
                    rel="noreferrer"
                >
                    Open on Reddit
                </a>

                <button
                    className="button button-secondary"
                    type="button"
                    onClick={() => setShowOriginal((v) => !v)}
                >
                    {showOriginal ? "Nascondi testo" : "Original text"}
                </button>
            </div>

            <div>
                {mode === "uncertain" && (
                    <>
                        <button
                            className="button button-primary"
                            type="button"
                            onClick={handleSave}
                            disabled={saving || dismissing}
                        >
                            {saving ? "..." : "Save"}
                        </button>

                        <button
                            className="button button-secondary"
                            type="button"
                            onClick={handleDismiss}
                            disabled={dismissing || saving}
                        >
                            {dismissing ? "..." : "Dismiss"}
                        </button>
                    </>
                )}

                {mode === "saved" && (
                    <button
                        className="button button-danger"
                        type="button"
                        onClick={handleDeleteSaved}
                        disabled={deleting}
                    >
                        {deleting ? "..." : "Delete"}
                    </button>
                )}

                {mode === "dismissed" && (
                    <button
                        className="button button-secondary"
                        type="button"
                        onClick={handleRestore}
                        disabled={restoring}
                    >
                        {restoring ? "..." : "Restore"}
                    </button>
                )}
            </div>

            {showOriginal && (
                <div className="card-content">
                    <h4>Original text</h4>
                    <pre>{originalText || "(nessun testo, solo link)"}</pre>
                </div>
            )}

            {(mode === "uncertain" || mode === "saved") && post.aiSummaryMd && (
                <div className="card-content">
                    <h4>AI Summary</h4>
                    <pre>{post.aiSummaryMd}</pre>
                </div>
            )}

            {mode === "uncertain" && aiDataPretty && (
                <div className="card-content">
                    <h4>AI Data JSON</h4>
                    <pre>{aiDataPretty}</pre>
                </div>
            )}
        </div>
    );
}