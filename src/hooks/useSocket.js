import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAuthStore } from "../store/authStore.js";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export function useFileEvents({ onProcessed, onFailed }) {
    const accessToken = useAuthStore((s) => s.accessToken);
    const socketRef = useRef(null);
    const handlersRef = useRef({ onProcessed, onFailed });
    handlersRef.current = { onProcessed, onFailed };

    useEffect(() => {
        if (!accessToken) return;

        const socket = io(SOCKET_URL, {
            auth: { token: accessToken },
            transports: ["websocket"],
            reconnectionAttempts: 5,
        });
        socketRef.current = socket;

        socket.on("file:processed", (payload) => handlersRef.current.onProcessed?.(payload));
        socket.on("file:failed", (payload) => handlersRef.current.onFailed?.(payload));
        socket.on("connect_error", () => {
        });

        return () => {
            socket.disconnect();
        };
    }, [accessToken]);
}
