'use client';

import React, { useEffect, useCallback } from 'react';
import { useWorkshopStore } from '@/stores/service-admin/workshopStore';
import { Loader2 } from 'lucide-react';
import { socket } from '@/lib/socket';

export default function WorkshopLayout({ children }: { children: React.ReactNode }) {
    const { fetchWorkshopData, isLoading, jobCards } = useWorkshopStore();
    const [isInitialLoaded, setIsInitialLoaded] = React.useState(false);

    const handleRealtimeUpdate = useCallback((data?: any) => {
        console.log('[WORKSHOP_LAYOUT] Realtime event received, refreshing store...', data);
        fetchWorkshopData();
    }, [fetchWorkshopData]);

    useEffect(() => {
        const init = async () => {
            // Only fetch if stores are empty to prevent background-refresh loops on navigation
            if (jobCards.length === 0) {
                await fetchWorkshopData();
            }
            setIsInitialLoaded(true);
        };
        init();

        // Connect socket if not already connected
        if (!socket.connected) {
            console.log('[WORKSHOP_LAYOUT] Connecting socket...');
            socket.connect();
        }

        // Listen for realtime events to auto-refresh workshop data
        const events = [
            'job_cards:changed',
            'requisition:created',
            'requisition:status_changed',
            'inventory:changed',
            'order:changed'
        ];

        events.forEach(event => {
            socket.on(event, handleRealtimeUpdate);
        });

        return () => {
            events.forEach(event => {
                socket.off(event, handleRealtimeUpdate);
            });
        };
    }, [handleRealtimeUpdate]);

    // Show loading state ONLY on the first load if no data exists
    if (!isInitialLoaded && isLoading && jobCards.length === 0) {
        return (
            <div className="flex h-[calc(100vh-100px)] w-full items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-ink-muted">
                    <Loader2 className="h-10 w-10 animate-spin text-brand" />
                    <p className="text-sm font-bold uppercase tracking-widest animate-pulse">Loading Workshop Data...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
