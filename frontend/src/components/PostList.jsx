import PostCard from "./PostCard";

export default function PostList({ posts, onRemove }) {
    if (!posts.length) return <p>Nessun post.</p>;

    return (
        <div>
            {posts.map((post) => (
                <PostCard key={post.id} post={post} onRemove={onRemove} />
            ))}
        </div>
    );
}
