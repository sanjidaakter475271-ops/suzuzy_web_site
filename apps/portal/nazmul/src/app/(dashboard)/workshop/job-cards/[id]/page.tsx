'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWorkshopStore } from '@/stores/workshopStore';
import Breadcrumb from '@/components/Breadcrumb';
import { Button, Card, CardContent } from '@/components/ui';
import JobCardTimeline from '@/components/workshop/JobCardTimeline';
import {
    User, Car, Phone, MapPin,
    ClipboardList, Wrench, ShieldCheck,
    Printer, Trash2, ArrowLeft, RefreshCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';

const JobCardDetailPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const { jobCards, updateJobCardStatus } = useWorkshopStore();

    const job = jobCards.find(j => j.id === id);

    if (!job) return (
        <div className="p-8 text-center">
            <h2 className="text-2xl font-bold">Job Card not found</h2>
            <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
        </div>
    );

    const handleStatusUpdate = (newStatus: any) => {
        updateJobCardStatus(job.id, newStatus);
    };

    return (
        <div className="p-6 lg:p-8 space-y-8 animate-fade">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-3 bg-surface-card dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-2xl text-ink-muted hover:text-brand transition-all"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <Breadcrumb items={[{ label: 'Workshop', href: '/workshop/job-cards' }, { label: job.jobNo }]} />
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="rounded-xl flex items-center gap-2">
                        <Printer size={18} /> Print Job Card
                    </Button>
                    <Button variant="danger" className="rounded-xl p-2.5">
                        <Trash2 size={18} />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Stats & Timeline */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Header Card */}
                    <Card className="rounded-[2.5rem] overflow-hidden">
                        <CardContent className="p-10 space-y-8">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand">Job Sequence</p>
                                        <div className="h-px w-8 bg-brand/30"></div>
                                    </div>
                                    <h1 className="text-4xl font-black text-ink-heading dark:text-white uppercase tracking-tighter">JOB #{job.jobNo}</h1>
                                    <p className="text-ink-muted font-bold mt-2 flex items-center gap-2">
                                        <RefreshCcw size={14} className="text-brand" />
                                        Last Update: {new Date(job.updatedAt).toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-6 bg-brand/5 border-2 border-brand/10 rounded-3xl text-right">
                                    <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-1">Estimated Bill</p>
                                    <p className="text-3xl font-black text-ink-heading dark:text-white">৳{job.total}</p>
                                </div>
                            </div>

                            <JobCardTimeline status={job.status} />
                        </CardContent>
                    </Card>

                    {/* Task List */}
                    <Card className="rounded-[2.5rem]">
                        <CardContent className="p-10 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black text-ink-heading dark:text-white uppercase flex items-center gap-3 tracking-tight">
                                    <Wrench size={24} className="text-brand" /> Service Items & Tasks
                                </h3>
                                <Button variant="secondary" className="rounded-xl text-xs">Add Task</Button>
                            </div>

                            <div className="space-y-4">
                                {job.items.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="p-5 bg-surface-page dark:bg-black/20 rounded-2xl border-2 border-surface-border dark:border-white/5 flex items-center justify-between group hover:border-brand/30 transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                                item.status === 'completed' ? "bg-emerald-500 border-emerald-500 text-white" : "border-ink-muted/30"
                                            )}>
                                                {item.status === 'completed' && <ShieldCheck size={14} />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-ink-heading dark:text-white">{item.description}</p>
                                                <p className="text-[10px] font-black uppercase text-ink-muted tracking-widest">{item.status}</p>
                                            </div>
                                        </div>
                                        <p className="font-black text-ink-heading dark:text-white">৳{item.cost}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Information Panes */}
                <div className="space-y-8">
                    {/* Customer Info */}
                    <Card className="rounded-[2.5rem] bg-brand text-white overflow-hidden shadow-xl shadow-brand/20">
                        <CardContent className="p-8 space-y-6 relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <User size={100} />
                            </div>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-80">Customer Profile</h3>
                            <div className="space-y-4 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-xl">
                                        {job.customerName?.charAt(0) || 'C'}
                                    </div>
                                    <div>
                                        <p className="font-black text-lg leading-none">{job.customerName}</p>
                                        <p className="text-[10px] font-bold opacity-70 mt-1 uppercase tracking-widest">LOYALTY MEMBER</p>
                                    </div>
                                </div>
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center gap-3 text-sm font-bold opacity-90 hover:opacity-100 transition-opacity cursor-pointer">
                                        <Phone size={16} /> {job.customerPhone}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-bold opacity-90 hover:opacity-100 transition-opacity cursor-pointer">
                                        <MapPin size={16} /> Dhaka, Bangladesh
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Vehicle Info */}
                    <Card className="rounded-[2.5rem] border-2 border-surface-border dark:border-dark-border">
                        <CardContent className="p-8 space-y-6">
                            <h3 className="text-[10px] font-black text-ink-muted uppercase tracking-[0.2em]">Vehicle Identity</h3>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-surface-page dark:bg-dark-page rounded-2xl text-brand border border-surface-border dark:border-dark-border">
                                        <Car size={32} />
                                    </div>
                                    <div>
                                        <p className="text-xl font-black text-ink-heading dark:text-white tracking-tighter">{job.vehicleModel}</p>
                                        <p className="text-xs font-bold text-ink-muted uppercase tracking-widest">{job.vehicleRegNo}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-surface-page dark:bg-dark-page rounded-2xl border border-dotted border-surface-border dark:border-dark-border">
                                        <p className="text-[10px] font-black text-ink-muted uppercase mb-1">Chassis</p>
                                        <p className="text-sm font-black text-ink-heading dark:text-white">{job.chassisNo || 'N/A'}</p>
                                    </div>
                                    <div className="p-4 bg-surface-page dark:bg-dark-page rounded-2xl border border-dotted border-surface-border dark:border-dark-border">
                                        <p className="text-[10px] font-black text-ink-muted uppercase mb-1">Ramp ID</p>
                                        <p className="text-sm font-black text-brand">{job.assignedRampId || 'WAITING'}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Status Update */}
                    <Card className="rounded-[2.5rem] border-2 border-brand/20 bg-brand/5">
                        <CardContent className="p-8 space-y-6">
                            <h3 className="text-xs font-black text-brand uppercase tracking-[0.2em] flex items-center gap-2">
                                <RefreshCcw size={14} /> Update Status
                            </h3>
                            <div className="grid grid-cols-1 gap-2">
                                {['in-diagnosis', 'in-service', 'qc-done', 'ready', 'delivered'].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => handleStatusUpdate(s)}
                                        className={cn(
                                            "w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                                            job.status === s ? "bg-brand text-white border-brand shadow-lg shadow-brand/20" : "bg-white dark:bg-dark-card border-transparent text-ink-muted hover:border-brand/30"
                                        )}
                                    >
                                        {s.replace('-', ' ')}
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default JobCardDetailPage;
