'use client';

import DashboardLayout from '@/components/service-admin/layout/DashboardLayout';
import { ServiceAdminGuard } from '@/components/guards/auth-guards';
import { useSocketTrigger } from '@/hooks/useSocketTrigger';

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
    // Enable real-time refreshes for all workshop/admin pages
    useSocketTrigger([
        'job_cards:changed',
        'inventory:changed',
        'inventory:adjusted',
        'requisition:created',
        'requisition:approved',
        'requisition:rejected',
        'requisition:status_changed'
    ]);

    return (
        <ServiceAdminGuard>
            <DashboardLayout>{children}</DashboardLayout>
        </ServiceAdminGuard>
    );
}
