import { useEffect, useState } from "react";
import { getSavedRawPosts } from "../api";
import PostList from "../components/PostList";

export default function SavedPage({ refreshKey }) {
    const [posts, setPosts] = useState([]);
    const [offset, setOffset] = useState(0);
    const [loading, setLoading] = useState(false);

    const limit = 10;

    async function loadSavedPosts() {
        if (loading) return;

        try {
            setLoading(true);

            const data = await getSavedRawPosts(limit, offset);

            setPosts((prev) => [...prev, ...data]);
            setOffset((prev) => prev + data.length);
        } catch (err) {
            console.error("getSavedRawPosts error:", err);
            alert("Errore nel caricare i post salvati");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        setPosts([]);
        setOffset(0);
        loadSavedPosts();
    }, [refreshKey]);

    useEffect(() => {
        function handleScroll() {
            const nearBottom =
                window.innerHeight + window.scrollY >=
                document.body.offsetHeight - 300;

            if (nearBottom) {
                loadSavedPosts();
            }
        }

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [offset, loading]);

    function removeFromList(id) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
    }

    return (
        <>
            <p>Post SAVED: {posts.length}</p>

            <PostList
                posts={posts}
                onRemove={removeFromList}
                mode="saved"
            />

            {loading && <p>Loading...</p>}
        </>
    );
}