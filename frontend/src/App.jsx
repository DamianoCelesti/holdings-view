import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "./routes/routesConfig";

import NavBar from "./components/NavBar";
import { processNew } from "./api";

export default function App() {
    const [refreshKey, setRefreshKey] = useState(0);
    const [analyzing, setAnalyzing] = useState(false);

    const [darkMode, setDarkMode] = useState(
        localStorage.getItem("theme") === "dark"
    );

    function toggleTheme() {
        if (darkMode) {
            setDarkMode(false);
        } else {
            setDarkMode(true);
        }
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

    async function handleAnalyzeFetch() {
        try {
            setAnalyzing(true);

            const result = await processNew();

            setRefreshKey(refreshKey + 1);

            alert(
                "Processati: " + result.processedCount + "\n" +
                "SAVED: " + result.savedCount + "\n" +
                "DISMISSED: " + result.dismissedCount + "\n" +
                "UNCERTAIN: " + result.uncertainCount + "\n" +
                "Errori: " + (result.errors?.length || 0)
            );

        } catch (err) {
            console.error("processNew error:", err);
            alert(err.message || "Errore durante l'analisi GPU");
        }

        setAnalyzing(false);
    }

    return (
        <div className="container">
            <h1>AI Reddit Dashboard</h1>

            <button className="theme-toggle" onClick={toggleTheme}>
                {darkMode ? "Light" : "Dark"}
            </button>

            <div className="toolbar">
                <button
                    className="button button-primary"
                    onClick={handleAnalyzeFetch}
                    disabled={analyzing}
                >
                    {analyzing ? "Analisi in corso..." : "Analyze fetch (GPU)"}
                </button>
            </div>

            <NavBar />

            <Routes>
                {ROUTES.map((r) => (
                    <Route
                        key={r.path}
                        path={r.path}
                        element={r.element({
                            refreshKey: refreshKey,
                            isAnalyzing: analyzing
                        })}
                    />
                ))}

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
}