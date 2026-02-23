'use client';

import React from 'react';
import Link from 'next/link';
import {
    Hammer,
    LayoutPanelTop,
    Users,
    ClipboardCheck,
    Wrench,
    ShieldCheck,
    ArrowRight,
    ClipboardList
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import Breadcrumb from '@/components/Breadcrumb';

const WorkshopOverviewPage = () => {
    const menuItems = [
        { title: "Job Card List", icon: ClipboardList, path: "/workshop/job-cards", color: "bg-brand", desc: "View and manage all service job cards." },
        { title: "Status Board", icon: LayoutPanelTop, path: "/workshop/status-board", color: "bg-info", desc: "Live view of service progress (Kanban)." },
        { title: "Technicians", icon: Users, path: "/workshop/technicians", color: "bg-success", desc: "Monitor technician workload and capacity." },
        { title: "QC Checklist", icon: ClipboardCheck, path: "/workshop/qc", color: "bg-warning", desc: "Quality control and delivery inspections." },
        { title: "Service Types", icon: Wrench, path: "/workshop/service-types", color: "bg-danger", desc: "Manage labor rates and service types." },
        { title: "Warranty Tracking", icon: ShieldCheck, path: "/workshop/warranty", color: "bg-slate-800", desc: "Track free services and warranty claims." },
    ];

    return (
        <div className="p-6 lg:p-8 space-y-8 animate-fade">
            <Breadcrumb items={[{ label: 'Service Center' }, { label: 'Workshop' }]} />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-ink-heading dark:text-white">Workshop Module</h1>
                    <p className="text-ink-muted mt-2">Manage motorbike services, technicians, and quality assurance.</p>
                </div>
                <div className="bg-surface-card dark:bg-dark-card border border-surface-border dark:border-dark-border px-4 py-2 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-soft flex items-center justify-center text-brand">
                        <Hammer size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-ink-muted uppercase">Active Jobs</p>
                        <p className="text-lg font-black text-ink-heading dark:text-white">12</p>
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
                                        <ArrowRight size={16} className="text-ink-muted group-hover:translate-x-1 transition-transform" />
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

export default WorkshopOverviewPage;
