'use client';

import React from 'react';
import {
    Users,
    User,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Mail,
    Phone,
    TrendingUp,
    MoreVertical,
    Plus,
    Trash2
} from 'lucide-react';
import Breadcrumb from '@/components/service-admin/Breadcrumb';
import { Card, CardContent } from '@/components/service-admin/ui';
import { useWorkshopStore } from '@/stores/service-admin/workshopStore';
import { cn } from '@/lib/utils';

const TechnicianWorkloadPage = () => {
    const { technicians, addTechnician } = useWorkshopStore();

    const activeTechs = technicians.filter(t => t.status === 'active').length;
    const busyTechs = technicians.filter(t => t.status === 'busy').length;
    const pendingTechs = technicians.filter(t => t.status === 'pending').length;

    return (
        <div className="p-6 lg:p-10 space-y-10 min-h-screen bg-surface-page dark:bg-dark-page animate-fade">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="space-y-2">
                    <Breadcrumb items={[{ label: 'Workshop', href: '/service-admin/workshop' }, { label: 'Technicians' }]} />
                    <h1 className="text-4xl font-display font-black text-ink-heading dark:text-white tracking-tight">
                        Team <span className="text-brand">Excellence</span>
                    </h1>
                    <p className="text-base text-ink-muted max-w-lg font-medium">Manage your elite service personnel and monitor real-time workshop capacity.</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="px-6 py-4 bg-white dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-2xl shadow-premium flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center text-success">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-ink-muted">Available</p>
                            <p className="text-xl font-black text-ink-heading dark:text-white">{activeTechs}</p>
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-white dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-2xl shadow-premium flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-ink-muted">Active Duty</p>
                            <p className="text-xl font-black text-ink-heading dark:text-white">{busyTechs}</p>
                        </div>
                    </div>

                    {pendingTechs > 0 && (
                        <div className="px-6 py-4 bg-brand/5 border border-brand/20 rounded-2xl shadow-glow flex items-center gap-4 animate-pulse">
                            <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
                                <Clock size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-brand">Approvals</p>
                                <p className="text-xl font-black text-brand">{pendingTechs}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {technicians.map((tech) => {
                    const workloadPercentage = (tech.activeJobs / tech.capacity) * 100;
                    const isPending = tech.status === 'pending';

                    return (
                        <Card key={tech.id} className={cn(
                            "relative overflow-hidden group transition-all duration-500 hover:-translate-y-2",
                            isPending ? "border-brand/30 shadow-glow" : "hover-golden border-surface-border dark:border-dark-border"
                        )}>
                            <CardContent className="p-0">
                                <div className="p-6 space-y-6">
                                    {/* Header Section */}
                                    <div className="flex items-center gap-4">
                                        <div className="relative shrink-0">
                                            <div className="absolute inset-0 bg-brand blur-lg opacity-10 group-hover:opacity-30 transition-opacity" />
                                            <div className="relative p-0.5 bg-gradient-to-tr from-brand/40 to-transparent rounded-xl">
                                                <img
                                                    src={tech.avatar}
                                                    alt={tech.name}
                                                    className="w-14 h-14 rounded-lg object-cover border border-white/10"
                                                />
                                            </div>
                                            <div className={cn(
                                                "absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-dark-card shadow-sm",
                                                tech.status === 'active' ? 'bg-success' : tech.status === 'busy' ? 'bg-amber-500' : isPending ? 'bg-blue-500 animate-pulse' : 'bg-slate-400'
                                            )} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-base font-display font-black text-ink-heading dark:text-white truncate leading-tight group-hover:text-brand transition-colors">
                                                {tech.name}
                                            </h3>
                                            <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider truncate">
                                                Expert • {tech.id.split('-')[0]}
                                            </p>
                                        </div>
                                    </div>

                                    {isPending ? (
                                        <div className="space-y-4 pt-2">
                                            <div className="px-4 py-3 rounded-xl bg-blue-500/5 border border-blue-500/20 text-blue-600 dark:text-blue-400">
                                                <p className="text-[11px] font-bold leading-relaxed flex items-center gap-2">
                                                    <Clock size={12} />
                                                    Waiting Deployment
                                                </p>
                                            </div>
                                            <button
                                                onClick={async () => {
                                                    if ((useWorkshopStore.getState() as any).approveTechnician) {
                                                        await (useWorkshopStore.getState() as any).approveTechnician(tech.id);
                                                    }
                                                }}
                                                className="w-full bg-brand hover:bg-brand-hover text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all active:scale-95 btn-shine"
                                            >
                                                Authorize Now
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Key Metrics Grid */}
                                            <div className="grid grid-cols-2 gap-3 pb-2 border-b border-surface-border/50 dark:border-white/5">
                                                <div className="flex flex-col items-center p-2 bg-surface-page dark:bg-white/[0.03] rounded-xl border border-transparent hover:border-brand/20 transition-colors">
                                                    <span className="text-[9px] font-black text-ink-muted uppercase tracking-tighter">Efficiency</span>
                                                    <span className="text-sm font-black text-brand">
                                                        {85 + (parseInt(tech.id.charCodeAt(0).toString()) % 15)}%
                                                    </span>
                                                </div>
                                                <div className="flex flex-col items-center p-2 bg-surface-page dark:bg-white/[0.03] rounded-xl border border-transparent hover:border-brand/20 transition-colors">
                                                    <span className="text-[9px] font-black text-ink-muted uppercase tracking-tighter">Rating</span>
                                                    <span className="text-sm font-black text-success">
                                                        {(4.5 + (parseInt(tech.id.charCodeAt(tech.id.length - 1).toString()) % 5) / 10).toFixed(1)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Workload Indicator */}
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-ink-muted">
                                                    <span>Active Load</span>
                                                    <span className={cn(
                                                        workloadPercentage > 80 ? 'text-danger' : workloadPercentage > 50 ? 'text-warning' : 'text-brand'
                                                    )}>
                                                        {tech.activeJobs} / {tech.capacity} Jobs
                                                    </span>
                                                </div>
                                                <div className="h-1.5 w-full bg-surface-page dark:bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn(
                                                            "h-full transition-all duration-700 relative",
                                                            workloadPercentage > 80 ? 'bg-danger' : workloadPercentage > 50 ? 'bg-warning' : 'bg-brand'
                                                        )}
                                                        style={{ width: `${Math.max(workloadPercentage, 8)}%` }}
                                                    >
                                                        <div className="absolute inset-0 bg-white/30 animate-pulse" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Bar */}
                                            <div className="flex items-center gap-2 pt-2">
                                                <button className="flex-1 bg-white dark:bg-dark-card border border-surface-border dark:border-white/10 text-ink-heading dark:text-white py-2.5 rounded-lg font-black text-[10px] uppercase tracking-tighter hover:border-brand transition-all flex items-center justify-center gap-1.5 active:scale-95 group/btn">
                                                    <Phone size={12} className="text-brand group-hover/btn:scale-110" />
                                                    Call
                                                </button>
                                                <button className="flex-1 bg-white dark:bg-dark-card border border-surface-border dark:border-white/10 text-ink-heading dark:text-white py-2.5 rounded-lg font-black text-[10px] uppercase tracking-tighter hover:border-brand transition-all flex items-center justify-center gap-1.5 active:scale-95 group/btn">
                                                    <Mail size={12} className="text-brand group-hover/btn:scale-110" />
                                                    Mail
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        if (confirm(`Are you sure you want to remove ${tech.name}?`)) {
                                                            const { deleteTechnician } = useWorkshopStore.getState();
                                                            await deleteTechnician(tech.id);
                                                        }
                                                    }}
                                                    className="p-2.5 bg-danger/5 text-danger border border-danger/10 hover:bg-danger hover:text-white rounded-lg transition-all active:scale-90"
                                                    title="Remove Technician"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {!isPending && (
                                    <div className="bg-surface-card dark:bg-black/20 px-6 py-3 flex items-center justify-between border-t border-surface-border/50 dark:border-white/5 group-hover:bg-brand/[0.02] transition-colors">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                                            <span className="text-[10px] font-black text-ink-muted tracking-tighter">
                                                {tech.status === 'busy' ? 'Busy with Service' : 'Ready for Duty'}
                                            </span>
                                        </div>
                                        <button className="text-[9px] font-black uppercase text-brand flex items-center gap-1 underline decoration-brand/20 underline-offset-4 hover:decoration-brand transition-all">
                                            Full Logs
                                            <TrendingUp size={11} />
                                        </button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}

                <Card
                    onClick={() => addTechnician({ name: 'New Technician' })}
                    className="border-2 border-dashed border-brand/20 dark:border-brand/10 bg-transparent group cursor-pointer hover:border-brand hover:bg-brand/[0.01] transition-all duration-500"
                >
                    <CardContent className="h-full min-h-[320px] flex flex-col items-center justify-center text-center space-y-4 p-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-brand blur-2xl opacity-10 group-hover:opacity-25" />
                            <div className="relative w-16 h-16 rounded-2xl bg-white dark:bg-dark-card border border-brand/10 flex items-center justify-center text-brand group-hover:scale-110 transition-transform">
                                <Plus size={32} strokeWidth={1.5} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-base font-display font-black text-ink-heading dark:text-white tracking-tight">Expand Team</h4>
                            <p className="text-[10px] text-ink-muted uppercase font-black tracking-widest leading-loose">Onboard New Specialist</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
};

export default TechnicianWorkloadPage;

