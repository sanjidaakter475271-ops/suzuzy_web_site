"use client";

import { io } from "socket.io-client";

// In production, it uses the same origin. In development, we fallback to localhost:3000
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || (typeof window !== "undefined" ? window.location.origin : "http://127.0.0.1:3001");

export const socket = io(SOCKET_URL, {
    autoConnect: false,
    transports: ["polling", "websocket"],
    path: "/socket.io/"
});

// Auto-join relevant rooms on connection
socket.on("connect", () => {
    // Try to get user context from session storage (set by auth flow)
    if (typeof window !== "undefined") {
        const dealerId = sessionStorage.getItem("dealerId");
        const staffId = sessionStorage.getItem("serviceStaffId");
        const userId = sessionStorage.getItem("userId");

        if (dealerId) {
            socket.emit("join:dealer", dealerId);
        }
        if (staffId) {
            socket.emit("join:technician", staffId);
        }
        if (userId) {
            socket.emit("join:user", userId);
        }
    }
});
