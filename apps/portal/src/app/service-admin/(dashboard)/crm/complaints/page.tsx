'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
    MessageSquare,
    Search,
    AlertCircle,
    CheckCircle2,
    Calendar,
    Bike,
    Clock,
    User,
    Star,
    ChevronRight,
    TrendingUp,
    Phone,
    FileText,
    Filter
} from 'lucide-react';
import { format } from 'date-fns';
import Breadcrumb from '@/components/service-admin/Breadcrumb';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/service-admin/ui';
import { cn } from '@/lib/utils';
import { ComplaintsData, GlobalComplaint, GlobalRating } from '@/types/service-admin/complaints';

const ComplaintsPage = () => {
    const [activeTab, setActiveTab] = useState<'complaints' | 'ratings'>('complaints');
    const [searchQuery, setSearchQuery] = useState('');

    const { data: crmData, isLoading, error } = useQuery({
        queryKey: ['global-crm-feedback'],
        queryFn: async () => {
            const res = await axios.get('/api/v1/crm/complaints');
            return res.data.data as ComplaintsData;
        }
    });

    const filteredComplaints = (crmData?.complaints || []).filter(c =>
        c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredRatings = (crmData?.ratings || []).filter(r =>
        r.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.ticketNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="p-6 lg:p-8 space-y-8 animate-pulse">
                <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="flex justify-between items-center">
                    <div className="space-y-2">
                        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded" />
                        <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                    <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 lg:p-8 flex flex-col items-center justify-center h-[70vh] space-y-4">
                <AlertCircle size={48} className="text-danger" />
                <h2 className="text-xl font-bold">Failed to load data</h2>
                <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
        );
    }

    const avgRating = crmData?.ratings && crmData.ratings.length > 0
        ? (crmData.ratings.reduce((sum, r) => sum + r.rating, 0) / crmData.ratings.length).toFixed(1)
        : "N/A";

    return (
        <div className="p-6 lg:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                    <Breadcrumb items={[{ label: 'CRM', href: '/service-admin/crm' }, { label: 'Complaints & Rating' }]} />
                    <h1 className="text-3xl font-black text-ink-heading dark:text-white">Complaints & Rating</h1>
                    <p className="text-sm text-ink-muted italic">Manage customer issues and monitor service quality.</p>
                </div>
                <div className="flex gap-3">
                    <Card className="bg-brand-soft border-none px-4 py-2 flex items-center gap-3">
                        <div className="p-2 bg-brand rounded-xl text-white">
                            <Star size={20} className="fill-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-brand">Avg. Rating</p>
                            <h4 className="text-xl font-black text-ink-heading dark:text-white">{avgRating}</h4>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex gap-2 p-1.5 bg-surface-page dark:bg-dark-page rounded-2xl inline-flex transition-all duration-500">
                    <button
                        onClick={() => setActiveTab('complaints')}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 transform",
                            activeTab === 'complaints'
                                ? "bg-white dark:bg-dark-card text-brand shadow-soft scale-105"
                                : "text-ink-muted hover:text-ink-heading dark:hover:text-white hover:scale-105"
                        )}
                    >
                        <MessageSquare size={18} className={cn("transition-transform duration-300", activeTab === 'complaints' && "scale-110")} />
                        Complaints ({crmData?.complaints.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab('ratings')}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 transform",
                            activeTab === 'ratings'
                                ? "bg-white dark:bg-dark-card text-amber-500 shadow-soft scale-105"
                                : "text-ink-muted hover:text-ink-heading dark:hover:text-white hover:scale-105"
                        )}
                    >
                        <Star size={18} className={cn("transition-transform duration-300", activeTab === 'ratings' && "scale-110")} />
                        Service Ratings ({crmData?.ratings.length || 0})
                    </button>
                </div>

                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted group-focus-within:text-brand transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder={activeTab === 'complaints' ? "Search complaints..." : "Search feedback..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-surface-page dark:bg-dark-page border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand/20 transition-all outline-none"
                    />
                </div>
            </div>

            <div className="min-h-[500px]">
                {activeTab === 'complaints' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {filteredComplaints.length > 0 ? (
                            filteredComplaints.map((c) => (
                                <Card key={c.id} className="transition-all duration-300 hover:scale-[1.01] hover:shadow-xl group border-l-4 border-l-brand">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="space-y-1">
                                                <h3 className="text-lg font-bold text-ink-heading dark:text-white group-hover:text-brand transition-colors">
                                                    {c.subject}
                                                </h3>
                                                <div className="flex items-center gap-2 text-xs font-black text-ink-muted uppercase">
                                                    <User size={12} className="text-brand" />
                                                    {c.customerName} • {format(new Date(c.createdAt), "dd MMM yyyy")}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <span className={cn(
                                                    "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase",
                                                    c.priority === "high" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                                                )}>
                                                    {c.priority}
                                                </span>
                                                <span className={cn(
                                                    "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase",
                                                    c.status === "open" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                                                )}>
                                                    {c.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-4 border-t border-surface-border dark:border-dark-border/50">
                                            <p className="text-xs font-bold text-ink-muted">
                                                ID: <span className="text-ink-heading dark:text-white">#{c.id.substr(0, 8)}</span>
                                            </p>
                                            <Button variant="ghost" className="text-xs gap-1 py-1 hover:bg-brand-soft hover:text-brand transition-all">
                                                View Thread <ChevronRight size={14} />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-2 py-32 text-center bg-surface-page dark:bg-dark-page rounded-3xl border-2 border-dashed border-surface-border">
                                <MessageSquare size={48} className="mx-auto text-slate-200 mb-4" />
                                <h3 className="text-xl font-bold text-ink-muted">No complaints found.</h3>
                                <p className="text-sm text-ink-muted/60 mt-1">Try adjusting your search query.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'ratings' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {filteredRatings.length > 0 ? (
                            filteredRatings.map((r) => (
                                <Card key={r.id} className="transition-all duration-300 hover:scale-[1.01] hover:shadow-xl group">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="space-y-1">
                                                <div className="flex gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={18}
                                                            className={cn("transition-all duration-300", i < r.rating ? "fill-amber-500 text-amber-500 scale-110" : "text-slate-100")}
                                                        />
                                                    ))}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-black text-ink-muted uppercase pt-1">
                                                    <User size={12} className="text-amber-500" />
                                                    {r.customerName} • {format(new Date(r.createdAt), "dd MMM yyyy")}
                                                </div>
                                            </div>
                                            <span className="bg-brand-soft text-brand text-[10px] font-black uppercase px-2.5 py-1 rounded-lg">
                                                #{r.ticketNumber || "N/A"}
                                            </span>
                                        </div>

                                        <div className="bg-surface-page dark:bg-dark-page/50 p-4 rounded-2xl mb-6 border border-surface-border dark:border-dark-border/50 group-hover:border-amber-200 transition-all">
                                            <p className="text-sm font-medium italic text-ink-heading dark:text-white leading-relaxed">
                                                "{r.comment || "No written feedback provided."}"
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-8 pt-2">
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-[10px] font-black text-ink-muted uppercase">
                                                    <span>Staff Conduct</span>
                                                    <span className="text-emerald-500">{r.staffRating}/5</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-emerald-500 transition-all duration-1000"
                                                        style={{ width: `${(r.staffRating / 5) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-[10px] font-black text-ink-muted uppercase">
                                                    <span>Speed & Timing</span>
                                                    <span className="text-amber-500">{r.timingRating}/5</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-amber-500 transition-all duration-1000"
                                                        style={{ width: `${(r.timingRating / 5) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-2 py-32 text-center bg-surface-page dark:bg-dark-page rounded-3xl border-2 border-dashed border-surface-border">
                                <Star size={48} className="mx-auto text-slate-200 mb-4" />
                                <h3 className="text-xl font-bold text-ink-muted">No ratings yet.</h3>
                                <p className="text-sm text-ink-muted/60 mt-1">Service feedback will appear here once collected.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComplaintsPage;
