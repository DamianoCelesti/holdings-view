import { useEffect, useState } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";

import {
  ingestSubreddit,
  getNewPosts,
  getSavedPosts,
  getDismissedPosts,
} from "./api";

import PostList from "./components/PostList";
import SavedList from "./components/SavedList";
import NavBar from "./components/NavBar";

export default function App() {
  const location = useLocation();

  const [subreddit, setSubreddit] = useState("");

  const [postsByPage, setPostsByPage] = useState({
    new: [],
    saved: [],
    dismissed: [],
  });

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

  function getPageKey(pathname) {
    if (pathname === "/") return "new";
    if (pathname === "/saved") return "saved";
    if (pathname === "/dismissed") return "dismissed";
    return null;
  }

  async function loadPage(pageKey) {
    try {
      setLoading(pageKey);

      let data = [];
      if (pageKey === "new") data = await getNewPosts();
      if (pageKey === "saved") data = await getSavedPosts();
      if (pageKey === "dismissed") data = await getDismissedPosts();

      setPostsByPage((prev) => ({ ...prev, [pageKey]: data }));
    } catch (err) {
      console.error("loadPage error:", err);
      alert("Errore nel caricare i post");
    } finally {
      setLoading("");
    }
  }

  useEffect(() => {
    const pageKey = getPageKey(location.pathname);
    if (pageKey) loadPage(pageKey);

  }, [location.pathname]);

  async function handleFetch() {
    const cleanSubreddit = subreddit.trim();
    if (!cleanSubreddit) return;

    try {
      setLoading("fetch");
      await ingestSubreddit(cleanSubreddit);

      const data = await getNewPosts();
      setPostsByPage((prev) => ({ ...prev, new: data }));
    } catch (err) {
      console.error("handleFetch error:", err);
      alert("Errore durante il fetch/ingest");
    } finally {
      setLoading("");
    }
  }

  function removeFromPage(pageKey, id) {
    setPostsByPage((prev) => ({
      ...prev,
      [pageKey]: prev[pageKey].filter((p) => p.id !== id),
    }));
  }

  const newPosts = postsByPage.new;
  const savedPosts = postsByPage.saved;
  const dismissedPosts = postsByPage.dismissed;

  return (
    <div className="container">
      <button className="theme-toggle" onClick={toggleDarkMode}>
        {dark ? "☀️" : "🌙"}
      </button>

      <h1>AI Reddit Dashboard</h1>

      <NavBar
        subreddit={subreddit}
        setSubreddit={setSubreddit}
        onFetch={handleFetch}
        loading={loading}
        isLoading={isLoading}
      />

      <Routes>
        <Route
          path="/"
          element={
            <>
              <p>Post da valutare: {newPosts.length}</p>
              <PostList
                posts={newPosts}
                onRemove={(id) => removeFromPage("new", id)}
                mode="new"
              />
            </>
          }
        />

        <Route
          path="/saved"
          element={
            <>
              <p>Post salvati: {savedPosts.length}</p>
              <SavedList
                posts={savedPosts}
                onRemove={(id) => removeFromPage("saved", id)}
              />
            </>
          }
        />

        <Route
          path="/dismissed"
          element={
            <>
              <p>Visualizzati (recuperabili): {dismissedPosts.length}</p>
              <PostList
                posts={dismissedPosts}
                onRemove={(id) => removeFromPage("dismissed", id)}
                mode="dismissed"
              />
            </>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}