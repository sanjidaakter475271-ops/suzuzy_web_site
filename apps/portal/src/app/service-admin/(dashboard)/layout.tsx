'use client';

import DashboardLayout from '@/components/service-admin/layout/DashboardLayout';
import { ServiceAdminGuard } from '@/components/guards/auth-guards';
import { useSocketTrigger } from '@/hooks/useSocketTrigger';
import { useWorkshopSync } from '@/hooks/useWorkshopSync';

const WORKSHOP_EVENTS = [
    'job_cards:changed',
    'inventory:changed',
    'inventory:adjusted',
    'requisition:created',
    'requisition:approved',
    'requisition:rejected',
    'requisition:status_changed',
    'attendance:changed',
    'attendance:shift_start',
    'attendance:shift_end'
];

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
    // Enable real-time refreshes for all workshop/admin pages (Server Components)
    useSocketTrigger(WORKSHOP_EVENTS);

    // Sync client store for workshop
    useWorkshopSync();


    return (
        <ServiceAdminGuard>
            <DashboardLayout>{children}</DashboardLayout>
        </ServiceAdminGuard>
    );
}
