import { useEffect, useState } from "react";
import { getUncertainPosts } from "../api";
import PostList from "../components/PostList";

export default function UncertainPage({ refreshKey }) {
    const [posts, setPosts] = useState([]);
    const [offset, setOffset] = useState(0);
    const [loading, setLoading] = useState(false);

    const limit = 10;

    async function loadUncertainPosts() {
        if (loading) return;

        try {
            setLoading(true);

            const data = await getUncertainPosts(limit, offset);

            setPosts((prev) => [...prev, ...data]);
            setOffset((prev) => prev + data.length);
        } catch (err) {
            console.error("getUncertainPosts error:", err);
            alert("Errore nel caricare i post incerti");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        setPosts([]);
        setOffset(0);
        loadUncertainPosts();
    }, [refreshKey]);

    useEffect(() => {
        function handleScroll() {
            const nearBottom =
                window.innerHeight + window.scrollY >=
                document.body.offsetHeight - 300;

            if (nearBottom) {
                loadUncertainPosts();
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
            <p>Post UNCERTAIN: {posts.length}</p>

            <PostList
                posts={posts}
                onRemove={removeFromList}
                mode="uncertain"
            />

            {loading && <p>Loading...</p>}
        </>
    );
}