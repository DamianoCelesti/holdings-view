import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import NavBar from "./components/NavBar";
import NewPage from "./pages/NewPage";
import SavedPage from "./pages/SavedPage";
import DismissedPage from "./pages/DismissedPage";

export default function App() {
  const [subreddit, setSubreddit] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  function handleFetched() {
    setRefreshKey((k) => k + 1);
  }

  function toggleTheme() {
    setDarkMode((v) => !v);
  }

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <div className="container">
      <h1>AI Reddit Dashboard</h1>

      <button className="theme-toggle" onClick={toggleTheme}>
        {darkMode ? "Light" : "Dark"}
      </button>

      <NavBar
        subreddit={subreddit}
        setSubreddit={setSubreddit}
        onFetched={handleFetched}
      />

      <Routes>
        <Route path="/" element={<NewPage refreshKey={refreshKey} />} />
        <Route path="/saved" element={<SavedPage />} />
        <Route path="/dismissed" element={<DismissedPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}