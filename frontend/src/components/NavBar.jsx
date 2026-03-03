import { NavLink } from "react-router-dom";

export default function NavBar({
    subreddit,
    setSubreddit,
    onFetch,
    loading,
    isLoading,
}) {
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
                onClick={onFetch}
                disabled={isLoading || !subreddit.trim()}
            >
                {loading === "fetch" ? "Loading..." : "Fetch"}
            </button>

            <NavLink
                to="/"
                end
                className={({ isActive }) =>
                    isActive ? "button button-primary" : "button button-secondary"
                }
            >
                {loading === "new" ? "Loading..." : "Nuovi"}
            </NavLink>

            <NavLink
                to="/saved"
                className={({ isActive }) =>
                    isActive ? "button button-primary" : "button button-secondary"
                }
            >
                {loading === "saved" ? "Loading..." : "Salvati"}
            </NavLink>

            <NavLink
                to="/dismissed"
                className={({ isActive }) =>
                    isActive ? "button button-primary" : "button button-secondary"
                }
            >
                {loading === "dismissed" ? "Loading..." : "Visualizzati"}
            </NavLink>
        </div>
    );
}