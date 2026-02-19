import { useState } from "react";

function SavedCard({ item }) {
    const [showOriginal, setShowOriginal] = useState(false);

    const raw = item?.rawPost;
    const title = raw?.title || "(titolo non disponibile)";
    const originalText = raw?.selftext?.trim();
    const isLinkOnly = !originalText;

    const redditHref = raw?.permalink || raw?.url || "#";

    return (
        <div>
            <h3>{title}</h3>

            {raw && (
                <p>
                    Score: {raw.score ?? 0} — Commenti: {raw.numComments ?? 0}
                </p>
            )}

            <div>
                <a href={redditHref} target="_blank" rel="noreferrer">
                    Apri su Reddit
                </a>

                <button
                    type="button"
                    onClick={() => setShowOriginal((v) => !v)}
                    disabled={!raw}
                >
                    {showOriginal ? "Nascondi originale" : "Originale"}
                </button>
            </div>

            <div>
                <h4>Riassunto</h4>
                <pre>{item.summaryMd || "(nessun riassunto)"}</pre>
            </div>

            {showOriginal && (
                <div>
                    <h4>Testo originale</h4>
                    <pre>
                        {isLinkOnly ? "(nessun testo, solo link)" : originalText}
                    </pre>
                </div>
            )}
        </div>
    );
}

export default function SavedList({ posts }) {
    if (!posts?.length) return <p>Nessun post salvato.</p>;

    return (
        <div>
            {posts.map((item) => (
                <SavedCard key={item.id} item={item} />
            ))}
        </div>
    );
}
