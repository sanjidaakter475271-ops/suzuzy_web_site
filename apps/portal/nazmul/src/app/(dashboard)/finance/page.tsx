'use client';

import React from 'react';
import Link from 'next/link';
import {
    BookOpen,
    ShoppingBag,
    Receipt,
    Library,
    BarChart3,
    ArrowRight,
    Wallet,
    ArrowUpRight,
    TrendingDown,
    DollarSign
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import Breadcrumb from '@/components/Breadcrumb';
import { FINANCE_SUMMARY } from '@/constants/financeData';

const FinanceOverviewPage = () => {
    const menuItems = [
        { title: "CashBook Report", icon: BookOpen, path: "/finance/cashbook", color: "bg-brand", desc: "View detailed cash in/out and daily balance." },
        { title: "Daily Sales", icon: ShoppingBag, path: "/finance/daily-sales", color: "bg-success", desc: "Detailed breakdown of daily sales and invoices." },
        { title: "Expenses", icon: Receipt, path: "/finance/expenses", color: "bg-danger", desc: "Track all company expenses and distributions." },
        { title: "Deposits/Withdraw", icon: Wallet, path: "/finance/deposits", color: "bg-info", desc: "Monitor bank deposits and cash withdrawals." },
        { title: "Combined Reports", icon: BarChart3, path: "/finance/reports", color: "bg-slate-800", desc: "Full financial statement report in PDF format." },
    ];

    return (
        <div className="p-6 lg:p-8 space-y-8 animate-fade">
            <Breadcrumb items={[{ label: 'Finance' }]} />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-ink-heading dark:text-white">Finance Module</h1>
                    <p className="text-ink-muted mt-2">Manage your company's financial health, reports, and distribution.</p>
                </div>
                <div className="bg-surface-card dark:bg-dark-card border border-surface-border dark:border-dark-border px-4 py-2 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-soft flex items-center justify-center text-brand">
                        <DollarSign size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-ink-muted uppercase">Cash In Hand</p>
                        <p className="text-lg font-black text-ink-heading dark:text-white">Tk {FINANCE_SUMMARY.cashInHand.toLocaleString()}</p>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                <Card className="border-dashed border-2">
                    <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-success-bg text-success flex items-center justify-center">
                            <ArrowUpRight size={32} />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold">Income Summary</h4>
                            <p className="text-sm text-ink-muted">Tk {FINANCE_SUMMARY.totalIn.toLocaleString()} recorded recently.</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-dashed border-2">
                    <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-danger-bg text-danger flex items-center justify-center">
                            <TrendingDown size={32} />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold">Outflow Summary</h4>
                            <p className="text-sm text-ink-muted">Tk {FINANCE_SUMMARY.totalOut.toLocaleString()} spent in total.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default FinanceOverviewPage;
