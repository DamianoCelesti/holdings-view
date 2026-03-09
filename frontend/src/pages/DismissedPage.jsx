import { useEffect, useState } from "react";
import { getDismissedPosts } from "../api";
import PostList from "../components/PostList";

export default function DismissedPage({ refreshKey }) {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        async function getDismissed() {
            try {
                const res = await getDismissedPosts();
                setPosts(res);
            } catch (e) {
                console.error(e);
                alert("Errore nel caricamento dei post scartati");
            }
        }

        getDismissed();
    }, [refreshKey]);

    function removeFromList(id) {
        const filtered = posts.filter((p) => p.id !== id);
        setPosts(filtered);
    }

    return (
        <div>
            <p>Post DISMISSED: {posts.length}</p>
            <PostList posts={posts} onRemove={removeFromList} mode="dismissed" />
        </div>
    );
}