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
import VolumeChart from '@/components/service-admin/dashboard/VolumeChart';
import { useDashboardStats } from '@/hooks/service-admin/useDashboardStats';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import { format, subDays } from 'date-fns';

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
    const { user } = useAuth();
    const { data, isLoading, error, refetch } = useDashboardStats();
    const { socket, isConnected } = useSocket();
    const [currentTime, setCurrentTime] = React.useState(new Date());

    // Update time every second for the live feel
    React.useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const userName = user?.name || 'Admin';
    const greeting = currentTime.getHours() < 12 ? 'Good morning' : currentTime.getHours() < 17 ? 'Good afternoon' : 'Good evening';

    // Listen for realtime events to refresh dashboard data
    React.useEffect(() => {
        if (!socket) return;

        const handleUpdate = (eventData: any) => {
            console.log(`[REALTIME] ${eventData?.event || 'Event'} received, refetching dashboard...`);
            refetch();
        };

        socket.on('inventory:changed', handleUpdate);
        socket.on('inventory:adjusted', handleUpdate);
        socket.on('order:update', handleUpdate);
        socket.on('order:changed', handleUpdate);
        socket.on('sale:new', handleUpdate);
        socket.on('sale:received', handleUpdate);
        socket.on('job_cards:changed', handleUpdate);
        socket.on('attendance:changed', handleUpdate);
        socket.on('requisition:created', handleUpdate);
        socket.on('requisition:approved', handleUpdate);
        socket.on('requisition:rejected', handleUpdate);
        socket.on('requisition:status_changed', handleUpdate);
        socket.on('signal:refresh', handleUpdate);

        return () => {
            socket.off('inventory:changed', handleUpdate);
            socket.off('inventory:adjusted', handleUpdate);
            socket.off('order:update', handleUpdate);
            socket.off('order:changed', handleUpdate);
            socket.off('sale:new', handleUpdate);
            socket.off('sale:received', handleUpdate);
            socket.off('job_cards:changed', handleUpdate);
            socket.off('attendance:changed', handleUpdate);
            socket.off('requisition:created', handleUpdate);
            socket.off('requisition:approved', handleUpdate);
            socket.off('requisition:rejected', handleUpdate);
            socket.off('requisition:status_changed', handleUpdate);
            socket.off('signal:refresh', handleUpdate);
        };
    }, [socket, refetch]);

    const dateRange = `${format(subDays(new Date(), 30), 'MMM dd, yyyy')} - ${format(new Date(), 'MMM dd, yyyy')}`;

    return (
        <div className="p-6 lg:p-8 space-y-8 animate-fade">
            {/* Realtime Status Indicator */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
                <div className="flex items-center gap-3 bg-[#0D0D0F]/80 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl shadow-2xl animate-in slide-in-from-right duration-500">
                    <div className="flex flex-col items-end">
                        <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] leading-none mb-1">Current Stream</p>
                        <p className="text-xs font-black text-white tabular-nums tracking-tighter leading-none">{format(currentTime, 'hh:mm:ss a')}</p>
                    </div>
                    <div className="w-px h-6 bg-white/10 mx-1" />
                    <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", isConnected ? "bg-emerald-500 animate-pulse" : "bg-rose-500")} />
                        <span className={cn("text-[10px] font-black uppercase tracking-widest", isConnected ? "text-emerald-500" : "text-rose-500")}>
                            {isConnected ? 'Live' : 'Offline'}
                        </span>
                    </div>
                </div>
            </div>

            <Breadcrumb items={[{ label: 'Dashboard' }]} />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Control Center Operations</p>
                    </div>
                    <h1 className="text-4xl font-black text-ink-heading dark:text-white tracking-tight uppercase italic">
                        {greeting}, <span className="text-brand">{userName}</span>! <span className="text-2xl not-italic">👋</span>
                    </h1>
                    <p className="text-ink-muted mt-1 font-medium italic">Operational overview and real-time business performance analytics.</p>
                </div>

                <div className="flex items-center gap-3">
                    {error && (
                        <button onClick={refetch} className="flex items-center gap-2 text-xs text-rose-500 bg-rose-500/10 px-4 py-2 rounded-xl border border-rose-500/20 hover:bg-rose-500/20 transition-all font-black uppercase tracking-widest">
                            <AlertCircle size={14} />
                            Sync Error · Retry
                        </button>
                    )}
                    <div
                        onClick={() => refetch()}
                        className="flex items-center bg-white dark:bg-dark-card border border-surface-border dark:border-white/5 rounded-xl px-4 py-2.5 shadow-sm transition-all hover:border-brand/40 group cursor-pointer active:scale-95"
                    >
                        <Calendar size={18} className="text-ink-muted mr-3 group-hover:text-brand transition-colors" />
                        <span className="text-[10px] font-black text-ink-heading dark:text-white uppercase tracking-widest">{dateRange}</span>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            {isLoading ? (
                <KPISkeletons />
            ) : !data ? (
                <div className="bg-white dark:bg-dark-card rounded-[2rem] p-12 text-center border-2 border-dashed border-surface-border dark:border-dark-border">
                    <AlertCircle className="mx-auto text-amber-500 mb-4" size={48} />
                    <h2 className="text-xl font-black text-ink-heading dark:text-white uppercase">Data Load Postponed</h2>
                    <p className="text-ink-muted mt-2 mb-6 font-bold">We couldn't reach the live statistics server at the moment.</p>
                    <Button onClick={refetch} className="px-8 rounded-xl">Retry Connection</Button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {data.kpis.map((kpi, index) => (
                            <KPICard key={index} kpi={kpi} />
                        ))}
                    </div>

                    {/* Workshop Realtime Widgets */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="h-full">
                            <ActiveRampsWidget apiData={data.ramps} />
                        </div>
                        <div className="h-full">
                            <QueuedVehiclesWidget apiData={data.queuedVehicles} />
                        </div>
                        <div className="h-full">
                            <CustomerRequestsWidget apiData={data.customerRequests} />
                        </div>
                    </div>
                </>
            )}

            {/* Activity Volume Stream */}
            {data?.volume && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                    <VolumeChart
                        data={data.volume.data}
                        total={data.volume.total}
                        today={data.volume.today}
                        lastHour={data.volume.lastHour}
                    />
                </div>
            )}

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
                    <ExpensePieChart
                        data={data?.expenseBreakdown}
                        lastMonthData={data?.lastMonthBreakdown}
                    />
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
                <div className="lg:col-span-2 bg-white dark:bg-[#080809] rounded-[2.5rem] shadow-card border border-surface-border dark:border-white/5 overflow-hidden flex flex-col group hover:border-brand/20 transition-all">
                    <div className="p-8 border-b border-surface-border dark:border-white/5 flex justify-between items-center bg-white dark:bg-[#080809] sticky top-0 z-10">
                        <div>
                            <h3 className="text-lg font-black text-ink-heading dark:text-white uppercase tracking-tight italic">Recent <span className="text-brand">Activity</span></h3>
                            <p className="text-[10px] font-black text-ink-muted uppercase tracking-[0.2em] mt-1">Live financial ledger</p>
                        </div>
                        <Link href="/service-admin/transactions" className="text-[10px] font-black text-brand uppercase tracking-[0.3em] hover:underline px-4 py-2 bg-brand/5 rounded-xl border border-brand/10 transition-all active:scale-95">View All</Link>
                    </div>
                    <div className="overflow-x-auto flex-1 custom-scrollbar">
                        <table className="w-full">
                            <thead className="bg-surface-page dark:bg-white/[0.02]">
                                <tr>
                                    <th className="px-8 py-4 text-left text-[10px] font-black text-ink-muted uppercase tracking-widest">Transaction</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-ink-muted uppercase tracking-widest">Category</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-ink-muted uppercase tracking-widest">Timestamp</th>
                                    <th className="px-8 py-4 text-right text-[10px] font-black text-ink-muted uppercase tracking-widest">Flow</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-border dark:divide-white/5">
                                {(data?.recentTransactions ?? []).map((tx, i) => (
                                    <motion.tr
                                        key={tx.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="hover:bg-surface-page dark:hover:bg-white/[0.01] transition-colors group/row"
                                    >
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover/row:scale-110 shadow-sm",
                                                    tx.type === 'income' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                                                )}>
                                                    {tx.type === 'income' ? <ArrowUpRight size={18} /> : <TrendingDown size={18} />}
                                                </div>
                                                <span className="text-xs font-black text-ink-heading dark:text-white uppercase tracking-tight">{tx.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-lg border border-slate-200 dark:border-white/5">{tx.category}</span>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-[10px] font-bold text-ink-muted uppercase tracking-widest">{tx.date}</td>
                                        <td className={cn(
                                            "px-8 py-5 whitespace-nowrap text-sm font-black text-right tabular-nums italic",
                                            tx.type === 'income' ? "text-emerald-500" : "text-rose-500"
                                        )}>
                                            {tx.amount}
                                        </td>
                                    </motion.tr>
                                ))}
                                {(!data?.recentTransactions || data.recentTransactions.length === 0) && (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-12 text-center">
                                            <p className="text-[10px] font-black text-ink-muted uppercase tracking-[0.2em] opacity-30 italic">No transaction records detected</p>
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
