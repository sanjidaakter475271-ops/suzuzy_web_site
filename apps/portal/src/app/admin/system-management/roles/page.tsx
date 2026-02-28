'use client';

import React from 'react';
import {
    Shield,
    Check,
    Users
} from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import { Card, CardContent } from '@/components/ui';
import { MOCK_ROLES } from '@/constants/userData';

const RolesPage = () => {
    // In production, this would fetch from /api/super-admin/roles
    const roles: any[] = [];

    return (
        <div className="p-6 lg:p-8 space-y-6 animate-fade">
            <Breadcrumb items={[{ label: 'Admin', href: '/admin/users' }, { label: 'Roles & Permissions' }]} />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-ink-heading dark:text-white">Role Definitions</h1>
                    <p className="text-sm text-ink-muted">Configure access levels for different staff types.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.length > 0 ? roles.map((role) => (
                    <Card key={role.id} className="hover:border-brand transition-all">
                        {/* ... existing role card content ... */}
                    </Card>
                )) : (
                    <div className="col-span-full py-20 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-surface-variant dark:bg-dark-surface mx-auto flex items-center justify-center text-ink-muted">
                            <Shield size={32} />
                        </div>
                        <p className="text-ink-muted font-bold">No roles defined in the system yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RolesPage;
