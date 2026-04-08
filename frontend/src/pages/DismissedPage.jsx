import { useEffect, useState } from "react";
import { getDismissedPosts } from "../api";
import PostList from "../components/PostList";

export default function DismissedPage({ refreshKey }) {
    const [posts, setPosts] = useState([]);
    const [offset, setOffset] = useState(0);
    const [loading, setLoading] = useState(false);

    const limit = 10;

    async function loadDismissedPosts() {
        if (loading) return;

        try {
            setLoading(true);

            const data = await getDismissedPosts(limit, offset);

            setPosts((prev) => [...prev, ...data]);
            setOffset((prev) => prev + data.length);
        } catch (err) {
            console.error("getDismissedPosts error:", err);
            alert("Errore nel caricamento dei post scartati");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        setPosts([]);
        setOffset(0);
        loadDismissedPosts();
    }, [refreshKey]);

    useEffect(() => {
        function handleScroll() {
            const nearBottom =
                window.innerHeight + window.scrollY >=
                document.body.offsetHeight - 300;

            if (nearBottom) {
                loadDismissedPosts();
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
            <p>Post DISMISSED: {posts.length}</p>

            <PostList
                posts={posts}
                onRemove={removeFromList}
                mode="dismissed"
            />

            {loading && <p>Loading...</p>}
        </>
    );
}