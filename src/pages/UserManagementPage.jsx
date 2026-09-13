import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore.js";

const ROLES = ["owner", "admin", "editor", "viewer"];

export function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const currentUserId = useAuthStore((s) => s.user?.id);

    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("viewer");
    const [inviteResult, setInviteResult] = useState(null);
    const [inviteError, setInviteError] = useState("");

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Users</h1>
                    <div className="page-subtitle">Manage who has access to this workspace and what they can do.</div>
                </div>
            </div>

            <div className="panel" style={{ marginBottom: 20 }}>
                <div className="panel-header">
                    <span className="panel-title">Invite someone</span>
                </div>
                <form onSubmit={handleInvite} style={{ padding: 18, display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
                    <div className="field" style={{ margin: 0, minWidth: 220 }}>
                        <label htmlFor="inviteEmail">Email</label>
                        <input
                            id="inviteEmail"
                            type="email"
                            required
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                        />
                    </div>
                    <div className="field" style={{ margin: 0 }}>
                        <label htmlFor="inviteRole">Role</label>
                        <select id="inviteRole" value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                            {ROLES.map((r) => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>
                    <button className="btn btn-primary" type="submit">Send invite</button>
                </form>

                {inviteError && <div className="error-text" style={{ padding: "0 18px 16px" }}>{inviteError}</div>}
                {inviteResult && (
                    <div style={{ padding: "0 18px 18px" }}>
                        <div className="help-text">
                            No email provider is configured for this project — share this link with the invitee manually
                            (valid for {inviteResult.expiresIn}):
                        </div>
                        <code style={{ display: "block", marginTop: 6, wordBreak: "break-all", fontSize: 12 }}>
                            {inviteResult.inviteLink}
                        </code>
                    </div>
                )}
            </div>

            <div className="panel">
                <div className="panel-header">
                    <span className="panel-title">Members</span>
                </div>

                {error && <div className="error-text" style={{ padding: 18 }}>{error}</div>}

                {!error && (loading ? (
                    <div className="empty-state">Loading users…</div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user._id}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <RoleGate
                                            roles={["owner"]}
                                            fallback={<span style={{ textTransform: "capitalize" }}>{user.role}</span>}
                                        >
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user, e.target.value)}
                                                disabled={user._id === currentUserId}
                                                title={user._id === currentUserId ? "You can't change your own role here" : ""}
                                            >
                                                {ROLES.map((r) => (
                                                    <option key={r} value={r}>{r}</option>
                                                ))}
                                            </select>
                                        </RoleGate>
                                    </td>
                                    <td style={{ textTransform: "capitalize" }}>{user.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ))}
            </div>
        </>
    );
}
