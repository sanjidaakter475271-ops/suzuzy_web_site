// apps/portal/src/hooks/useWorkshopSync.ts

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
    'order:changed',        // Added: General order/job card structural changes
    'sale:received',        // Added: Financial activity sync
    'attendance:changed',
    'attendance:shift_start', // Added: Tech shift tracking
    'attendance:shift_end'    // Added: Tech shift tracking
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
            console.log("[WORKSHOP_SYNC] Live telemetry received, refreshing store:", data?.event || 'Sync');
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
