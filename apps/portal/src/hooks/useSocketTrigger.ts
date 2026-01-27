"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { socket } from "@/lib/socket";

/**
 * useSocketTrigger: Listens for Socket.io events and triggers router.refresh()
 * @param events List of event names to listen for (e.g. ['order:created', 'dealer:updated'])
 */
export function useSocketTrigger(events: string[]) {
    const router = useRouter();

    useEffect(() => {
        if (!socket.connected) {
            socket.connect();
        }

        const onSignal = () => {
            console.log("Socket signal received, refreshing...");
            router.refresh(); // Secure re-fetch
        };

        // Subscribe to all requested events
        events.forEach(event => {
            socket.on(event, onSignal);
        });

        // Cleanup
        return () => {
            events.forEach(event => {
                socket.off(event, onSignal);
            });
            // We usually don't disconnect the socket here to share the connection
            // across components, but we could if we wanted to be strict.
        };
    }, [events, router]);
}
