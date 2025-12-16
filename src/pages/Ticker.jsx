import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
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

export default function Ticker() {
    const { symbol } = useParams();
    const big = decodeURIComponent(symbol);

    const [events, setEvents] = useState([]);
    const [err, setErr] = useState(null);

    useEffect(() => {
        api.getAllEvents()
            .then((r) => {
                const filtered = r.events
                    .filter(e => e.big === big)
                    .sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
                setEvents(filtered);
            })
            .catch(() => setErr("Errore nel caricare /mocks/live/ALL.json"));
    }, [big]);

    if (err) return <div className="card"><p style={{ color: "red" }}>{err}</p></div>;

    return (
        <div className="card">
            <h2>History: {big}</h2>
            <p className="muted"><Link to="/">← Torna alla home</Link></p>

            {events.length === 0 ? (
                <p className="muted">Nessun evento per {big}.</p>
            ) : (
                <div className="feed">
                    {events.map(ev => (
                        <div key={ev.id} className="feed-item">
                            <div className="feed-top">
                                <span className={`badge badge-${ev.type}`}>{ev.type}</span>
                                <span className="muted">{formatIT(ev.datetime)}</span>
                            </div>

                            <div className="feed-main">
                                <strong>{ev.big}</strong> → <strong>{ev.small}</strong>
                            </div>

                            <div className="muted">{ev.note}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
