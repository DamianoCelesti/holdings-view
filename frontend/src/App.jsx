import { useEffect, useState } from "react";
import { ingestSubreddit, getNewPosts, getSavedPosts, getDismissedPosts } from "./api";
import PostList from "./components/PostList";
import SavedList from "./components/SavedList";

export default function App() {
  const [subreddit, setSubreddit] = useState("");
  const [newPosts, setNewPosts] = useState([]);
  const [saved, setSaved] = useState([]);
  const [dismissed, setDismissed] = useState([]);
  const [view, setView] = useState("new");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNewPosts();
  }, []);

  async function loadNewPosts() {
    try {
      setLoading(true);
      const data = await getNewPosts();
      setNewPosts(data);
      setView("new");
    } catch (err) {
      console.error("Errore loadNewPosts:", err);
      alert("Errore nel caricare i post nuovi");
    } finally {
      setLoading(false);
    }
  }

  async function handleFetch() {
    if (!subreddit.trim()) return;

    try {
      setLoading(true);
      await ingestSubreddit(subreddit.trim());
      const data = await getNewPosts();
      setNewPosts(data);
      setView("new");
    } catch (err) {
      console.error("Errore Fetch:", err);
      alert("Errore durante il fetch/ingest");
    } finally {
      setLoading(false);
    }
  }

  async function loadSaved() {
    try {
      setLoading(true);
      const data = await getSavedPosts();
      setSaved(data);
      setView("saved");
    } catch (err) {
      console.error("Errore loadSaved:", err);
      alert("Errore nel caricare i post salvati");
    } finally {
      setLoading(false);
    }
  }

  async function loadDismissed() {
    try {
      setLoading(true);
      const data = await getDismissedPosts();
      setDismissed(data);
      setView("dismissed");
    } catch (err) {
      console.error("Errore loadDismissed:", err);
      alert("Errore nel caricare i visualizzati");
    } finally {
      setLoading(false);
    }
  }

  function handleRemoveNewPost(id) {
    setNewPosts((prev) => prev.filter((p) => p.id !== id));
  }

  function handleRemoveDismissedPost(id) {
    setDismissed((prev) => prev.filter((p) => p.id !== id));
  }

  function handleRemoveSavedPost(id) {
    setSaved((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="container">
      <h1>AI Reddit Dashboard</h1>

      <div className="nav">
        <input
          className="input"
          placeholder="es. stocks"
          value={subreddit}
          onChange={(e) => setSubreddit(e.target.value)}
        />

        <button className="button button-primary" onClick={handleFetch} disabled={loading || !subreddit.trim()}>
          {loading ? "Loading..." : "Fetch"}
        </button>

        <button className="button button-secondary" onClick={loadNewPosts} disabled={loading}>
          Nuovi post da vedere
        </button>

        <button className="button button-secondary" onClick={loadSaved} disabled={loading}>
          Salvati
        </button>

        <button className="button button-secondary" onClick={loadDismissed} disabled={loading}>
          Visualizzati
        </button>
      </div>

      {view === "new" && (
        <>
          <p>Post da valutare: {newPosts.length}</p>
          <PostList posts={newPosts} onRemove={handleRemoveNewPost} mode="new" />
        </>
      )}

      {view === "saved" && (
        <>
          <p>Post salvati: {saved.length}</p>
          <SavedList posts={saved} onRemove={handleRemoveSavedPost} />
        </>
      )}

      {view === "dismissed" && (
        <>
          <p>Visualizzati (recuperabili): {dismissed.length}</p>
          <PostList
            posts={dismissed}
            onRemove={handleRemoveDismissedPost}
            mode="dismissed"
          />
        </>
      )}
    </div>
  );
}