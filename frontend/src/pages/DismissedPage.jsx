import { useEffect, useState } from "react";
import { getDismissedPosts } from "../api";
import PostList from "../components/PostList";

export default function DismissedPage() {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        load();
    }, []);

    async function load() {
        try {
            const data = await getDismissedPosts();
            setPosts(data);
        } catch (err) {
            console.error("getDismissedPosts error:", err);
            alert("Errore nel caricare i visualizzati");
        }
    }

    function removeFromList(id) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
    }

    return (
        <>
            <p>Visualizzati (recuperabili): {posts.length}</p>
            <PostList posts={posts} onRemove={removeFromList} mode="dismissed" />
        </>
    );
}