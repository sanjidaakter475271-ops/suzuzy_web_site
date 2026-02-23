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
import Image from 'next/image';

const CustomerLiveTracking = () => {
    const { id } = useParams(); // Using id as jobNo
    const router = useRouter();
    const { jobCards } = useWorkshopStore();

    const jobNo = Array.isArray(id) ? id[0] : id;
    const job = jobCards.find(j => j.jobNo === jobNo);

    if (!job) return (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 animate-fade">
            <div className="p-6 bg-red-500/10 text-red-600 rounded-[2rem] shadow-xl shadow-red-500/10"><AlertCircle size={64} /></div>
            <div>
                <h1 className="text-3xl font-black uppercase tracking-tight text-ink-heading dark:text-white">Job Not Found</h1>
                <p className="text-ink-muted mt-2 max-w-sm font-bold">We couldn't find a service record for #{jobNo}.</p>
            </div>
            <Button onClick={() => router.push('/customer/dashboard')} variant="outline" className="rounded-2xl px-10 h-14 uppercase tracking-widest text-xs font-black border-2 border-surface-border">Go to Dashboard</Button>
        </div>
    );

    const steps = [
        { label: 'Received', value: 'received', desc: 'Vehicle received at workshop' },
        { label: 'Diagnosis', value: 'in-diagnosis', desc: 'Technician is inspecting issues' },
        { label: 'Service', value: 'in-service', desc: 'Work is currently in progress' },
        { label: 'Ready', value: 'ready', desc: 'Finished and ready for pickup' }
    ];

    const currentStepIdx = steps.findIndex(s => s.value === job.status) === -1 ?
        (job.status === 'delivered' ? 4 : 0) :
        steps.findIndex(s => s.value === job.status);

    return (
        <div className="space-y-8 animate-fade">
            <div className="flex items-center gap-4">
                <Button variant="ghost" className="w-12 h-12 rounded-2xl p-0 hover:bg-surface-border dark:hover:bg-white/10" onClick={() => router.back()}>
                    <ChevronLeft size={24} />
                </Button>
                <div>
                    <p className="text-[10px] font-black text-brand uppercase tracking-widest">Live Status</p>
                    <h2 className="text-3xl font-black uppercase tracking-tight text-ink-heading dark:text-white">Job #{job.jobNo}</h2>
                </div>
            </div>

            {/* Visual Tracker */}
            <Card className="rounded-[2.5rem] overflow-hidden border-2 border-surface-border dark:border-dark-border shadow-2xl bg-white dark:bg-dark-card">
                <CardContent className="p-10 space-y-12">
                    <div className="relative">
                        {/* Connecting Line */}
                        <div className="hidden md:block absolute left-0 right-0 top-6 h-2 bg-surface-page dark:bg-dark-page rounded-full z-0"></div>
                        <div
                            className="hidden md:block absolute left-0 top-6 h-2 bg-brand rounded-full transition-all duration-1000 z-0"
                            style={{ width: `${(currentStepIdx / (steps.length - 1)) * 100}%` }}
                        ></div>

                        <div className="flex flex-col md:flex-row justify-between relative z-10">
                            {steps.map((step, idx) => (
                                <div key={idx} className="flex flex-row md:flex-col items-center gap-4 md:gap-6 mb-8 md:mb-0 group">
                                    <div className={cn(
                                        "w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all duration-500 shadow-xl",
                                        idx < currentStepIdx ? "bg-emerald-500 border-white dark:border-dark-card text-white" :
                                            idx === currentStepIdx ? "bg-brand border-white dark:border-dark-card text-white scale-125 ring-4 ring-brand/20" :
                                                "bg-white dark:bg-dark-page border-surface-border dark:border-dark-border text-ink-muted"
                                    )}>
                                        {idx < currentStepIdx ? <CheckCircle2 size={24} /> :
                                            idx === currentStepIdx ? <Clock size={24} className="animate-spin-slow" /> :
                                                <span className="font-black text-sm">{idx + 1}</span>}
                                    </div>
                                    <div className="text-left md:text-center md:flex-1">
                                        <p className={cn(
                                            "text-xs font-black uppercase tracking-widest transition-colors",
                                            idx <= currentStepIdx ? "text-ink-heading dark:text-white" : "text-ink-muted/50"
                                        )}>{step.label}</p>
                                        <p className="text-[10px] font-bold text-ink-muted mt-1 md:max-w-[120px]">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="h-px bg-surface-border dark:bg-dark-border w-full"></div>

                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-brand/10 text-brand rounded-[1.5rem] flex items-center justify-center shadow-inner"><Bike size={40} /></div>
                            <div>
                                <p className="text-xl font-black text-ink-heading dark:text-white tracking-tight">{job.vehicleModel}</p>
                                <p className="text-sm font-black text-ink-muted bg-surface-page dark:bg-dark-page px-3 py-1 rounded-lg border border-surface-border dark:border-dark-border inline-block mt-2">
                                    {job.vehicleRegNo}
                                </p>
                            </div>
                        </div>
                        <div className="text-center md:text-right bg-surface-page dark:bg-dark-page p-4 rounded-2xl border border-surface-border dark:border-dark-border">
                            <p className="text-[10px] font-black text-ink-muted uppercase tracking-widest mb-1">Estimated Completion</p>
                            <p className="text-2xl font-black text-ink-heading dark:text-white">Today, 5:30 PM</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Checklist */}
                <Card className="rounded-[2.5rem] border-2 border-surface-border dark:border-dark-border bg-white dark:bg-dark-card shadow-xl overflow-hidden">
                    <CardContent className="p-10 space-y-8">
                        <div className="flex items-center gap-3 text-brand">
                            <Hammer size={24} />
                            <h3 className="text-sm font-black uppercase tracking-[0.2em]">Service Checklist</h3>
                        </div>
                        <div className="space-y-4">
                            {job.items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4 group p-3 rounded-xl hover:bg-surface-page dark:hover:bg-dark-page transition-colors">
                                    <div className={cn(
                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
                                        item.status === 'completed' ? "bg-emerald-500 border-emerald-500 text-white" : "border-ink-muted/30 text-transparent"
                                    )}>
                                        <CheckCircle2 size={14} />
                                    </div>
                                    <span className={cn("text-sm font-bold flex-1", item.status === 'completed' ? "text-ink-muted line-through decoration-2 decoration-ink-muted/30" : "text-ink-heading dark:text-white")}>
                                        {item.description}
                                    </span>
                                    <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg",
                                        item.status === 'completed' ? "bg-emerald-100 text-emerald-600" :
                                            item.status === 'in-progress' ? "bg-brand/10 text-brand" : "bg-slate-100 text-slate-500"
                                    )}>
                                        {item.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Advisor Card */}
                <Card className="rounded-[2.5rem] bg-brand text-white shadow-xl shadow-brand/20 relative overflow-hidden h-full">
                    <CardContent className="p-10 space-y-8 relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-4">Service Advisor</h3>
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-[1.5rem] border-2 border-white/20 p-1 relative">
                                    <Image src="https://api.dicebear.com/7.x/avataaars/svg?seed=advisor" fill className="rounded-2xl" alt="advisor" />
                                </div>
                                <div>
                                    <p className="font-black text-2xl tracking-tight">Tanvir Ahmed</p>
                                    <p className="text-xs font-bold opacity-70 uppercase tracking-widest mt-1">Workshop Lead</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Button className="w-full h-14 bg-white text-brand hover:bg-slate-100 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg gap-3">
                                <Phone size={18} /> Call Advisor
                            </Button>
                            <Button className="w-full h-14 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl font-black uppercase text-[10px] tracking-widest gap-3 border border-white/10">
                                <MapPin size={18} /> Workshop Location
                            </Button>
                        </div>
                    </CardContent>
                    <div className="absolute -bottom-10 -right-10 text-white opacity-10 pointer-events-none">
                        <User size={240} />
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default CustomerLiveTracking;
