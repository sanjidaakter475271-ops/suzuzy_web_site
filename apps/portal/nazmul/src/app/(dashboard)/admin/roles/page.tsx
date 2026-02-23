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
                {MOCK_ROLES.map((role) => (
                    <Card key={role.id} className="hover:border-brand transition-all">
                        <CardContent className="p-0">
                            <div className="p-6 border-b border-surface-border dark:border-dark-border/50 flex flex-col items-center text-center space-y-3">
                                <div className="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center">
                                    <Shield size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-ink-heading dark:text-white">{role.name}</h3>
                                    <p className="text-xs text-ink-muted uppercase font-black tracking-widest bg-surface-page dark:bg-dark-page px-2 py-0.5 rounded mt-1 inline-block">
                                        ID: {role.id}
                                    </p>
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                <h4 className="text-[10px] font-black uppercase text-ink-muted tracking-wider flex items-center gap-2">
                                    Included Permissions
                                </h4>
                                <ul className="space-y-2">
                                    {role.permissions.map((perm, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-xs font-bold text-ink-muted">
                                            <Check size={14} className="text-success shrink-0 mt-0.5" />
                                            {perm.replace('_', ' ').toUpperCase()}
                                        </li>
                                    ))}
                                    {role.permissions[0] === 'all' && (
                                        <li className="flex items-start gap-2 text-xs font-bold text-ink-muted italic">
                                            <Check size={14} className="text-success shrink-0 mt-0.5" />
                                            Full System Access
                                        </li>
                                    )}
                                </ul>
                            </div>

                            <div className="p-4 bg-surface-page dark:bg-dark-page border-t border-surface-border dark:border-dark-border/50 flex justify-center">
                                <div className="flex items-center gap-2 text-xs font-bold text-ink-muted">
                                    <Users size={14} />
                                    <span>3 Users Assigned</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default RolesPage;
