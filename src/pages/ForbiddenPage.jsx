import { useNavigate } from "react-router-dom";

export function ForbiddenPage() {
    const navigate = useNavigate();
    return (
        <div className="center-page">
            <h1 style={{ fontSize: 40 }}>403</h1>
            <p style={{ color: "var(--ink-muted)", maxWidth: 360 }}>
                Your role doesn't have access to this page. If you think that's wrong, ask a workspace
                owner or admin to check your permissions.
            </p>
            <button className="btn btn-primary" onClick={() => navigate("/")}>
                Back to dashboard
            </button>
        </div>
    );
}
