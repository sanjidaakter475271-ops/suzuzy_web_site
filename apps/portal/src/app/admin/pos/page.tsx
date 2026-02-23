'use client';

import React from 'react';
import Link from 'next/link';
import {
    ShoppingCart,
    FileText,
    Archive,
    Box,
    ArrowRight,
    DollarSign
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import Breadcrumb from '@/components/Breadcrumb';

const POSOverviewPage = () => {
    const menuItems = [
        { title: "Counter Sale", icon: ShoppingCart, path: "/pos/terminal", color: "bg-brand", desc: "Quick parts & accessories sales." },
        { title: "Service Billing", icon: FileText, path: "/pos/service-billing", color: "bg-blue-600", desc: "Invoice generation for job cards." },
        { title: "Quotations", icon: FileText, path: "/pos/quotations", color: "bg-amber-500", desc: "Create and manage price estimates." },
        { title: "Invoices", icon: Archive, path: "/pos/invoices", color: "bg-purple-600", desc: "View all past transactions." },
        { title: "Daily Closing", icon: Box, path: "/pos/closing", color: "bg-emerald-600", desc: "End of day reconciliation." },
    ];

    return (
        <div className="p-6 lg:p-8 space-y-8 animate-fade">
            <Breadcrumb items={[{ label: 'Service Center' }, { label: 'POS System' }]} />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-ink-heading dark:text-white uppercase tracking-tight">Point of Sale</h1>
                    <p className="text-ink-muted mt-2 font-medium">Select a module to proceed.</p>
                </div>
                <div className="bg-surface-card dark:bg-dark-card border border-surface-border dark:border-dark-border px-4 py-2 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                        <DollarSign size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-ink-muted uppercase tracking-widest">Today's Sales</p>
                        <p className="text-lg font-black text-ink-heading dark:text-white flex items-center gap-1">
                            ৳24,500
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {menuItems.map((item, i) => (
                    <Link key={i} href={item.path}>
                        <Card className="hover:border-brand transition-all cursor-pointer group h-full rounded-[2rem] border-2 border-transparent bg-white dark:bg-dark-card shadow-lg hover:shadow-xl">
                            <CardContent className="p-8 flex flex-col items-start gap-6">
                                <div className={`${item.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-black/5 group-hover:scale-110 transition-transform duration-500`}>
                                    <item.icon size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-ink-heading dark:text-white flex items-center gap-2 uppercase tracking-tight">
                                        {item.title}
                                        <ArrowRight size={20} className="text-ink-muted group-hover:translate-x-1 transition-transform opacity-0 group-hover:opacity-100" />
                                    </h3>
                                    <p className="text-sm font-bold text-ink-muted mt-2 leading-relaxed opacity-80">{item.desc}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default POSOverviewPage;
