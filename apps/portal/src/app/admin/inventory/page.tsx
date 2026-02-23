'use client';

import React from 'react';
import Link from 'next/link';
import {
    Box,
    PackagePlus,
    Wrench,
    AlertTriangle,
    BarChart3,
    ArrowRight,
    Search,
    Package
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import Breadcrumb from '@/components/Breadcrumb';

const InventoryOverviewPage = () => {
    const menuItems = [
        { title: "All Products", icon: Box, path: "/inventory/products", color: "bg-brand", desc: "View and manage complete parts catalog." },
        { title: "Stock Adjustment", icon: PackagePlus, path: "/inventory/stock-adjustment", color: "bg-success", desc: "Add stock or write off damaged items." },
        { title: "Issue to Workshop", icon: Wrench, path: "/inventory/parts-issue", color: "bg-blue-500", desc: "Allocate parts to active job cards." },
        { title: "Low Stock Alerts", icon: AlertTriangle, path: "/inventory/low-stock", color: "bg-danger", desc: "Items below minimum threshold." },
        { title: "Valuation Report", icon: BarChart3, path: "/inventory/valuation", color: "bg-purple-600", desc: "Total inventory value and aging analysis." },
    ];

    return (
        <div className="p-6 lg:p-8 space-y-8 animate-fade">
            <Breadcrumb items={[{ label: 'Service Center' }, { label: 'Inventory' }]} />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-ink-heading dark:text-white">Inventory Management</h1>
                    <p className="text-ink-muted mt-2">Track parts, stock levels, and procurement.</p>
                </div>
                <div className="bg-surface-card dark:bg-dark-card border border-surface-border dark:border-dark-border px-4 py-2 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-soft flex items-center justify-center text-brand">
                        <Package size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-ink-muted uppercase">Total Stock Value</p>
                        <p className="text-lg font-black text-ink-heading dark:text-white">Tk 1.2M</p>
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

export default InventoryOverviewPage;
