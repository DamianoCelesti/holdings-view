import { useEffect, useState } from "react";
import { getNewPosts } from "../api";
import PostList from "../components/PostList";

export default function NewPage({ refreshKey, isAnalyzing }) {
    const [posts, setPosts] = useState([]);
    const [offset, setOffset] = useState(0);
    const [loading, setLoading] = useState(false);

    const limit = 10;

    async function loadNewPosts() {
        if (loading) return;

        try {
            setLoading(true);

            const data = await getNewPosts(limit, offset);

            setPosts((prev) => [...prev, ...data]);
            setOffset((prev) => prev + data.length);
        } catch (err) {
            console.error("getNewPosts error:", err);
            alert("Errore nel caricare i post nuovi");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        setPosts([]);
        setOffset(0);
        loadNewPosts();
    }, [refreshKey]);

    useEffect(() => {
        function handleScroll() {
            const nearBottom =
                window.innerHeight + window.scrollY >=
                document.body.offsetHeight - 300;

            if (nearBottom) {
                loadNewPosts();
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
            <p>Post NEW: {posts.length}</p>

            <PostList
                posts={posts}
                onRemove={removeFromList}
                mode="new"
                isAnalyzing={isAnalyzing}
            />

            {loading && <p>Loading...</p>}
        </>
    );
}