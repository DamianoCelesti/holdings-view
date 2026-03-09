import { useEffect, useState } from "react";
import { getNewPosts } from "../api";
import PostList from "../components/PostList";

export default function NewPage({ refreshKey, isAnalyzing }) {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        async function loadNewPosts() {
            try {
                const data = await getNewPosts();
                setPosts(data);
            } catch (err) {
                console.error("getNewPosts error:", err);
                alert("Errore nel caricare i post nuovi");
            }
        }

        loadNewPosts();
    }, [refreshKey]);

    function removeFromList(id) {
        setPosts(posts.filter((p) => p.id !== id));
    }

    return (
        <>
            <p>Post NEW: {posts.length}</p>
            <PostList posts={posts} onRemove={removeFromList} mode="new" isAnalyzing={isAnalyzing} />
        </>
    );
}