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

    // Standardize dependency — use string representation to ignore ref changes
    const eventsKey = JSON.stringify(events);

    useEffect(() => {
        if (events.length === 0) return;

        if (!socket.connected) {
            console.log("[SOCKET_TRIGGER] Connecting socket instance...");
            socket.connect();
        }

        const onSignal = (data: any) => {
            console.log(`[SOCKET_TRIGGER] Signal received via: ${eventsKey}. Data:`, data);

            // Limit refreshes — only refresh if it hasn't been done in the last 1s? 
            //router.refresh();
            // Let's stick with router.refresh() for now, but add logging to see if it's the trigger.
            router.refresh();
        };

        // Subscribe to all requested events
        console.log(`[SOCKET_TRIGGER] Subscribing to: ${eventsKey}`);
        events.forEach(event => {
            socket.on(event, onSignal);
        });

        // Cleanup
        return () => {
            console.log(`[SOCKET_TRIGGER] Unsubscribing from: ${eventsKey}`);
            events.forEach(event => {
                socket.off(event, onSignal);
            });
        };
    }, [eventsKey, router]);
}
