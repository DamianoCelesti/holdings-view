import { NavLink } from "react-router-dom";
import { ROUTES } from "../routes/routesConfig";

export default function NavBar() {
    return (
        <div className="nav">
            {ROUTES.map((r) => (
                <NavLink
                    key={r.path}
                    to={r.path}
                    end={r.end}
                    className={({ isActive }) =>
                        isActive
                            ? "button button-primary"
                            : "button button-secondary"
                    }
                >
                    {r.label}
                </NavLink>
            ))}
        </div>
    );
}