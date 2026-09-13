import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";

export function ProtectedRoute({ roles, children }) {
    const location = useLocation();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
    const hasRole = useAuthStore((s) => s.hasRole);
    const hydrated = useAuthStore((s) => s.hydrated);

    if (!hydrated) return null;

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (roles && !hasRole(...roles)) {
        return <Navigate to="/403" replace />;
    }

    return children;
}
