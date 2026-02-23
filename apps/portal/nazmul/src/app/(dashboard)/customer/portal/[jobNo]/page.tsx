'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWorkshopStore } from '@/stores/workshopStore';
import { Button, Card, CardContent } from '@/components/ui';
import {
    ChevronLeft, Bike, Hammer,
    CheckCircle2, Clock, AlertCircle,
    User, MapPin, Phone
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CustomerLiveTracking = () => {
    const { jobNo } = useParams();
    const router = useRouter();
    const { jobCards } = useWorkshopStore();

    const job = jobCards.find(j => j.jobNo === jobNo);

    if (!job) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-6">
            <div className="p-6 bg-red-500/10 text-red-600 rounded-full"><AlertCircle size={64} /></div>
            <div>
                <h1 className="text-3xl font-black uppercase tracking-tight">Job Not Found</h1>
                <p className="text-ink-muted mt-2 max-w-sm font-bold">We couldn't find a service record for #{jobNo}. Please check your receipt.</p>
            </div>
            <Button onClick={() => router.push('/customer/portal')} variant="outline" className="rounded-2xl px-8 h-12 uppercase tracking-widest text-xs font-black">Go Back</Button>
        </div>
    );

    const steps = [
        { label: 'Received', value: 'received', desc: 'Vehicle received at workshop' },
        { label: 'Diagnosis', value: 'in-diagnosis', desc: 'Technician is inspecting the issues' },
        { label: 'Service', value: 'in-service', desc: 'Work is currently in progress' },
        { label: 'Ready', value: 'ready', desc: 'Finished and ready for pickup' }
    ];

    const currentStepIdx = steps.findIndex(s => s.value === job.status) === -1 ?
        (job.status === 'delivered' ? 4 : 0) :
        steps.findIndex(s => s.value === job.status);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black/40">
            {/* Header */}
            <div className="bg-white dark:bg-dark-card border-b border-surface-border dark:border-dark-border p-6 sticky top-0 z-30">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <div className="text-center">
                        <p className="text-[10px] font-black text-brand uppercase tracking-widest">Live Status</p>
                        <h2 className="text-xl font-black uppercase tracking-tight">Bike Service #{job.jobNo}</h2>
                    </div>
                    <div className="w-10 h-10 bg-brand/10 text-brand rounded-full flex items-center justify-center font-black text-xs">RC</div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-6 space-y-8 pb-20">

                {/* Visual Tracker */}
                <Card className="rounded-[2.5rem] overflow-hidden border-2 border-brand/10 shadow-2xl bg-white dark:bg-dark-card">
                    <CardContent className="p-10 space-y-12">
                        <div className="flex flex-col md:flex-row justify-between relative">
                            {/* Connecting Line */}
                            <div className="hidden md:block absolute left-8 right-8 top-6 h-1 bg-slate-100 dark:bg-white/5 z-0"></div>
                            <div
                                className="hidden md:block absolute left-8 top-6 h-1 bg-brand transition-all duration-1000 z-0"
                                style={{ width: `${(currentStepIdx / 3) * 85}%` }}
                            ></div>

                            {steps.map((step, idx) => (
                                <div key={idx} className="relative z-10 flex flex-row md:flex-col items-center gap-4 md:gap-6 mb-8 md:mb-0">
                                    <div className={cn(
                                        "w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all duration-500 shadow-lg",
                                        idx < currentStepIdx ? "bg-emerald-500 border-white dark:border-dark-card text-white" :
                                            idx === currentStepIdx ? "bg-brand border-white dark:border-dark-card text-white scale-125 ring-4 ring-brand/20" :
                                                "bg-white dark:bg-slate-800 border-slate-100 dark:border-white/5 text-slate-300"
                                    )}>
                                        {idx < currentStepIdx ? <CheckCircle2 size={24} /> :
                                            idx === currentStepIdx ? <Clock size={24} className="animate-spin-slow" /> :
                                                <span className="font-black text-sm">{idx + 1}</span>}
                                    </div>
                                    <div className="text-left md:text-center">
                                        <p className={cn(
                                            "text-xs font-black uppercase tracking-widest",
                                            idx <= currentStepIdx ? "text-ink-heading dark:text-white" : "text-slate-400"
                                        )}>{step.label}</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-1 md:max-w-[120px]">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="h-px bg-slate-100 dark:bg-white/5 w-full"></div>

                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-brand/10 text-brand rounded-2xl"><Bike size={32} /></div>
                                <div>
                                    <p className="text-xl font-black text-ink-heading dark:text-white tracking-tight">{job.vehicleModel}</p>
                                    <p className="text-xs font-black text-brand uppercase tracking-widest">{job.vehicleRegNo}</p>
                                </div>
                            </div>
                            <div className="text-center md:text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimated Completion</p>
                                <p className="text-2xl font-black text-ink-heading dark:text-white">Today, 5:30 PM</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Details Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Tasks List */}
                    <Card className="rounded-[2.5rem] border-2 border-surface-border dark:border-dark-border bg-white dark:bg-dark-card shadow-xl">
                        <CardContent className="p-10 space-y-6">
                            <h3 className="text-[10px] font-black uppercase text-brand tracking-[0.2em] flex items-center gap-2">
                                <Hammer size={14} /> Service Checklist
                            </h3>
                            <div className="space-y-4">
                                {job.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                                item.status === 'completed' ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-200"
                                            )}>
                                                {item.status === 'completed' && <CheckCircle2 size={12} />}
                                            </div>
                                            <span className={cn("text-xs font-bold", item.status === 'completed' ? "text-slate-400 line-through" : "text-ink-heading dark:text-white")}>
                                                {item.description}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Support & Contact */}
                    <Card className="rounded-[2.5rem] bg-brand text-white shadow-xl shadow-brand/20 relative overflow-hidden">
                        <CardContent className="p-10 space-y-8 relative z-10">
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">Service Advisor</h3>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full border-2 border-white/20 p-1">
                                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=advisor" className="rounded-full" alt="advisor" />
                                    </div>
                                    <div>
                                        <p className="font-black text-xl tracking-tight">Tanvir Ahmed</p>
                                        <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Workshop Lead</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-white/10">
                                <button className="w-full h-14 bg-white text-brand rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 shadow-lg">
                                    <Phone size={18} /> Call Advisor
                                </button>
                                <button className="w-full h-14 bg-white/10 backdrop-blur-md rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-white/20 transition-all">
                                    <MapPin size={18} /> Workshop Location
                                </button>
                            </div>
                        </CardContent>
                        <div className="absolute -bottom-10 -right-10 text-white opacity-10 pointer-events-none">
                            <User size={200} />
                        </div>
                    </Card>
                </div>

                <div className="text-center py-12">
                    <p className="text-xs font-bold text-slate-400">RC Autocore Live Tracking Systems v2.0</p>
                </div>
            </div>
        </div>
    );
};

export default CustomerLiveTracking;
