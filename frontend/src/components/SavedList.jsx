import { deleteSavedPost } from "../api";

export default function SavedList({ posts = [], onRemove }) {
    async function handleDelete(id) {
        try {
            await deleteSavedPost(id);
            onRemove?.(id);
        } catch (err) {
            alert("Errore durante l'eliminazione");
        }
    }

    if (!posts.length) {
        return <p>Nessun post salvato.</p>;
    }

    return (
        <div>
            {posts.map((post) => {
                const raw = post.rawPost;
                const redditUrl = raw?.permalink || raw?.url || "";

                return (
                    <div key={post.id} className="card">
                        <h3 className="card-title">{raw?.title}</h3>

                        <div>
                            <a href={redditUrl} target="_blank" rel="noreferrer">
                                Apri su Reddit
                            </a>

                            <button
                                className="button button-secondary"
                                onClick={() => handleDelete(post.id)}
                            >
                                Elimina
                            </button>
                        </div>

                        {post.summaryMd && (
                            <div className="card-content">
                                <h4>Riassunto</h4>
                                <pre>{post.summaryMd}</pre>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}