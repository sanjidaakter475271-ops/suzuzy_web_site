'use client';

import { ServiceAdminGuard } from '@/components/guards/auth-guards';

export default function POSLayout({ children }: { children: React.ReactNode }) {
    return (
        <ServiceAdminGuard>
            {children}
        </ServiceAdminGuard>
    );
}
