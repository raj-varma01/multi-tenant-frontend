import { create } from "zustand";

const TENANT_STORAGE_KEY = "saas.lastTenantId";

export const useAuthStore = create((set, get) => ({
    accessToken: null,
    user: null,
    tenantId: sessionStorage.getItem(TENANT_STORAGE_KEY) || null,
    tenantName: null,
    hydrated: false,

    setTenantId: (tenantId) => {
        sessionStorage.setItem(TENANT_STORAGE_KEY, tenantId || "");
        set({ tenantId });
    },

    setSession: ({ accessToken, user, tenant }) => {
        if (tenant) {
            sessionStorage.setItem(TENANT_STORAGE_KEY, tenant.id);
        }
        set({
            accessToken,
            user,
            tenantId: tenant?.id || user?.tenantId || get().tenantId,
            tenantName: tenant?.name ?? get().tenantName,
        });
    },

    setHydrated: (hydrated) => set({ hydrated }),

    logout: () => {
        set({ accessToken: null, user: null });
    },

    isAuthenticated: () => !!get().accessToken && !!get().user,

    hasRole: (...roles) => {
        const role = get().user?.role;
        return role ? roles.map((r) => r.toLowerCase()).includes(role.toLowerCase()) : false;
    },
}));
