import { Link } from "react-router-dom";

export function NotFoundPage() {
    return (
        <div className="center-page">
            <h1 style={{ fontSize: 40 }}>404</h1>
            <p style={{ color: "var(--ink-muted)" }}>That page doesn't exist.</p>
            <Link className="btn btn-primary" to="/">Back to dashboard</Link>
        </div>
    );
}
