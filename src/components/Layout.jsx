import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";
import { api } from "../api/client.js";
import { RoleGate } from "./RoleGate.jsx";

const NAV_ITEMS = [
    { to: "/", label: "Dashboard", end: true },
    { to: "/files", label: "Files" },
    { to: "/users", label: "Users", roles: ["owner", "admin"] },
    { to: "/settings", label: "Settings" },
];

export function Layout() {
    const user = useAuthStore((s) => s.user);
    const tenantName = useAuthStore((s) => s.tenantName);
    const logout = useAuthStore((s) => s.logout);
    const navigate = useNavigate();

    async function handleLogout() {
        try {
            await api.post("/auth/logout");
        } catch (error) {
            console.log('error ===>>>', error);
        }
        logout();
        navigate("/login", { replace: true });
    }

    return (
        <div className="app-shell">
            <aside className="sidebar">
                <div className="sidebar-brand">Ledger</div>

                <div className="sidebar-tenant">
                    <div className="sidebar-tenant-name">{tenantName || "Your workspace"}</div>
                    <span className="sidebar-role">{user?.role}</span>
                </div>

                <nav className="sidebar-nav">
                    {NAV_ITEMS.map((item) =>
                        item.roles ? (
                            <RoleGate roles={item.roles} key={item.to}>
                                <NavLink
                                    to={item.to}
                                    end={item.end}
                                    className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
                                >
                                    {item.label}
                                </NavLink>
                            </RoleGate>
                        ) : (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
                            >
                                {item.label}
                            </NavLink>
                        )
                    )}
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user">{user?.name}</div>
                    <button className="logout-btn" onClick={handleLogout}>
                        Log out
                    </button>
                </div>
            </aside>

            <main className="main">
                <Outlet />
            </main>
        </div>
    );
}
