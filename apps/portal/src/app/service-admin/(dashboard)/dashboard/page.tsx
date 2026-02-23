'use client';

import React from 'react';
import { Calendar, Bike, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/service-admin/ui';
import KPICard from '@/components/service-admin/dashboard/KPICard';
import RevenueChart from '@/components/service-admin/dashboard/RevenueChart';
import ExpensePieChart from '@/components/service-admin/dashboard/ExpensePieChart';
import TransactionBarChart from '@/components/service-admin/dashboard/TransactionBarChart';
import AccountsPanel from '@/components/service-admin/dashboard/AccountsPanel';
import GoalsAndTeam from '@/components/service-admin/dashboard/GoalsAndTeam';
import { cn } from '@/lib/utils';
import { ArrowUpRight, TrendingDown } from 'lucide-react';
import Breadcrumb from '@/components/service-admin/Breadcrumb';
import ActiveRampsWidget from '@/components/service-admin/dashboard/ActiveRampsWidget';
import QueuedVehiclesWidget from '@/components/service-admin/dashboard/QueuedVehiclesWidget';
import CustomerRequestsWidget from '@/components/service-admin/dashboard/CustomerRequestsWidget';
import { useDashboardStats } from '@/hooks/service-admin/useDashboardStats';
import { useSocket } from '@/hooks/useSocket';

// Loading skeleton for KPI cards
function KPISkeletons() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-card border border-surface-border dark:border-dark-border animate-pulse">
                    <div className="h-4 w-24 bg-surface-border dark:bg-dark-border rounded mb-4" />
                    <div className="h-8 w-20 bg-surface-border dark:bg-dark-border rounded mb-2" />
                    <div className="h-3 w-16 bg-surface-border dark:bg-dark-border rounded" />
                </div>
            ))}
        </div>
    );
}

export default function DashboardPage() {
    const { data, isLoading, error, refetch } = useDashboardStats();
    const { socket, isConnected } = useSocket();

    // Listen for realtime events to refresh dashboard data
    React.useEffect(() => {
        if (!socket) return;

        const handleUpdate = (eventData: any) => {
            console.log(`[REALTIME] ${eventData?.event || 'Event'} received, refetching dashboard...`);
            refetch();
        };

        socket.on('inventory:changed', handleUpdate);
        socket.on('order:update', handleUpdate);
        socket.on('sale:new', handleUpdate);
        // Also listen for general signal events if they are broadcasted
        socket.on('signal:refresh', handleUpdate);

        return () => {
            socket.off('inventory:changed', handleUpdate);
            socket.off('order:update', handleUpdate);
            socket.off('sale:new', handleUpdate);
            socket.off('signal:refresh', handleUpdate);
        };
    }, [socket, refetch]);

    return (
        <div className="p-6 lg:p-8 space-y-8 animate-fade">
            {/* Realtime Status Indicator */}
            {isConnected && (
                <div className="fixed bottom-4 right-4 z-50">
                    <div className="bg-success-bg/10 backdrop-blur-md border border-success/20 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                        <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-success uppercase tracking-widest">Live</span>
                    </div>
                </div>
            )}

            <Breadcrumb items={[{ label: 'Dashboard' }]} />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-ink-heading dark:text-white flex items-center gap-2">
                        Good morning, Demo! <span className="text-2xl">👋</span>
                    </h1>
                    <p className="text-ink-muted mt-2">Here&apos;s what&apos;s happening with your business today.</p>
                </div>

                <div className="flex items-center gap-3">
                    {error && (
                        <button onClick={refetch} className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors">
                            <AlertCircle size={14} />
                            Using cached data · Retry
                        </button>
                    )}
                    <div className="flex items-center bg-white dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-lg px-4 py-2.5 shadow-sm transition-colors hover:border-brand/30 cursor-pointer">
                        <Calendar size={18} className="text-ink-muted mr-2" />
                        <span className="text-sm font-medium text-ink-heading dark:text-white">Feb 10, 2026 - Mar 02, 2026</span>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            {isLoading ? (
                <KPISkeletons />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {data?.kpis.map((kpi, index) => (
                        <KPICard key={index} kpi={kpi} />
                    ))}
                </div>
            )}

            {/* Workshop Realtime Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="h-full">
                    <ActiveRampsWidget apiData={data?.ramps} />
                </div>
                <div className="h-full">
                    <QueuedVehiclesWidget apiData={data?.queuedVehicles} />
                </div>
                <div className="h-full">
                    <CustomerRequestsWidget apiData={data?.customerRequests} />
                </div>
            </div>

            {/* Workshop Performance Section */}
            <div className="bg-brand text-white rounded-[2.5rem] p-8 lg:p-12 shadow-2xl shadow-brand/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                    <Bike size={180} />
                </div>
                <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-center">
                    <div className="space-y-4 max-w-md">
                        <div className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest inline-block">Workshop Pulse</div>
                        <h2 className="text-4xl font-black tracking-tighter uppercase leading-tight">
                            {data?.workshopPulse
                                ? `Floor has ${data.workshopPulse.activeJobs} active jobs.`
                                : 'Floor Efficiency is at 85% today.'}
                        </h2>
                        <p className="font-bold opacity-80 leading-relaxed">Manage your workshop flow with real-time ramp updates and automated job assignments.</p>
                        <div className="flex gap-4 pt-4">
                            <Link href="/service-admin/workshop/ramp-view">
                                <Button className="bg-white text-brand hover:bg-slate-100 px-8 rounded-2xl h-12 text-xs font-black uppercase tracking-widest">Floor View</Button>
                            </Link>
                            <Link href="/service-admin/workshop/job-cards/new">
                                <Button className="bg-brand-dark text-white border border-white/20 px-8 rounded-2xl h-12 text-xs font-black uppercase tracking-widest">New Entry</Button>
                            </Link>
                        </div>
                    </div>
                    <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-8 border border-white/10 flex flex-col items-center justify-center text-center space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Active Jobs</p>
                            <p className="text-4xl font-black">{data?.workshopPulse?.activeJobs ?? 12}</p>
                            <p className="text-[10px] uppercase font-bold text-success">live</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-8 border border-white/10 flex flex-col items-center justify-center text-center space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Ramp Usage</p>
                            <p className="text-4xl font-black">{data?.workshopPulse?.rampUsage ?? '8/10'}</p>
                            <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                                <div className="h-full bg-white" style={{
                                    width: data?.workshopPulse?.rampUsage
                                        ? `${(parseInt(data.workshopPulse.rampUsage.split('/')[0]) / parseInt(data.workshopPulse.rampUsage.split('/')[1])) * 100}%`
                                        : '80%'
                                }}></div>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-8 border border-white/10 flex flex-col items-center justify-center text-center space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Avg. Tat</p>
                            <p className="text-4xl font-black">{data?.workshopPulse?.avgTatMinutes ? `${data.workshopPulse.avgTatMinutes}m` : '42m'}</p>
                            <p className="text-[10px] uppercase font-bold text-success-bg/80">live data</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                    <RevenueChart data={data?.revenueData} />
                </div>
                <div>
                    <ExpensePieChart data={data?.expenseBreakdown} />
                </div>
            </div>

            {/* Middle Section: Transaction Volume & Accounts */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <TransactionBarChart data={data?.transactionVolume} />
                <div className="xl:col-span-2">
                    <AccountsPanel data={data?.accounts} />
                </div>
            </div>

            {/* Bottom Section: Recent Transactions & Goals */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Transactions */}
                <div className="lg:col-span-2 bg-white dark:bg-dark-card rounded-2xl shadow-card border border-surface-border dark:border-dark-border overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-surface-border dark:border-dark-border flex justify-between items-center bg-white dark:bg-dark-card sticky top-0 z-10">
                        <h3 className="text-lg font-bold text-ink-heading dark:text-white">Recent Transactions</h3>
                        <Link href="/service-admin/transactions" className="text-sm text-brand font-medium hover:underline">View All</Link>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full">
                            <thead className="bg-surface-page dark:bg-dark-page">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-ink-muted uppercase">Transaction</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-ink-muted uppercase">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-ink-muted uppercase">Date</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-ink-muted uppercase">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-border dark:divide-dark-border">
                                {(data?.recentTransactions ?? []).map((tx) => (
                                    <tr key={tx.id} className="hover:bg-surface-hover dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "p-2 rounded-full",
                                                    tx.type === 'income' ? "bg-success-bg text-success" : "bg-surface-page text-ink-muted dark:bg-dark-border"
                                                )}>
                                                    {tx.type === 'income' ? <ArrowUpRight size={16} /> : <TrendingDown size={16} />}
                                                </div>
                                                <span className="text-sm font-medium text-ink-heading dark:text-white">{tx.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-ink-muted">{tx.category}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-ink-muted">{tx.date}</td>
                                        <td className={cn(
                                            "px-6 py-4 whitespace-nowrap text-sm font-bold text-right",
                                            tx.type === 'income' ? "text-success" : "text-danger"
                                        )}>
                                            {tx.amount}
                                        </td>
                                    </tr>
                                ))}
                                {(!data?.recentTransactions || data.recentTransactions.length === 0) && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-sm text-ink-muted">
                                            No recent transactions
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div>
                    <GoalsAndTeam data={data?.goals} />
                </div>
            </div>
        </div>
    );
}
