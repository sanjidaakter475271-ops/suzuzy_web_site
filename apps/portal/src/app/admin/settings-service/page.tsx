'use client';

import React from 'react';
import Link from 'next/link';
import {
    Settings,
    Bell,
    Globe,
    Shield,
    Database,
    Palette
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import Breadcrumb from '@/components/Breadcrumb';

const SettingsOverviewPage = () => {
    const menuItems = [
        { title: "General", icon: Globe, path: "/settings/general", color: "bg-blue-500", desc: "Company profile, branding, and localization." },
        { title: "Notifications", icon: Bell, path: "/settings/notifications", color: "bg-amber-500", desc: "Email and SMS alert preferences." },
        { title: "Security", icon: Shield, path: "/settings/security", color: "bg-danger", desc: "Password policy and login sessions." },
        { title: "Data & Backup", icon: Database, path: "/settings/data", color: "bg-purple-600", desc: "Scheduled backups and data export." },
        { title: "Theme & UI", icon: Palette, path: "/settings/theme", color: "bg-brand", desc: "Customize application appearance." },
    ];

    return (
        <div className="p-6 lg:p-8 space-y-8 animate-fade">
            <Breadcrumb items={[{ label: 'System', href: '/settings' }, { label: 'Settings' }]} />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-ink-heading dark:text-white">System Configuration</h1>
                    <p className="text-ink-muted mt-2">Manage global settings and preferences.</p>
                </div>
                <div className="bg-surface-card dark:bg-dark-card border border-surface-border dark:border-dark-border px-4 py-2 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-soft flex items-center justify-center text-brand">
                        <Settings size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-ink-muted uppercase">Version</p>
                        <p className="text-lg font-black text-ink-heading dark:text-white">v2.1.0</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menuItems.map((item, i) => (
                    <Link key={i} href={item.path}>
                        <Card className="hover:border-brand transition-all cursor-pointer group h-full">
                            <CardContent className="p-6 flex flex-col items-start gap-4">
                                <div className={`${item.color} p-3 rounded-xl text-white shadow-lg shadow-black/5 group-hover:scale-110 transition-transform`}>
                                    <item.icon size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-ink-heading dark:text-white flex items-center gap-2">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-ink-muted mt-1 leading-relaxed">{item.desc}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default SettingsOverviewPage;
