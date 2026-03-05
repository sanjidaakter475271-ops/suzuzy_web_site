'use client';

import React, { memo, useCallback, useMemo, useState } from 'react';
import {
    Users,
    Clock,
    AlertTriangle,
    Plus,
    Trash2,
    LayoutGrid,
    LayoutList,
    Search,
    ShieldCheck,
    ArrowRight,
    X,
    Phone,
} from 'lucide-react';
import Breadcrumb from '@/components/service-admin/Breadcrumb';
import { Card, CardContent } from '@/components/service-admin/ui';
import { useWorkshopStore } from '@/stores/service-admin/workshopStore';
import { cn } from '@/lib/utils';
import TechSidePanel from '@/components/service-admin/workshop/TechSidePanel';
import { Technician } from '@/types/service-admin/workshop';

// Memoized Stat Card - Compact Snappy Version
const StatCard = memo(({ label, value, icon: Icon, color, bg, hide, delay }: any) => {
    if (hide) return null;
    return (
        <div className={cn(
            "px-5 py-4 bg-white dark:bg-white/[0.03] border border-surface-border dark:border-white/5 rounded-[1.8rem] shadow-soft flex items-center gap-4 hover:shadow-2xl transition-all duration-500 ease-out group shrink min-w-0 w-full sm:w-auto animate-in fade-in slide-in-from-right-4",
            delay
        )}>
            <div className={cn("w-10 h-10 lg:w-12 lg:h-12 rounded-[1rem] lg:rounded-[1.5rem] flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-lg group-hover:rotate-6 shrink-0", bg, color)}>
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

const TechnicianWorkloadPage = () => {
    const technicians = useWorkshopStore(state => state.technicians);
    const addTechnician = useWorkshopStore(state => state.addTechnician);
    const deleteTechnician = useWorkshopStore(state => state.deleteTechnician);
    const approveTechnician = useWorkshopStore(state => state.approveTechnician);

    const [selectedTechId, setSelectedTechId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const stats = useMemo(() => ({
        active: technicians.filter(t => t.status === 'active').length,
        busy: technicians.filter(t => t.status === 'busy').length,
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
        setSelectedTechId(prev => prev === tech.id ? null : tech.id);
    }, []);

    const handleCloseSidePanel = useCallback(() => setSelectedTechId(null), []);

    return (
        <div className="h-full lg:h-[calc(100vh-65px)] flex flex-col lg:flex-row overflow-hidden bg-[#fafafa] dark:bg-[#080809] relative transition-colors duration-700 w-full max-w-full">
            {/* Cinematic Background Ambient - Clipped */}
            <div className="absolute top-0 right-0 w-[80%] h-[100%] bg-brand/[0.015] blur-[250px] pointer-events-none rounded-full overflow-hidden" />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative transition-all duration-500 ease-in-out overflow-hidden w-full max-w-full">
                {/* Scrollable Shell */}
                <div className="flex-1 overflow-y-auto no-scrollbar custom-scrollbar scroll-smooth w-full">
                    <div className="p-5 lg:p-10 pb-48 space-y-8 lg:space-y-10 relative z-10 w-full max-w-[1500px] mx-auto overflow-x-hidden">
                        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-8">
                            <div className="space-y-4 lg:space-y-6 animate-in fade-in slide-in-from-left-4 duration-500 ease-out min-w-0 flex-1">
                                <div className="opacity-40 text-xs"><Breadcrumb items={[{ label: 'Workshop', href: '/service-admin/workshop' }, { label: 'Technicians' }]} /></div>
                                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black text-ink-heading dark:text-white tracking-tighter flex items-center flex-wrap gap-4 lg:gap-5 leading-none uppercase italic">
                                    Team <span className="text-brand">Excellence</span>
                                    <span className="bg-emerald-500/10 text-emerald-600 text-[9px] lg:text-[10px] px-3 py-1.5 rounded-xl border border-emerald-500/20 tracking-[0.3em] font-black uppercase shadow-2xl shadow-emerald-500/10 animate-pulse shrink-0">Elite Force</span>
                                </h1>
                                <p className="text-sm lg:text-base font-medium text-ink-muted/40 tracking-tight max-w-lg break-words">Optimize your agent resource deployment and track operational performance streams.</p>
                            </div>

                            {/* Stats Grid - Compact Wrapped */}
                            <div className="flex flex-wrap items-center gap-4 animate-in fade-in slide-in-from-right-8 duration-700 ease-out w-full xl:w-auto">
                                <StatCard label="Available" value={stats.active} icon={Users} color="text-success" bg="bg-success/10" delay="duration-500" />
                                <StatCard label="In-Mission" value={stats.busy} icon={AlertTriangle} color="text-amber-500" bg="bg-amber-500/10" delay="duration-500 delay-75" />
                                <StatCard label="Standby" value={stats.pending} icon={Clock} color="text-brand" bg="bg-brand/10" delay="duration-500 delay-150" hide={stats.pending === 0} />
                            </div>
                        </div>

                        {/* Filter & Search - Snappy Adjustment */}
                        <div className="flex flex-col md:flex-row gap-5 lg:gap-6 items-center justify-between pt-6 lg:pt-8 border-t border-surface-border dark:border-white/5 animate-in fade-in duration-700 delay-300 w-full">
                            <div className="relative w-full md:w-[400px] lg:w-[450px] group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-ink-muted/30 group-focus-within:text-brand transition-all duration-300 group-focus-within:scale-110" size={18} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="SEARCH AGENT ID..."
                                    className="w-full pl-14 pr-6 py-3.5 lg:py-4 bg-white dark:bg-white/[0.03] border border-surface-border dark:border-white/5 rounded-[1.8rem] lg:rounded-[2.2rem] text-xs lg:text-sm font-black focus:outline-none focus:ring-[8px] focus:ring-brand/5 focus:border-brand/30 transition-all duration-300 placeholder:text-ink-muted/20 placeholder:uppercase placeholder:tracking-[0.3em]"
                                />
                            </div>
                            <div className="flex items-center gap-2.5 p-1.5 bg-white dark:bg-white/[0.03] border border-surface-border dark:border-white/5 rounded-[2.2rem] shrink-0 shadow-soft">
                                <button className="p-3.5 rounded-[1.8rem] bg-surface-page dark:bg-white/5 text-ink-muted hover:text-brand transition-all duration-300 active:scale-95 hover:scale-105"><LayoutGrid size={20} /></button>
                                <button className="p-3.5 rounded-[1.8rem] text-ink-muted hover:text-brand transition-all duration-300 active:scale-95 hover:scale-105"><LayoutList size={20} /></button>
                            </div>
                        </div>

                        {/* Grid area - Reduced Scale */}
                        <div className={cn(
                            "grid gap-6 lg:gap-8 transition-all duration-500 ease-in-out w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                        )}>
                            {filteredTechs.map((tech, i) => (
                                <div
                                    key={tech.id}
                                    className="animate-in fade-in zoom-in-95 duration-500"
                                    style={{ animationDelay: `${i * 30}ms` }}
                                >
                                    <TechCard
                                        tech={tech}
                                        isSelected={selectedTechId === tech.id}
                                        onClick={() => handleTechClick(tech)}
                                        onDelete={() => { if (confirm('Remove?')) deleteTechnician(tech.id); }}
                                        onApprove={() => approveTechnician?.(tech.id)}
                                    />
                                </div>
                            ))}

                            <button
                                onClick={() => addTechnician({ name: 'Specialist Name' })}
                                className="h-[320px] lg:h-[350px] rounded-[2.8rem] lg:rounded-[3.2rem] border-2 border-dashed border-brand/20 dark:border-brand/10 bg-transparent group cursor-pointer hover:border-brand hover:bg-brand/[0.02] transition-all duration-500 flex flex-col items-center justify-center text-center p-8 lg:p-10 gap-5 lg:gap-6 active:scale-95"
                            >
                                <div className="relative">
                                    <div className="absolute inset-0 bg-brand blur-[30px] opacity-10 group-hover:opacity-25 transition-all" />
                                    <div className="relative w-14 h-14 lg:w-16 lg:h-16 rounded-[1.2rem] lg:rounded-[1.8rem] bg-white dark:bg-dark-card border border-brand/10 flex items-center justify-center text-brand transition-all duration-300 group-hover:rotate-90 group-hover:scale-110 shadow-2xl group-hover:shadow-[0_0_50px_rgba(234,179,8,0.2)]">
                                        <Plus size={32} strokeWidth={1} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-lg lg:text-xl font-black text-ink-heading dark:text-white tracking-tighter uppercase opacity-80">Expand Fleet</h4>
                                    <p className="text-[8px] text-ink-muted/30 uppercase font-black tracking-[0.3em]">Authorize Specialist</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cinematic Backdrop Overlay */}
            {selectedTechnician && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in duration-300"
                    onClick={handleCloseSidePanel}
                />
            )}

            {/* Slide-in Side Panel - HIGH SPEED VERSION */}
            <div className={cn(
                "fixed inset-y-0 right-0 z-50 w-[95%] sm:w-[450px] lg:w-[500px] bg-white dark:bg-[#0a0a0b] border-l border-surface-border dark:border-white/10 transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[-30px_0_100px_rgba(0,0,0,0.5)] overflow-hidden",
                selectedTechnician ? "translate-x-0" : "translate-x-full"
            )}>
                {selectedTechnician && (
                    <TechSidePanel
                        technician={selectedTechnician}
                        onClose={handleCloseSidePanel}
                    />
                )}
            </div>
        </div>
    );
};

// Sub-component for better memoization - Reduced Sizes
const TechCard = memo(({ tech, isSelected, onClick, onDelete, onApprove }: any) => {
    const workloadPercentage = (tech.activeJobs / tech.capacity) * 100;
    const isPending = tech.status === 'pending';

    return (
        <Card
            onClick={onClick}
            className={cn(
                "relative group cursor-pointer transition-all duration-500 h-[320px] lg:h-[350px] rounded-[2.8rem] lg:rounded-[3.2rem] border-2 flex flex-col p-1.5 overflow-hidden shadow-2xl animate-in zoom-in-95 will-change-transform ease-out",
                isSelected ? "border-brand scale-[1.02] z-30 ring-[8px] ring-brand/5 bg-brand/[0.03] shadow-brand/20" : "border-surface-border dark:border-white/5 bg-white dark:bg-white/[0.03] hover:border-brand/40 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]",
                isPending && "border-brand/20"
            )}
        >
            <CardContent className="h-full rounded-[2.3rem] lg:rounded-[2.8rem] bg-white dark:bg-black/80 shadow-inner p-5 lg:p-6 flex flex-col relative z-10 transition-all duration-500 group-hover:bg-black/60">
                <div className="flex items-center gap-4 lg:gap-5 mb-5 lg:mb-6 transition-transform duration-500 group-hover:scale-105">
                    <div className="relative shrink-0">
                        <img
                            src={tech.avatar}
                            className="w-12 h-12 lg:w-16 lg:h-16 rounded-[1.2rem] lg:rounded-[1.8rem] object-cover ring-4 ring-brand/10 shadow-3xl grayscale group-hover:grayscale-0 transition-all duration-500 ease-out"
                            alt={tech.name}
                            loading="lazy"
                        />
                        <div className={cn(
                            "absolute -top-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 rounded-full border-[3px] lg:border-[4px] border-white dark:border-black shadow-2xl z-20 transition-all duration-500",
                            tech.status === 'active' ? 'bg-success' : tech.status === 'busy' ? 'bg-amber-500 animate-pulse' : isPending ? 'bg-blue-500 scale-110' : 'bg-slate-400'
                        )} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-base lg:text-xl font-black text-ink-heading dark:text-white truncate tracking-tighter leading-tight mb-1 lg:mb-1.5 uppercase italic opacity-80 group-hover:opacity-100 transition-opacity">
                            {tech.name}
                        </h3>
                        <div className="flex items-center gap-2 lg:gap-2.5">
                            <span className="bg-brand/10 text-brand text-[7px] lg:text-[8px] font-black px-1.5 py-0.5 rounded-lg tracking-[0.1em] uppercase border border-brand/20">TECH</span>
                            <p className="text-[8px] lg:text-[9px] font-black text-ink-muted/40 uppercase tracking-[0.2em]">ID:{tech.id?.split('-')[0].toUpperCase() || '???'}</p>
                        </div>
                    </div>
                </div>

                {isPending ? (
                    <div className="flex-1 flex flex-col justify-center gap-3">
                        <div className="p-3.5 rounded-[1.8rem] bg-blue-500/5 border border-blue-500/10 text-blue-500 text-center">
                            <Clock size={20} className="mx-auto mb-1.5 opacity-30 animate-pulse" />
                            <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-60">Signal Standby</p>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); onApprove?.(); }}
                            className="w-full bg-brand text-white py-3 rounded-[1.5rem] font-black text-[9px] uppercase tracking-[0.3em] shadow-2xl shadow-brand/30 transition-all hover:-translate-y-1 active:scale-95"
                        >
                            Authorize
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-2.5 lg:gap-3 mb-5 animate-in fade-in slide-in-from-bottom-1 duration-500 delay-150">
                            <div className="p-2.5 lg:p-3.5 bg-surface-page dark:bg-white/5 rounded-[1.2rem] lg:rounded-[1.8rem] text-center border border-transparent group-hover:border-brand/20 transition-all duration-500 shadow-sm">
                                <span className="text-[7px] font-black text-ink-muted/40 uppercase tracking-widest">Jobs Today</span>
                                <p className="text-base lg:text-xl font-black text-brand tracking-tighter tabular-nums">{tech.activeJobs || 0}</p>
                            </div>
                            <div className="p-2.5 lg:p-3.5 bg-surface-page dark:bg-white/5 rounded-[1.2rem] lg:rounded-[1.8rem] text-center border border-transparent group-hover:border-emerald-500/20 transition-all duration-500 shadow-sm">
                                <span className="text-[7px] font-black text-ink-muted/40 uppercase tracking-widest">Avg Rating</span>
                                <p className="text-base lg:text-xl font-black text-success tracking-tighter tabular-nums">--</p>
                            </div>
                        </div>

                        <div className="space-y-2 lg:space-y-2.5 mb-5 animate-in fade-in slide-in-from-bottom-1 duration-500 delay-200">
                            <div className="flex justify-between items-center text-[8px] lg:text-[9px] font-black uppercase tracking-[0.3em] text-ink-muted/60">
                                <span className="truncate">Workload</span>
                                <span className={cn("shrink-0", workloadPercentage > 80 ? 'text-danger' : 'text-brand')}>
                                    {tech.activeJobs}/{tech.capacity} JOBS
                                </span>
                            </div>
                            <div className="h-1 lg:h-1.5 w-full bg-surface-page dark:bg-white/10 rounded-full overflow-hidden shadow-inner">
                                <div
                                    className={cn("h-full transition-all duration-1000 ease-out rounded-full", workloadPercentage > 80 ? 'bg-danger shadow-[0_0_6px_#ef4444]' : 'bg-brand shadow-[0_0_6px_#eab308]')}
                                    style={{ width: `${Math.max(workloadPercentage, 10)}%` }}
                                >
                                    <div className="w-full h-full bg-white/20 animate-pulse" />
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-surface-border dark:border-white/10 flex items-center justify-between animate-in fade-in duration-500 delay-300">
                            <div className="flex items-center gap-2 text-ink-muted/30">
                                <ShieldCheck size={12} className="group-hover:text-brand transition-colors duration-500" />
                                <span className="text-[7.5px] lg:text-[8px] font-black uppercase tracking-[0.3em]">{tech.status}</span>
                            </div>
                            <button className="text-[8px] lg:text-[10px] font-black uppercase text-brand tracking-widest truncate group-hover:translate-x-1 transition-transform">
                                Profile Stream
                            </button>
                        </div>
                    </>
                )}
            </CardContent>

            {!isPending && (
                <div className="absolute top-4 right-4 flex flex-col gap-2 transition-all duration-500 opacity-0 lg:group-hover:opacity-100 translate-x-3 lg:group-hover:translate-x-0 z-20">
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                        className="w-9 h-9 rounded-[1rem] bg-danger/10 text-danger border border-danger/20 flex items-center justify-center hover:bg-danger hover:text-white transition-all shadow-lg backdrop-blur-xl duration-300"
                    >
                        <Trash2 size={16} />
                    </button>
                    <button className="w-9 h-9 rounded-[1rem] bg-white/10 dark:bg-black/40 text-brand border border-white/20 flex items-center justify-center hover:bg-brand hover:text-white transition-all shadow-lg backdrop-blur-xl duration-300">
                        <Phone size={16} />
                    </button>
                </div>
            )}
        </Card>
    );
});
TechCard.displayName = 'TechCard';

export default memo(TechnicianWorkloadPage);
