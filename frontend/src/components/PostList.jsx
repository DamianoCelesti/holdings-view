import PostCard from "./PostCard";

export default function PostList({
    posts = [],
    onRemove,
    mode = "new",
    isAnalyzing = false,
}) {
    if (!posts.length) {
        return <p>Nessun post da mostrare.</p>;
    }

    return (
        <div>
            {posts.map((post) => (
                <PostCard
                    key={post.id}
                    post={post}
                    onRemove={onRemove}
                    mode={mode}
                    isAnalyzing={isAnalyzing}
                />
            ))}
        </div>
    );
}