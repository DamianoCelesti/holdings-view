import { useEffect, useState } from "react";
import { getUncertainPosts } from "../api";
import PostList from "../components/PostList";

export default function UncertainPage({ refreshKey }) {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        async function loadUncertain() {
            try {
                const res = await getUncertainPosts();
                setPosts(res);
            } catch (e) {
                console.error(e);
                alert("Errore nel caricare i post incerti");
            }
        }

        loadUncertain();
    }, [refreshKey]);

    function removeFromList(id) {
        const filtered = posts.filter((p) => p.id !== id);
        setPosts(filtered);
    }

    return (
        <>
            <p>Post UNCERTAIN: {posts.length}</p>
            <PostList posts={posts} onRemove={removeFromList} mode="uncertain" />
        </>
    );
}