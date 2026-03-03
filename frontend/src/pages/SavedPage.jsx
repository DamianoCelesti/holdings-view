import { useEffect, useState } from "react";
import { getSavedPosts } from "../api";
import SavedList from "../components/SavedList";

export default function SavedPage() {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        load();
    }, []);

    async function load() {
        try {
            const data = await getSavedPosts();
            setPosts(data);
        } catch (err) {
            console.error("getSavedPosts error:", err);
            alert("Errore nel caricare i post salvati");
        }
    }

    function removeFromList(id) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
    }

    return (
        <>
            <p>Post salvati: {posts.length}</p>
            <SavedList posts={posts} onRemove={removeFromList} />
        </>
    );
}