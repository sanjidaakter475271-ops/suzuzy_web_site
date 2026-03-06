"use client";

import { io } from "socket.io-client";

// MUST point to the realtime server, NOT the portal itself
// In production: https://royal-suzuky-realtime.onrender.com
// In local dev: http://localhost:3001
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

export const socket = io(SOCKET_URL, {
    autoConnect: false,
    transports: ["websocket", "polling"],
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
