'use client';

import React, { memo, useCallback, useMemo, useState, useEffect } from 'react';
import {
    Users, Clock, Plus,
    Trash2, LayoutGrid, Search,
    ShieldCheck, Activity, FileText,
    RefreshCw
} from 'lucide-react';
import Breadcrumb from '@/components/service-admin/Breadcrumb';
import { Card, CardContent } from '@/components/service-admin/ui';
import { useWorkshopStore } from '@/stores/service-admin/workshopStore';
import { cn } from '@/lib/utils';
import { Technician } from '@/types/service-admin/workshop';
import { confirmAction } from '@/lib/confirm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

// New HR Components
import { Technician360Panel } from '@/components/service-admin/hr/Technician360Panel';
import { DailyTimeline } from '@/components/service-admin/hr/DailyTimeline';
import { LeaveManagement } from '@/components/service-admin/hr/LeaveManagement';

// Memoized Stat Card - Compact Snappy Version
const StatCard = memo(({ label, value, icon: Icon, color, bg, hide, delay }: any) => {
    if (hide) return null;
    return (
        <div className={cn(
            "px-5 py-4 bg-white dark:bg-white/[0.03] border border-surface-border dark:border-white/5 rounded-[1.8rem] shadow-soft flex items-center gap-4 hover:shadow-2xl transition-all duration-500 ease-out group shrink min-w-0 w-full sm:w-auto animate-in fade-in slide-in-from-right-4",
            delay
        )}>
            <div className={cn("w-10 h-10 lg:w-12 lg:h-12 rounded-[1rem] lg:rounded-[1.5rem] flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-lg group-hover:rotate-6 shrink-0", bg, color)} >
                <Icon size={20} className="lg:w-[22px] lg:h-[22px]" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[8px] lg:text-[9px] font-black uppercase tracking-[0.2em] text-ink-muted/60 leading-none mb-1 truncate">{label}</p>
                <p className={cn("text-lg lg:text-2xl font-black tracking-tighter leading-none truncate", color)}>{value}</p>
            </div>
        </div>
    );
});
StatCard.displayName = 'StatCard';

const TechnicianCommandCenter = () => {
    const {
        technicians,
        addTechnician,
        deleteTechnician,
        approveTechnician,
        fetchStaffData,
        isLoading
    } = useWorkshopStore();

    const [activeTab, setActiveTab] = useState('fleet');
    const [selectedTechId, setSelectedTechId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchStaffData();
    }, [fetchStaffData]);

    const stats = useMemo(() => ({
        total: technicians.length,
        active: technicians.filter(t => t.currentStatus === 'active').length,
        onBreak: technicians.filter(t => t.currentStatus === 'break').length,
        pending: technicians.filter(t => t.status === 'pending').length
    }), [technicians]);

    const filteredTechs = useMemo(() => technicians.filter(t =>
        t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id?.toLowerCase().includes(searchQuery.toLowerCase())
    ), [technicians, searchQuery]);

    const selectedTechnician = useMemo(() =>
        technicians.find(t => t.id === selectedTechId) || null
        , [technicians, selectedTechId]);

    const handleTechClick = useCallback((tech: Technician) => {
        setSelectedTechId(tech.id);
    }, []);

    const handleCloseSidePanel = useCallback(() => setSelectedTechId(null), []);

    return (
        <div className="min-h-full flex flex-col bg-[#fafafa] dark:bg-[#080809] relative transition-colors duration-700 w-full">
            {/* Cinematic Background Ambient */}
            <div className="absolute top-0 right-0 w-[80%] h-[600px] bg-brand/[0.015] blur-[250px] pointer-events-none rounded-full overflow-hidden" />

            {/* Header Section - Static */}
            <div className="p-4 lg:p-8 space-y-6 relative z-10 w-full max-w-[1600px] mx-auto">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                    <div className="space-y-2 animate-in fade-in slide-in-from-left-4 duration-500 ease-out min-w-0">
                        <div className="opacity-40 text-xs">
                            <Breadcrumb items={[{ label: 'Workshop', href: '/service-admin/workshop' }, { label: 'Staff Hub' }]} />
                        </div>
                        <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black text-ink-heading dark:text-white tracking-tighter flex items-center flex-wrap gap-3 leading-none uppercase italic">
                            Staff <span className="text-brand">Command</span>
                            <Badge className="bg-emerald-500/10 text-emerald-600 text-[8px] px-2 py-1 border border-emerald-500/20 tracking-widest font-black uppercase animate-pulse">Live</Badge>
                        </h1>
                    </div>

                    {/* Quick Stats - More Compact */}
                    <div className="flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-right-8 duration-700">
                        <StatCard label="Fleet" value={stats.total} icon={Users} color="text-brand" bg="bg-brand/10" delay="duration-500" />
                        <StatCard label="Live" value={stats.active} icon={Activity} color="text-success" bg="bg-success/10" delay="duration-500 delay-75" />
                        <StatCard label="Break" value={stats.onBreak} icon={Clock} color="text-amber-500" bg="bg-amber-500/10" delay="duration-500 delay-150" />
                    </div>
                </div>

                {/* Tab Switcher & Search Row - Static */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-surface-border dark:border-white/5">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                        <TabsList className="bg-white dark:bg-white/5 border border-surface-border dark:border-white/5 p-1 h-12 rounded-2xl shadow-soft">
                            <TabsTrigger value="fleet" className="px-6 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all gap-2">
                                <LayoutGrid size={12} /> Directory
                            </TabsTrigger>
                            <TabsTrigger value="attendance" className="px-6 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all gap-2">
                                <Clock size={12} /> Timeline
                            </TabsTrigger>
                            <TabsTrigger value="leaves" className="px-6 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all gap-2">
                                <FileText size={12} /> Leaves
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-[280px] group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted/30 group-focus-within:text-brand transition-all" size={14} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="SEARCH AGENTS..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-white/[0.03] border border-surface-border dark:border-white/5 rounded-xl text-[10px] font-black focus:outline-none focus:ring-2 focus:ring-brand/5 transition-all placeholder:text-ink-muted/20"
                            />
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => fetchStaffData()}
                            className="rounded-xl h-10 w-10 border-surface-border dark:border-white/5 bg-white dark:bg-white/[0.03] text-ink-muted hover:text-brand transition-all shadow-soft"
                        >
                            <RefreshCw size={16} className={cn(isLoading && "animate-spin")} />
                        </Button>
                        <Button
                            onClick={() => addTechnician({ name: 'New Specialist' })}
                            className="rounded-xl h-10 px-4 bg-brand text-white font-black text-[9px] uppercase tracking-widest shadow-lg shadow-brand/20 hover:-translate-y-0.5 active:translate-y-0 transition-all gap-2"
                        >
                            <Plus size={14} /> Expand
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content Area - Full page scroll or dedicated scroll section */}
            <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 lg:px-8 pb-32">
                <Tabs value={activeTab} className="w-full mt-0">
                    <TabsContent value="fleet" className="mt-0 outline-none">
                        <div className="grid gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {isLoading ? (
                                // Fleet Skeletons
                                Array.from({ length: 8 }).map((_, idx) => (
                                    <Card key={`skeleton-${idx}`} className="h-[380px] rounded-[2.8rem] border-2 border-surface-border dark:border-white/5 animate-pulse">
                                        <CardContent className="p-6 space-y-6">
                                            <div className="flex items-center gap-5">
                                                <div className="w-16 h-16 rounded-[1.8rem] bg-slate-200 dark:bg-slate-800" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-32" />
                                                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-20" />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="h-14 bg-slate-200 dark:bg-slate-800 rounded-[1.8rem]" />
                                                <div className="h-14 bg-slate-200 dark:bg-slate-800 rounded-[1.8rem]" />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                                                <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                                            </div>
                                            <div className="mt-auto h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                filteredTechs.map((tech) => (
                                    <TechCard
                                        key={tech.id}
                                        tech={tech}
                                        onClick={() => handleTechClick(tech)}
                                        onDelete={() => {
                                            confirmAction({
                                                title: "Remove Agent",
                                                description: "Remove this agent from the active fleet stream?",
                                                variant: 'danger',
                                                onConfirm: () => deleteTechnician(tech.id)
                                            });
                                        }}
                                        onApprove={() => {
                                            confirmAction({
                                                title: "Authorize Agent",
                                                description: "Grant operational clearance to this technician?",
                                                onConfirm: () => approveTechnician(tech.id)
                                            });
                                        }}
                                    />
                                ))
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="attendance" className="mt-0 outline-none">
                        <DailyTimeline technicians={technicians} isLoading={isLoading} />
                    </TabsContent>

                    <TabsContent value="leaves" className="mt-0 outline-none">
                        <LeaveManagement />
                    </TabsContent>
                </Tabs>
            </div>

            {/* The Unified 360 Profile Panel */}
            <Technician360Panel
                technician={selectedTechnician}
                isOpen={!!selectedTechId}
                onClose={handleCloseSidePanel}
                onApprove={(id) => {
                    confirmAction({
                        title: "Authorize Agent",
                        description: "Grant operational clearance to this technician?",
                        onConfirm: () => approveTechnician(id)
                    });
                }}
                onDelete={(id) => {
                    confirmAction({
                        title: "Remove Agent",
                        description: "Remove this agent from the active fleet stream?",
                        variant: 'danger',
                        onConfirm: () => deleteTechnician(id)
                    });
                }}
            />
        </div>
    );
};

// Internal TechCard for the Fleet Grid
const TechCard = memo(({ tech, onClick, onDelete, onApprove }: any) => {
    const workloadPercentage = (tech.activeJobs / tech.capacity) * 100;
    const isPending = tech.status === 'pending';

    return (
        <Card
            onClick={onClick}
            className={cn(
                "relative group cursor-pointer transition-all duration-500 h-[380px] rounded-[2.8rem] border-2 flex flex-col p-1.5 overflow-hidden shadow-2xl animate-in zoom-in-95 will-change-transform ease-out",
                "border-surface-border dark:border-white/5 bg-white dark:bg-white/[0.03] hover:border-brand/40 hover:-translate-y-2 hover:shadow-brand/5",
                isPending && "border-brand/20 opacity-80"
            )}
        >
            <CardContent className="h-full rounded-[2.3rem] bg-white dark:bg-black/80 shadow-inner p-6 flex flex-col relative z-10 transition-all duration-500 group-hover:bg-black/60">
                <div className="flex items-center gap-5 mb-6 transition-transform duration-500 group-hover:scale-105">
                    <div className="relative shrink-0">
                        <img
                            src={tech.avatar}
                            className="w-16 h-16 rounded-[1.8rem] object-cover ring-4 ring-brand/10 shadow-3xl grayscale group-hover:grayscale-0 transition-all duration-500 ease-out"
                            alt={tech.name}
                        />
                        <div className={cn(
                            "absolute -top-1 -right-1 w-5 h-5 rounded-full border-[4px] border-white dark:border-black shadow-2xl z-20 transition-all duration-500",
                            tech.currentStatus === 'active' ? 'bg-success' : tech.currentStatus === 'break' ? 'bg-amber-500 animate-pulse' : isPending ? 'bg-indigo-500' : 'bg-slate-400'
                        )} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-xl font-black text-ink-heading dark:text-white truncate tracking-tighter leading-tight mb-1 uppercase italic opacity-80 group-hover:opacity-100 transition-opacity">
                            {tech.name}
                        </h3>
                        <div className="flex items-center gap-2.5">
                            <span className="bg-brand/10 text-brand text-[8px] font-black px-1.5 py-0.5 rounded-lg tracking-[0.1em] uppercase border border-brand/20">AGENT</span>
                            <p className="text-[9px] font-black text-ink-muted/40 uppercase tracking-[0.2em]">U-ID: {tech.id?.split('-')[0]}</p>
                        </div>
                    </div>
                </div>

                {isPending ? (
                    <div className="flex-1 flex flex-col justify-center gap-4">
                        <div className="p-5 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 text-indigo-500 text-center space-y-2">
                            <Clock size={24} className="mx-auto opacity-30 animate-pulse" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Uplink Pending</p>
                            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">Awaiting security clearance from central command</p>
                        </div>
                        <Button
                            onClick={(e: any) => { e.stopPropagation(); onApprove?.(); }}
                            className="w-full bg-brand text-white py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-brand/30 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
                        >
                            <ShieldCheck size={14} /> Authorize Agent
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-3 mb-5 animate-in fade-in slide-in-from-bottom-1 duration-500 delay-150">
                            <div className="p-3.5 bg-surface-page dark:bg-white/5 rounded-[1.8rem] text-center border border-transparent group-hover:border-brand/20 transition-all duration-500 shadow-sm">
                                <span className="text-[7px] font-black text-ink-muted/40 uppercase tracking-widest">Jobs Today</span>
                                <p className="text-xl font-black text-brand tracking-tighter tabular-nums">{tech.activeJobs || 0}</p>
                            </div>
                            <div className="p-3.5 bg-surface-page dark:bg-white/5 rounded-[1.8rem] text-center border border-transparent group-hover:border-emerald-500/20 transition-all duration-500 shadow-sm">
                                <span className="text-[7px] font-black text-ink-muted/40 uppercase tracking-widest">Efficiency</span>
                                <p className="text-xl font-black text-success tracking-tighter tabular-nums">94%</p>
                            </div>
                        </div>

                        <div className="space-y-2.5 mb-5 animate-in fade-in slide-in-from-bottom-1 duration-500 delay-200">
                            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.3em] text-ink-muted/60">
                                <span className="truncate">Workload stream</span>
                                <span className={cn("shrink-0", workloadPercentage > 80 ? 'text-danger' : 'text-brand')}>
                                    {tech.activeJobs}/{tech.capacity} UNIT
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-surface-page dark:bg-white/10 rounded-full overflow-hidden shadow-inner">
                                <div
                                    className={cn("h-full transition-all duration-1000 ease-out rounded-full", workloadPercentage > 80 ? 'bg-danger shadow-[0_0_6px_#ef4444]' : 'bg-brand shadow-[0_0_6px_#eab308]') }
                                    style={{ width: `${Math.max(workloadPercentage, 10)}%` }}
                                >
                                    <div className="w-full h-full bg-white/20 animate-pulse" />
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-surface-border dark:border-white/10 flex items-center justify-between animate-in fade-in duration-500 delay-300">
                            <div className="flex items-center gap-2 text-ink-muted/30 italic">
                                <Activity size={12} className={cn("group-hover:text-brand transition-colors duration-500", tech.currentStatus === 'active' && "animate-pulse")} />
                                <span className="text-[8px] font-black uppercase tracking-[0.3em]">{tech.currentStatus || 'Offline'}</span>
                            </div>
                            <button className="text-[10px] font-black uppercase text-brand tracking-widest truncate group-hover:translate-x-1 transition-transform">
                                Access 360 stream
                            </button>
                        </div>
                    </>
                )}
            </CardContent>

            <div className="absolute top-4 right-4 flex flex-col gap-2 transition-all duration-500 opacity-0 group-hover:opacity-100 translate-x-3 group-hover:translate-x-0 z-20">
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                    className="w-10 h-10 rounded-2xl bg-danger/10 text-danger border border-danger/20 flex items-center justify-center hover:bg-danger hover:text-white transition-all shadow-lg backdrop-blur-xl duration-300"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </Card>
    );
});
TechCard.displayName = 'TechCard';

export default memo(TechnicianCommandCenter);
