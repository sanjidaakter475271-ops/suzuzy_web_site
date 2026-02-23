'use client';

import React from 'react';
import Link from 'next/link';
import {
    Users,
    Bike,
    MessageSquare,
    Send,
    ArrowRight,
    UserPlus,
    History
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import Breadcrumb from '@/components/Breadcrumb';

const CRMOverviewPage = () => {
    const menuItems = [
        { title: "Customer List", icon: Users, path: "/crm/customers", color: "bg-brand", desc: "Manage detailed customer profiles and history." },
        { title: "Vehicle List", icon: Bike, path: "/crm/vehicles", color: "bg-info", desc: "Track all registered vehicles and service records." },
        { title: "Complaints", icon: MessageSquare, path: "/crm/complaints", color: "bg-danger", desc: "Log and resolve customer complaints." },
        { title: "Reminder Logs", icon: Send, path: "/crm/reminders", color: "bg-success", desc: "History of automated SMS and WhatsApp alerts." },
    ];

    return (
        <div className="p-6 lg:p-8 space-y-8 animate-fade">
            <Breadcrumb items={[{ label: 'Sales & Service' }, { label: 'CRM' }]} />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-ink-heading dark:text-white">Customer Relationship (CRM)</h1>
                    <p className="text-ink-muted mt-2">Centralized database for customers, vehicles, and communication.</p>
                </div>
                <div className="bg-surface-card dark:bg-dark-card border border-surface-border dark:border-dark-border px-4 py-2 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-soft flex items-center justify-center text-brand">
                        <Users size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-ink-muted uppercase">Total Customers</p>
                        <p className="text-lg font-black text-ink-heading dark:text-white">1,240</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

export default CRMOverviewPage;
