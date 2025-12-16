import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../shared/api";

function formatIT(iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString("it-IT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

export default function Home() {
    const [data, setData] = useState(null);
    const [err, setErr] = useState(null);

    useEffect(() => {
        api.getAllEvents()
            .then((r) => {
                r.events = [...r.events].sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
                setData(r);
            })
            .catch(() => setErr("Errore nel caricare /mocks/live/ALL.json"));
    }, []);

    if (err) return <div className="card"><p style={{ color: "red" }}>{err}</p></div>;
    if (!data) return <div className="card"><p>Loading...</p></div>;

    return (
        <div className="card">
            <h2>Tutte le compravendite (mock)</h2>
            <p className="muted">Ultimo update: {formatIT(data.updatedAt)}</p>

            <div className="feed">
                {data.events.map(ev => (
                    <div key={ev.id} className="feed-item">
                        <div className="feed-top">
                            <span className={`badge badge-${ev.type}`}>{ev.type}</span>
                            <span className="muted">{formatIT(ev.datetime)}</span>
                        </div>

                        <div className="feed-main">

                            <Link className="big-link" to={`/ticker/${encodeURIComponent(ev.big)}`}>
                                <strong>{ev.big}</strong>
                            </Link>
                            {" "}→{" "}
                            <strong>{ev.small}</strong>
                        </div>

                        <div className="muted">{ev.note}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
