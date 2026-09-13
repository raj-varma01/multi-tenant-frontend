import { useAuthStore } from "../store/authStore.js";

export function RoleGate({ roles, children, fallback = null }) {
    const hasRole = useAuthStore((s) => s.hasRole);
    if (!hasRole(...roles)) return fallback;
    return children;
}
