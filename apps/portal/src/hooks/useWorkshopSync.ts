"use client";

import { useEffect } from "react";
import { socket } from "@/lib/socket";
import { useWorkshopStore } from "@/stores/service-admin/workshopStore";

const WORKSHOP_EVENTS = [
    'job_cards:changed',
    'inventory:changed',
    'inventory:adjusted',
    'requisition:created',
    'requisition:approved',
    'requisition:rejected',
    'requisition:status_changed',
    'attendance:changed'
];

/**
 * useWorkshopSync: Listens for Socket.io events and refreshes the workshop store
 */
export function useWorkshopSync() {
    const fetchWorkshopData = useWorkshopStore(state => state.fetchWorkshopData);

    useEffect(() => {
        if (!socket.connected) {
            socket.connect();
        }

        const handleUpdate = (data: any) => {
            console.log("[WORKSHOP_SYNC] Update received, refreshing store:", data);
            fetchWorkshopData();
        };

        WORKSHOP_EVENTS.forEach(event => {
            socket.on(event, handleUpdate);
        });

        // Also fetch on mount to ensure we have initial data
        fetchWorkshopData();

        return () => {
            WORKSHOP_EVENTS.forEach(event => {
                socket.off(event, handleUpdate);
            });
        };
    }, [fetchWorkshopData]);
}
