import { useState } from "react";
import { useAuthStore } from "../store/authStore.js";

export function SettingsPage() {
    const user = useAuthStore((s) => s.user);
    const tenantId = useAuthStore((s) => s.tenantId);
    const tenantName = useAuthStore((s) => s.tenantName);
    const [copied, setCopied] = useState(false);

    function copyId() {
        navigator.clipboard.writeText(tenantId);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Settings</h1>
                    <div className="page-subtitle">Your account and workspace details.</div>
                </div>
            </div>

            <div className="panel" style={{ marginBottom: 20 }}>
                <div className="panel-header">
                    <span className="panel-title">Workspace</span>
                </div>
                <div style={{ padding: 18 }}>
                    <div className="field">
                        <label>Name</label>
                        <div>{tenantName || "—"}</div>
                    </div>
                    <div className="field" style={{ marginBottom: 0 }}>
                        <label>Workspace ID</label>
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            <code style={{ fontSize: 13 }}>{tenantId}</code>
                            <button className="btn" type="button" onClick={copyId}>
                                {copied ? "Copied" : "Copy"}
                            </button>
                        </div>
                        <span className="help-text">
                            Anyone you invite will need this ID to log in, alongside their email and password.
                        </span>
                    </div>
                </div>
            </div>

            <div className="panel">
                <div className="panel-header">
                    <span className="panel-title">Your account</span>
                </div>
                <div style={{ padding: 18 }}>
                    <div className="field">
                        <label>Name</label>
                        <div>{user?.name}</div>
                    </div>
                    <div className="field">
                        <label>Email</label>
                        <div>{user?.email}</div>
                    </div>
                    <div className="field" style={{ marginBottom: 0 }}>
                        <label>Role</label>
                        <div style={{ textTransform: "capitalize" }}>{user?.role}</div>
                    </div>
                </div>
            </div>
        </>
    );
}
