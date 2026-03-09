import { useEffect, useState } from "react";
import { getSavedRawPosts } from "../api";
import PostList from "../components/PostList";

export default function SavedPage({ refreshKey }) {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        async function fetchSaved() {
            try {
                const res = await getSavedRawPosts();
                setPosts(res);
            } catch (e) {
                console.error(e);
                alert("Errore nel caricare i post salvati");
            }
        }

        fetchSaved();
    }, [refreshKey]);

    function removeFromList(id) {
        const filtered = posts.filter((p) => p.id !== id);
        setPosts(filtered);
    }

    return (
        <>
            <p>Post SAVED: {posts.length}</p>
            <PostList posts={posts} onRemove={removeFromList} mode="saved" />
        </>
    );
}