import { useEffect, useState } from "react";
import { getNewPosts } from "../api";
import PostList from "../components/PostList";

export default function NewPage({ refreshKey }) {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        load();

    }, [refreshKey]);

    async function load() {
        try {
            const data = await getNewPosts();
            setPosts(data);
        } catch (err) {
            console.error("getNewPosts error:", err);
            alert("Errore nel caricare i post nuovi");
        }
    }

    function removeFromList(id) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
    }

    return (
        <>
            <p>Post da valutare: {posts.length}</p>
            <PostList posts={posts} onRemove={removeFromList} mode="new" />
        </>
    );
}