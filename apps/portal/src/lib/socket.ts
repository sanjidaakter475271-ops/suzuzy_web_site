"use client";

import { io } from "socket.io-client";

// In production, it uses the same origin. In development, we fallback to localhost:3000
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || (typeof window !== "undefined" ? window.location.origin : "http://127.0.0.1:3001");

export const socket = io(SOCKET_URL, {
    autoConnect: false,
    transports: ["polling", "websocket"],
    path: "/socket.io/"
});
