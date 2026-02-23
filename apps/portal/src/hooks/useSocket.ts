"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./useAuth";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

export function useSocket() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const { user } = useAuth();
    const headersRef = useRef<{ Authorization?: string } | null>(null);

    useEffect(() => {
        // Prevent creating multiple sockets or reconnecting if auth hasn't changed
        if (!user) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        // If socket exists and token (auth) is same, do nothing (optional optimization)
        // But typically we just create once per mount or user change

        // Dynamically determine the socket URL
        let finalSocketUrl = SOCKET_URL;

        // If we're in the browser and the URL is pointed to localhost, 
        // but we're accessing the site via an IP or another host, swap it.
        if (typeof window !== 'undefined' && finalSocketUrl.includes('localhost') && window.location.hostname !== 'localhost') {
            finalSocketUrl = finalSocketUrl.replace('localhost', window.location.hostname);
        }

        const socketInstance = io(finalSocketUrl, {
            path: '/socket.io/',
            transports: ['websocket', 'polling'],
            auth: {
                token: typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '',
            },
            reconnectionAttempts: 5,
            timeout: 10000
        });

        socketInstance.on("connect", () => {
            console.log("Socket connected:", socketInstance.id);
            setIsConnected(true);

            // Auto-join user room
            if (user.id) {
                socketInstance.emit("join:user", user.id);
            }
            // Auto-join dealer room
            if (user.dealer_id || user.dealer?.id) {
                const dealerId = user.dealer_id || user.dealer?.id;
                socketInstance.emit("join:dealer", dealerId);
            }
        });

        socketInstance.on("disconnect", () => {
            console.log("Socket disconnected");
            setIsConnected(false);
        });

        socketInstance.on("connect_error", (err) => {
            console.error("Socket error:", err.message);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [user?.id, user?.dealer_id]); // Re-connect only if user changes

    return { socket, isConnected };
}
