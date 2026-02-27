import { useEffect, useState } from "react";
import {
  ingestSubreddit,
  getNewPosts,
  getSavedPosts,
  getDismissedPosts,
} from "./api";

import PostList from "./components/PostList";
import SavedList from "./components/SavedList";

export default function App() {
  const [subreddit, setSubreddit] = useState("");

  const [newPosts, setNewPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [dismissedPosts, setDismissedPosts] = useState([]);

  const [view, setView] = useState("new");
  const [loading, setLoading] = useState("");
  const [dark, setDark] = useState(false);

  const isLoading = loading !== "";

  function toggleDarkMode() {
    setDark((prev) => {
      const next = !prev;
      document.body.classList.toggle("dark", next);
      return next;
    });
  }

  useEffect(() => {
    loadNewPosts();
  }, []);

  async function loadNewPosts() {
    try {
      setLoading("new");
      const data = await getNewPosts();
      setNewPosts(data);
      setView("new");
    } catch (err) {
      console.error("loadNewPosts error:", err);
      alert("Errore nel caricare i post nuovi");
    } finally {
      setLoading("");
    }
  }

  async function loadSavedPosts() {
    try {
      setLoading("saved");
      const data = await getSavedPosts();
      setSavedPosts(data);
      setView("saved");
    } catch (err) {
      console.error("loadSavedPosts error:", err);
      alert("Errore nel caricare i post salvati");
    } finally {
      setLoading("");
    }
  }

  async function loadDismissedPosts() {
    try {
      setLoading("dismissed");
      const data = await getDismissedPosts();
      setDismissedPosts(data);
      setView("dismissed");
    } catch (err) {
      console.error("loadDismissedPosts error:", err);
      alert("Errore nel caricare i visualizzati");
    } finally {
      setLoading("");
    }
  }

  async function handleFetch() {
    const cleanSubreddit = subreddit.trim();
    if (!cleanSubreddit) return;

    try {
      setLoading("fetch");
      await ingestSubreddit(cleanSubreddit);

      const data = await getNewPosts();
      setNewPosts(data);
      setView("new");
    } catch (err) {
      console.error("handleFetch error:", err);
      alert("Errore durante il fetch/ingest");
    } finally {
      setLoading("");
    }
  }

  function removeFromNew(id) {
    setNewPosts((prev) => prev.filter((p) => p.id !== id));
  }

  function removeFromSaved(id) {
    setSavedPosts((prev) => prev.filter((p) => p.id !== id));
  }

  function removeFromDismissed(id) {
    setDismissedPosts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="container">
      <button className="theme-toggle" onClick={toggleDarkMode}>
        {dark ? "☀️" : "🌙"}
      </button>

      <h1>AI Reddit Dashboard</h1>

      <div className="nav">
        <input
          className="input"
          placeholder="es. stocks"
          value={subreddit}
          onChange={(e) => setSubreddit(e.target.value)}
        />

        <button
          className="button button-primary"
          onClick={handleFetch}
          disabled={isLoading || !subreddit.trim()}
        >
          {loading === "fetch" ? "Loading..." : "Fetch"}
        </button>

        <button
          className="button button-secondary"
          onClick={loadNewPosts}
          disabled={isLoading}
        >
          {loading === "new" ? "Loading..." : "Nuovi post da vedere"}
        </button>

        <button
          className="button button-secondary"
          onClick={loadSavedPosts}
          disabled={isLoading}
        >
          {loading === "saved" ? "Loading..." : "Salvati"}
        </button>

        <button
          className="button button-secondary"
          onClick={loadDismissedPosts}
          disabled={isLoading}
        >
          {loading === "dismissed" ? "Loading..." : "Visualizzati"}
        </button>
      </div>

      {view === "new" && (
        <>
          <p>Post da valutare: {newPosts.length}</p>
          <PostList posts={newPosts} onRemove={removeFromNew} mode="new" />
        </>
      )}

      {view === "saved" && (
        <>
          <p>Post salvati: {savedPosts.length}</p>
          <SavedList posts={savedPosts} onRemove={removeFromSaved} />
        </>
      )}

      {view === "dismissed" && (
        <>
          <p>Visualizzati (recuperabili): {dismissedPosts.length}</p>
          <PostList
            posts={dismissedPosts}
            onRemove={removeFromDismissed}
            mode="dismissed"
          />
        </>
      )}
    </div>
  );
}