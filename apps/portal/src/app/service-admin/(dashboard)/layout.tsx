'use client';

import DashboardLayout from '@/components/service-admin/layout/DashboardLayout';
import { ServiceAdminGuard } from '@/components/guards/auth-guards';

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
    return (
        <ServiceAdminGuard>
            <DashboardLayout>{children}</DashboardLayout>
        </ServiceAdminGuard>
    );
}
