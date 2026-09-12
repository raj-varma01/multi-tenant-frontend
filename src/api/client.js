import axios from "axios";
import { useAuthStore } from "../store/authStore.js";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

export const api = axios.create({
    baseURL,
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const { accessToken, tenantId } = useAuthStore.getState();
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    if (tenantId) {
        config.headers["X-Tenant-ID"] = tenantId;
    }
    return config;
});

let refreshPromise = null;

api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;
        const status = error.response?.status;

        const isAuthRoute = original?.url?.includes("/auth/");
        if (status !== 401 || isAuthRoute || original._retried) {
            return Promise.reject(error);
        }

        original._retried = true;

        try {
            if (!refreshPromise) {
                refreshPromise = api.post("/auth/refresh").finally(() => {
                    refreshPromise = null;
                });
            }
            const res = await refreshPromise;
            useAuthStore.getState().setSession({
                accessToken: res.data.data.accessToken,
                user: res.data.data.user,
            });
            original.headers.Authorization = `Bearer ${res.data.data.accessToken}`;
            return api(original);
        } catch (refreshErr) {
            useAuthStore.getState().logout();
            return Promise.reject(refreshErr);
        }
    }
);
