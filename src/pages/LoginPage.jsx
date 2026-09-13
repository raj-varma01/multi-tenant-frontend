import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuthStore } from "../store/authStore.js";

export function LoginPage() {
    const [mode, setMode] = useState("login");
    const navigate = useNavigate();
    const location = useLocation();
    const setSession = useAuthStore((s) => s.setSession);
    const setTenantId = useAuthStore((s) => s.setTenantId);
    const storedTenantId = useAuthStore((s) => s.tenantId);

    const [form, setForm] = useState({
        tenantId: storedTenantId || "",
        tenantName: "",
        name: "",
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    function update(field) {
        return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            if (mode === "register") {
                const res = await api.post("/auth/register", {
                    tenantName: form.tenantName,
                    name: form.name,
                    email: form.email,
                    password: form.password,
                });
                setTenantId(res.data.data.tenant.id);
                setSession({
                    accessToken: res.data.data.accessToken,
                    user: res.data.data.user,
                    tenant: res.data.data.tenant,
                });
            } else {
                setTenantId(form.tenantId);
                const res = await api.post(
                    "/auth/login",
                    { email: form.email, password: form.password },
                    { headers: { "X-Tenant-ID": form.tenantId } }
                );
                setSession({ accessToken: res.data.data.accessToken, user: res.data.data.user });
            }
            const redirectTo = location.state?.from?.pathname || "/";
            navigate(redirectTo, { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-shell">
            <div className="login-card">
                <div className="login-brand">Tenant Organiser</div>

                <div className="login-mode-toggle">
                    <button
                        type="button"
                        className={mode === "login" ? "active" : ""}
                        onClick={() => setMode("login")}
                    >
                        Log in
                    </button>
                    <button
                        type="button"
                        className={mode === "register" ? "active" : ""}
                        onClick={() => setMode("register")}
                    >
                        Create workspace
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {mode === "register" && (
                        <>
                            <div className="field">
                                <label htmlFor="tenantName">Workspace name</label>
                                <input
                                    id="tenantName"
                                    value={form.tenantName}
                                    onChange={update("tenantName")}
                                    placeholder="Enter workspace name"
                                    required
                                />
                            </div>
                            <div className="field">
                                <label htmlFor="name">Your name</label>
                                <input id="name" value={form.name} onChange={update("name")} required />
                            </div>
                        </>
                    )}

                    {mode === "login" && (
                        <div className="field">
                            <label htmlFor="tenantId">Workspace ID</label>
                            <input
                                id="tenantId"
                                value={form.tenantId}
                                onChange={update("tenantId")}
                                placeholder="Given to you when your workspace was created"
                                required
                            />
                        </div>
                    )}

                    <div className="field">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={form.email}
                            onChange={update("email")}
                            required
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={form.password}
                            onChange={update("password")}
                            minLength={8}
                            required
                        />
                    </div>

                    {error && <div className="error-text">{error}</div>}

                    <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
                        {loading ? "Please wait…" : mode === "register" ? "Create workspace" : "Log in"}
                    </button>
                </form>

                {mode === "login" && (
                    <p className="help-text" style={{ marginTop: 16 }}>
                        Don't have a workspace yet? Switch to "Create workspace" above.
                    </p>
                )}
            </div>
        </div>
    );
}
