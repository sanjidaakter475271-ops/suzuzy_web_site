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
    Plus
} from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import { Card, CardContent } from '@/components/ui';
import { useWorkshopStore } from '@/stores/workshopStore';
import { cn } from '@/lib/utils';

const TechnicianWorkloadPage = () => {
    const { technicians } = useWorkshopStore();

    return (
        <div className="p-6 lg:p-8 space-y-6 animate-fade">
            <Breadcrumb items={[{ label: 'Workshop', href: '/workshop' }, { label: 'Technicians' }]} />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-ink-heading dark:text-white">Technician Workload</h1>
                    <p className="text-sm text-ink-muted">Monitor team capacity and active job assignments.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-success-bg rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-success" />
                        <span className="text-xs font-bold text-success">4 Available</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="text-xs font-bold text-amber-600">2 Busy</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {technicians.map((tech) => {
                    const workloadPercentage = (tech.activeJobs / tech.capacity) * 100;

                    return (
                        <Card key={tech.id} className="hover-golden overflow-hidden group">
                            <CardContent className="p-0">
                                <div className="p-6 space-y-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <img
                                                    src={tech.avatar}
                                                    alt={tech.name}
                                                    className="w-16 h-16 rounded-2xl object-cover border-2 border-surface-border dark:border-dark-border"
                                                />
                                                <div className={cn(
                                                    "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-dark-card",
                                                    tech.status === 'active' ? 'bg-success' : tech.status === 'busy' ? 'bg-amber-500' : 'bg-slate-400'
                                                )} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-ink-heading dark:text-white group-hover:text-brand transition-colors">{tech.name}</h3>
                                                <p className="text-xs font-bold text-ink-muted uppercase tracking-widest">{tech.id} • Senior Technician</p>
                                            </div>
                                        </div>
                                        <button className="p-1.5 hover:bg-surface-page dark:hover:bg-dark-page rounded-lg text-ink-muted transition-colors">
                                            <MoreVertical size={18} />
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="text-ink-muted uppercase">Active Workload</span>
                                            <span className={cn(
                                                workloadPercentage > 80 ? 'text-danger' : workloadPercentage > 50 ? 'text-warning' : 'text-success'
                                            )}>
                                                {tech.activeJobs} / {tech.capacity} Jobs
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-surface-page dark:bg-dark-page rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full transition-all duration-1000",
                                                    workloadPercentage > 80 ? 'bg-danger' : workloadPercentage > 50 ? 'bg-warning' : 'bg-brand'
                                                )}
                                                style={{ width: `${workloadPercentage}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 py-4 border-y border-surface-border dark:border-dark-border/50">
                                        <div className="text-center space-y-1">
                                            <p className="text-[10px] font-bold text-ink-muted uppercase">Efficiency</p>
                                            <p className="font-black text-ink-heading dark:text-white">94%</p>
                                        </div>
                                        <div className="text-center border-x border-surface-border dark:border-dark-border/50 space-y-1">
                                            <p className="text-[10px] font-bold text-ink-muted uppercase">Today</p>
                                            <p className="font-black text-ink-heading dark:text-white">8</p>
                                        </div>
                                        <div className="text-center space-y-1">
                                            <p className="text-[10px] font-bold text-ink-muted uppercase">Rating</p>
                                            <p className="font-black text-ink-heading dark:text-white">4.8</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button className="flex-1 bg-surface-page dark:bg-dark-page hover:bg-brand-soft hover:text-brand text-ink-muted p-2 rounded-xl transition-all flex items-center justify-center gap-2 text-xs font-bold">
                                            <Phone size={14} />
                                            Call
                                        </button>
                                        <button className="flex-1 bg-surface-page dark:bg-dark-page hover:bg-brand-soft hover:text-brand text-ink-muted p-2 rounded-xl transition-all flex items-center justify-center gap-2 text-xs font-bold">
                                            <Mail size={14} />
                                            Message
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-surface-page dark:bg-dark-page/30 px-6 py-3 flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase text-ink-muted flex items-center gap-1.5">
                                        <Clock size={12} className="text-brand" />
                                        Next Slot: 02:30 PM
                                    </span>
                                    <button className="text-[10px] font-black uppercase text-brand flex items-center gap-1 hover:gap-1.5 transition-all">
                                        View All Tasks
                                        <TrendingUp size={12} />
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}

                <Card className="border-2 border-dashed border-surface-border dark:border-dark-border bg-transparent group cursor-pointer hover:border-brand transition-colors">
                    <CardContent className="h-full min-h-[300px] flex flex-col items-center justify-center text-center space-y-4 p-8">
                        <div className="w-16 h-16 rounded-full bg-surface-card dark:bg-dark-card border border-surface-border dark:border-dark-border flex items-center justify-center text-ink-muted group-hover:text-brand transition-colors">
                            <Plus size={32} />
                        </div>
                        <div>
                            <h4 className="font-bold text-ink-heading dark:text-white">Add New Technician</h4>
                            <p className="text-xs text-ink-muted mt-1">Onboard a new member to the service team.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default TechnicianWorkloadPage;
