'use client';

import React from 'react';
import {
    Calendar,
    DollarSign,
    TrendingUp,
    TrendingDown,
    ArrowRight,
    Search,
    Download
} from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import { Card, CardContent, Button } from '@/components/ui';
import { MOCK_DAILY_CLOSING } from '@/constants/posData';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const DailyClosingPage = () => {
    // Current day stats (mocked as the first entry, or sum of invoices in real app)
    const todayClosing = MOCK_DAILY_CLOSING[0];

    return (
        <div className="p-6 lg:p-8 space-y-8 animate-fade">
            <Breadcrumb items={[{ label: 'POS', href: '/pos' }, { label: 'Daily Closing' }]} />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-ink-heading dark:text-white uppercase tracking-tight">Daily Closing</h1>
                    <p className="text-sm text-ink-muted mt-2 font-medium">Reconcile daily sales and cash drawer.</p>
                </div>
                <div className="bg-brand/10 text-brand px-5 py-2.5 rounded-2xl border-2 border-brand/20 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={16} />
                    {new Date(todayClosing.date).toLocaleDateString('en-GB', { dateStyle: 'long' })}
                </div>
            </div>

            {/* Today's Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="rounded-[2.5rem] bg-brand text-white shadow-xl shadow-brand/20 relative overflow-hidden group">
                    <CardContent className="p-8 space-y-4 relative z-10">
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white">
                                <DollarSign size={24} />
                            </div>
                            <span className="bg-white/20 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-white/80">Today</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Total Sales</p>
                            <h3 className="text-3xl font-black tracking-tight">৳{todayClosing.totalSales.toLocaleString()}</h3>
                        </div>
                    </CardContent>
                    {/* Decorative bg */}
                    <div className="absolute right-0 bottom-0 opacity-10 p-4 transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform duration-700">
                        <DollarSign size={120} />
                    </div>
                </Card>

                <Card className="rounded-[2.5rem] bg-white dark:bg-dark-card border-2 border-surface-border dark:border-dark-border shadow-soft group hover:border-brand/30 transition-all">
                    <CardContent className="p-8 space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-12 bg-success-bg text-success rounded-2xl flex items-center justify-center">
                                <TrendingUp size={24} />
                            </div>
                            <span className="bg-success-bg/50 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-success">Cash In Hand</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1 text-ink-muted">Net Cash</p>
                            <h3 className="text-3xl font-black tracking-tight text-ink-heading dark:text-white">৳{todayClosing.cashInHand.toLocaleString()}</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-[2.5rem] bg-white dark:bg-dark-card border-2 border-surface-border dark:border-dark-border shadow-soft group hover:border-danger/30 transition-all">
                    <CardContent className="p-8 space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-12 bg-danger-bg text-danger rounded-2xl flex items-center justify-center">
                                <TrendingDown size={24} />
                            </div>
                            <span className="bg-danger-bg/50 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-danger">Returns</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1 text-ink-muted">Total Returns</p>
                            <h3 className="text-3xl font-black tracking-tight text-ink-heading dark:text-white">৳{todayClosing.totalReturns.toLocaleString()}</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Breakdown & History */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Payment Breakdown */}
                <Card className="rounded-[2.5rem] border-2 border-surface-border dark:border-dark-border bg-white dark:bg-dark-card shadow-lg p-8 space-y-6">
                    <h3 className="text-lg font-black text-ink-heading dark:text-white uppercase tracking-tight flex items-center gap-2">
                        Payment Breakdown
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-surface-page dark:bg-dark-page rounded-2xl border border-surface-border dark:border-dark-border">
                            <span className="text-xs font-black uppercase text-ink-muted tracking-widest">Cash</span>
                            <span className="text-lg font-black text-ink-heading dark:text-white">৳{todayClosing.breakdown.cash.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-surface-page dark:bg-dark-page rounded-2xl border border-surface-border dark:border-dark-border">
                            <span className="text-xs font-black uppercase text-ink-muted tracking-widest">Card</span>
                            <span className="text-lg font-black text-ink-heading dark:text-white">৳{todayClosing.breakdown.card.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-surface-page dark:bg-dark-page rounded-2xl border border-surface-border dark:border-dark-border">
                            <span className="text-xs font-black uppercase text-ink-muted tracking-widest">MFS (Bkash/Nagad)</span>
                            <span className="text-lg font-black text-ink-heading dark:text-white">৳{todayClosing.breakdown.mfs.toLocaleString()}</span>
                        </div>
                    </div>
                    <Button className="w-full h-12 rounded-2xl bg-ink-heading dark:bg-white text-white dark:text-black font-black uppercase text-xs tracking-widest">
                        Close Register
                    </Button>
                </Card>

                {/* History Table */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-black text-ink-heading dark:text-white uppercase tracking-tight">Closing History</h3>
                        <Button variant="ghost" className="text-xs font-black uppercase tracking-widest text-brand hover:bg-brand/10 h-8 px-4 rounded-xl">View All</Button>
                    </div>

                    <div className="bg-white dark:bg-dark-card border-2 border-surface-border dark:border-dark-border rounded-[2.5rem] overflow-hidden shadow-lg">
                        <table className="w-full text-left">
                            <thead className="bg-surface-page dark:bg-dark-page border-b border-surface-border dark:border-dark-border">
                                <tr>
                                    <th className="p-6 text-[10px] font-black text-ink-muted uppercase tracking-widest">Date</th>
                                    <th className="p-6 text-[10px] font-black text-ink-muted uppercase tracking-widest">Type</th>
                                    <th className="p-6 text-[10px] font-black text-ink-muted uppercase tracking-widest text-right">Total</th>
                                    <th className="p-6 text-[10px] font-black text-ink-muted uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-border dark:divide-dark-border">
                                {MOCK_DAILY_CLOSING.map((record) => (
                                    <tr key={record.id} className="group hover:bg-surface-page dark:hover:bg-dark-page/50 transition-colors">
                                        <td className="p-6 font-bold text-ink-heading dark:text-white text-sm">
                                            {new Date(record.date).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
                                        </td>
                                        <td className="p-6 text-[10px] font-black text-ink-muted uppercase tracking-widest">
                                            Auto-Close
                                        </td>
                                        <td className="p-6 text-sm font-black text-ink-heading dark:text-white text-right">
                                            ৳{record.totalSales.toLocaleString()}
                                        </td>
                                        <td className="p-6 text-right">
                                            <button className="p-2 hover:bg-brand/10 text-brand rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Download size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailyClosingPage;
