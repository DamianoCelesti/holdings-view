import { NavLink, useNavigate } from "react-router-dom";
import { ingestSubreddit } from "../api";

export default function NavBar({ subreddit, setSubreddit, onFetched }) {
    const navigate = useNavigate();

    async function handleFetch() {
        const clean = subreddit.trim();
        if (!clean) return;

        try {
            await ingestSubreddit(clean);


            navigate("/");


            onFetched?.();
        } catch (err) {
            console.error("fetch/ingest error:", err);
            alert("Errore durante il fetch/ingest");
        }
    }

    return (
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
                disabled={!subreddit.trim()}
            >
                Fetch
            </button>

            <NavLink
                to="/"
                end
                className={({ isActive }) =>
                    isActive ? "button button-primary" : "button button-secondary"
                }
            >
                Nuovi
            </NavLink>

            <NavLink
                to="/saved"
                className={({ isActive }) =>
                    isActive ? "button button-primary" : "button button-secondary"
                }
            >
                Salvati
            </NavLink>

            <NavLink
                to="/dismissed"
                className={({ isActive }) =>
                    isActive ? "button button-primary" : "button button-secondary"
                }
            >
                Visualizzati
            </NavLink>
        </div>
    );
}