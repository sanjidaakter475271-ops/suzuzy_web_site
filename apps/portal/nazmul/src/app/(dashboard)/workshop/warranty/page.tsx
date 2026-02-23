'use client';

import React from 'react';
import {
    ShieldCheck,
    Search,
    Calendar,
    User,
    Bike,
    ClipboardList,
    AlertCircle,
    CheckCircle2,
    ArrowUpRight,
    TrendingUp,
    Clock
} from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import { Card, CardContent } from '@/components/ui';
import { useWorkshopStore } from '@/stores/workshopStore';
import { cn } from '@/lib/utils';

const WarrantyTrackingPage = () => {
    const { jobCards } = useWorkshopStore();

    const warrantyJobs = jobCards.filter(job => job.warrantyType !== 'paid');

    return (
        <div className="p-6 lg:p-8 space-y-8 animate-fade">
            <Breadcrumb items={[{ label: 'Workshop', href: '/workshop' }, { label: 'Warranty Tracking' }]} />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-ink-heading dark:text-white">Warranty & Free Service</h1>
                    <p className="text-sm text-ink-muted">Manage motorbike warranty claims and free service coupons.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Card className="p-3 border-brand/20 bg-brand/5 min-w-[140px]">
                        <p className="text-[10px] font-black uppercase text-brand">Current Claims</p>
                        <p className="text-xl font-black text-ink-heading dark:text-white">08</p>
                    </Card>
                    <Card className="p-3 border-success/20 bg-success-bg min-w-[140px]">
                        <p className="text-[10px] font-black uppercase text-success">Free Services</p>
                        <p className="text-xl font-black text-ink-heading dark:text-white">24</p>
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Card className="lg:col-span-1 border-dashed border-2 p-6 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-brand-soft text-brand flex items-center justify-center shadow-lg shadow-brand/10">
                        <ShieldCheck size={32} />
                    </div>
                    <div>
                        <h4 className="font-bold">New Warranty Claim</h4>
                        <p className="text-xs text-ink-muted mt-1 uppercase font-black tracking-widest">Process new request</p>
                    </div>
                    <button className="w-full bg-brand text-white py-2 rounded-xl text-xs font-bold shadow-lg shadow-brand/20">Initate Claim</button>
                </Card>

                <div className="lg:col-span-3 overflow-hidden bg-surface-card dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-2xl">
                    <div className="p-6 border-b border-surface-border dark:border-dark-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h3 className="font-bold text-lg text-ink-heading dark:text-white">Recent Claims & Free Services</h3>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={16} />
                            <input
                                type="text"
                                placeholder="Search Job/Reg No..."
                                className="bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-brand w-full md:w-64"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-page dark:bg-dark-page/50">
                                    <th className="p-4 text-[10px] font-black text-ink-muted uppercase tracking-wider">Date</th>
                                    <th className="p-4 text-[10px] font-black text-ink-muted uppercase tracking-wider">Vehicle / Owner</th>
                                    <th className="p-4 text-[10px] font-black text-ink-muted uppercase tracking-wider">Type</th>
                                    <th className="p-4 text-[10px] font-black text-ink-muted uppercase tracking-wider">Job Card</th>
                                    <th className="p-4 text-[10px] font-black text-ink-muted uppercase tracking-wider">Status</th>
                                    <th className="p-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-border dark:divide-dark-border/50">
                                {warrantyJobs.map((job) => (
                                    <tr key={job.id} className="hover:bg-brand-soft/20 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-ink-muted" />
                                                <span className="text-xs font-bold text-ink-heading dark:text-white">
                                                    {new Date(job.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="space-y-0.5">
                                                <p className="text-xs font-bold text-ink-heading dark:text-white">{job.vehicleId}</p>
                                                <p className="text-[10px] text-ink-muted uppercase font-black">{job.customerId}</p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-full text-[9px] font-black uppercase",
                                                job.warrantyType === 'warranty' ? 'bg-amber-100 text-amber-600' : 'bg-brand-soft text-brand'
                                            )}>
                                                {job.warrantyType.replace('-', ' ')}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-ink-muted">
                                                <ClipboardList size={14} />
                                                #{job.jobNo}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-success" />
                                                <span className="text-[11px] font-bold text-ink-heading dark:text-white">Approved</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button className="text-brand opacity-0 group-hover:opacity-100 transition-all p-2 hover:bg-brand-soft rounded-lg">
                                                <ArrowUpRight size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {warrantyJobs.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center">
                                            <div className="space-y-2">
                                                <AlertCircle size={32} className="mx-auto text-slate-300" />
                                                <p className="text-sm font-bold text-ink-muted">No active warranty claims found.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WarrantyTrackingPage;
