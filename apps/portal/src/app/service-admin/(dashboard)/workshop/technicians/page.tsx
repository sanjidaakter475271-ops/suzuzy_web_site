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

// Memoized Stat Card - Snappy Version
const StatCard = memo(({ label, value, icon: Icon, color, bg, hide, delay }: any) => {
    if (hide) return null;
    return (
        <div className={cn(
            "px-6 py-5 bg-white dark:bg-white/[0.03] border border-surface-border dark:border-white/5 rounded-[2rem] shadow-soft flex items-center gap-5 hover:shadow-2xl transition-all duration-500 ease-out group shrink min-w-0 w-full sm:w-auto animate-in fade-in slide-in-from-right-4",
            delay
        )}>
            <div className={cn("w-12 h-12 lg:w-14 lg:h-14 rounded-[1.2rem] lg:rounded-[2rem] flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-lg group-hover:rotate-6 shrink-0", bg, color)}>
                <Icon size={22} className="lg:w-[24px] lg:h-[24px]" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.3em] text-ink-muted/60 leading-none mb-1.5 truncate">{label}</p>
                <p className={cn("text-xl lg:text-3xl font-black tracking-tighter leading-none truncate", color)}>{value}</p>
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
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase())
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
                    <div className="p-6 lg:p-12 pb-48 space-y-10 lg:space-y-14 relative z-10 w-full max-w-[1500px] mx-auto overflow-x-hidden">
                        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-10">
                            <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-left-4 duration-500 ease-out min-w-0 flex-1">
                                <div className="opacity-40"><Breadcrumb items={[{ label: 'Workshop', href: '/service-admin/workshop' }, { label: 'Technicians' }]} /></div>
                                <h1 className="text-3xl sm:text-4xl lg:text-7xl font-black text-ink-heading dark:text-white tracking-tighter flex items-center flex-wrap gap-4 lg:gap-6 leading-none uppercase italic">
                                    Team <span className="text-brand">Excellence</span>
                                    <span className="bg-emerald-500/10 text-emerald-600 text-[10px] lg:text-[11px] px-4 py-2 rounded-2xl border border-emerald-500/20 tracking-[0.4em] font-black uppercase shadow-2xl shadow-emerald-500/10 animate-pulse shrink-0">Elite Force</span>
                                </h1>
                                <p className="text-base lg:text-xl font-medium text-ink-muted/40 tracking-tight max-w-xl break-words">Optimize your agent resource deployment and track operational performance streams.</p>
                            </div>

                            {/* Stats Grid - Wrapped for Auto Adjustment */}
                            <div className="flex flex-wrap items-center gap-4 lg:gap-6 animate-in fade-in slide-in-from-right-8 duration-700 ease-out w-full xl:w-auto">
                                <StatCard label="Available" value={stats.active} icon={Users} color="text-success" bg="bg-success/10" delay="duration-500" />
                                <StatCard label="In-Mission" value={stats.busy} icon={AlertTriangle} color="text-amber-500" bg="bg-amber-500/10" delay="duration-500 delay-75" />
                                <StatCard label="Standby" value={stats.pending} icon={Clock} color="text-brand" bg="bg-brand/10" delay="duration-500 delay-150" hide={stats.pending === 0} />
                            </div>
                        </div>

                        {/* Filter & Search - Snappy Adjustment */}
                        <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-center justify-between pt-8 lg:pt-10 border-t border-surface-border dark:border-white/5 animate-in fade-in duration-700 delay-300 w-full">
                            <div className="relative w-full md:w-[450px] lg:w-[550px] group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-ink-muted group-focus-within:text-brand transition-all duration-300 group-focus-within:scale-110" size={20} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search Fleet Registry / Agent ID..."
                                    className="w-full pl-16 pr-8 py-4 lg:py-6 bg-white dark:bg-white/[0.03] border border-surface-border dark:border-white/5 rounded-[2rem] lg:rounded-[2.5rem] text-sm lg:text-base font-black focus:outline-none focus:ring-[10px] focus:ring-brand/5 focus:border-brand/30 transition-all duration-300 placeholder:text-ink-muted/20 placeholder:uppercase placeholder:tracking-[0.3em]"
                                />
                            </div>
                            <div className="flex items-center gap-3 p-2 bg-white dark:bg-white/[0.03] border border-surface-border dark:border-white/5 rounded-[2.5rem] shrink-0 shadow-soft">
                                <button className="p-4 rounded-[2.2rem] bg-surface-page dark:bg-white/5 text-ink-muted hover:text-brand transition-all duration-300 active:scale-95 hover:scale-105"><LayoutGrid size={22} /></button>
                                <button className="p-4 rounded-[2.2rem] text-ink-muted hover:text-brand transition-all duration-300 active:scale-95 hover:scale-105"><LayoutList size={22} /></button>
                            </div>
                        </div>

                        {/* Grid area */}
                        <div className={cn(
                            "grid gap-8 lg:gap-10 transition-all duration-500 ease-in-out w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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
                                className="h-[350px] lg:h-[380px] rounded-[3rem] lg:rounded-[3.5rem] border-2 border-dashed border-brand/20 dark:border-brand/10 bg-transparent group cursor-pointer hover:border-brand hover:bg-brand/[0.02] transition-all duration-500 flex flex-col items-center justify-center text-center p-8 lg:p-12 gap-6 lg:gap-8 active:scale-95"
                            >
                                <div className="relative">
                                    <div className="absolute inset-0 bg-brand blur-[40px] opacity-10 group-hover:opacity-30 transition-all" />
                                    <div className="relative w-16 h-16 lg:w-20 lg:h-20 rounded-[1.5rem] lg:rounded-[2.5rem] bg-white dark:bg-dark-card border border-brand/10 flex items-center justify-center text-brand transition-all duration-300 group-hover:rotate-90 group-hover:scale-110 shadow-2xl group-hover:shadow-[0_0_60px_rgba(234,179,8,0.2)]">
                                        <Plus size={36} strokeWidth={1} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-xl lg:text-2xl font-black text-ink-heading dark:text-white tracking-tighter uppercase opacity-80">Expand Fleet</h4>
                                    <p className="text-[9px] text-ink-muted/30 uppercase font-black tracking-[0.4em]">Authorize Specialist</p>
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
                "fixed inset-y-0 right-0 z-50 w-[95%] sm:w-[500px] lg:w-[550px] bg-white dark:bg-[#0a0a0b] border-l border-surface-border dark:border-white/10 transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[-30px_0_100px_rgba(0,0,0,0.5)] overflow-hidden",
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

// Sub-component for better memoization
const TechCard = memo(({ tech, isSelected, onClick, onDelete, onApprove }: any) => {
    const workloadPercentage = (tech.activeJobs / tech.capacity) * 100;
    const isPending = tech.status === 'pending';

    return (
        <Card
            onClick={onClick}
            className={cn(
                "relative group cursor-pointer transition-all duration-500 h-[350px] lg:h-[400px] rounded-[3rem] lg:rounded-[3.5rem] border-2 flex flex-col p-1.5 overflow-hidden shadow-2xl animate-in zoom-in-95 will-change-transform ease-out",
                isSelected ? "border-brand scale-[1.02] z-30 ring-[10px] ring-brand/5 bg-brand/[0.03] shadow-brand/20" : "border-surface-border dark:border-white/5 bg-white dark:bg-white/[0.03] hover:border-brand/40 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)]",
                isPending && "border-brand/20"
            )}
        >
            <CardContent className="h-full rounded-[2.5rem] lg:rounded-[2.8rem] bg-white dark:bg-black/80 shadow-inner p-6 lg:p-7 flex flex-col relative z-10 transition-all duration-500 group-hover:bg-black/60">
                <div className="flex items-center gap-4 lg:gap-6 mb-6 lg:mb-8 transition-transform duration-500 group-hover:scale-105">
                    <div className="relative shrink-0">
                        <img
                            src={tech.avatar}
                            className="w-14 h-14 lg:w-20 lg:h-20 rounded-[1.5rem] lg:rounded-[2rem] object-cover ring-4 ring-brand/10 shadow-3xl grayscale group-hover:grayscale-0 transition-all duration-500 ease-out"
                            alt={tech.name}
                            loading="lazy"
                        />
                        <div className={cn(
                            "absolute -top-1 -right-1 w-5 h-5 lg:w-6 lg:h-6 rounded-full border-[4px] lg:border-[5px] border-white dark:border-black shadow-2xl z-20 transition-all duration-500",
                            tech.status === 'active' ? 'bg-success' : tech.status === 'busy' ? 'bg-amber-500 animate-pulse' : isPending ? 'bg-blue-500 scale-125' : 'bg-slate-400'
                        )} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-lg lg:text-2xl font-black text-ink-heading dark:text-white truncate tracking-tighter leading-tight mb-1.5 lg:mb-2 uppercase italic opacity-80 group-hover:opacity-100 transition-opacity">
                            {tech.name}
                        </h3>
                        <div className="flex items-center gap-2 lg:gap-3">
                            <span className="bg-brand/10 text-brand text-[8px] lg:text-[9px] font-black px-2 py-0.5 lg:py-1 rounded-xl tracking-[0.2em] uppercase border border-brand/20">AGENT</span>
                            <p className="text-[9px] lg:text-[10px] font-black text-ink-muted/40 uppercase tracking-[0.3em]">ID:{tech.id.split('-')[0].toUpperCase()}</p>
                        </div>
                    </div>
                </div>

                {isPending ? (
                    <div className="flex-1 flex flex-col justify-center gap-4">
                        <div className="p-4 rounded-[2rem] bg-blue-500/5 border border-blue-500/10 text-blue-500 text-center">
                            <Clock size={24} className="mx-auto mb-2 opacity-30 animate-pulse" />
                            <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-60">Signal Standby</p>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); onApprove?.(); }}
                            className="w-full bg-brand text-white py-4 rounded-[1.8rem] font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl shadow-brand/30 transition-all hover:-translate-y-1 active:scale-95"
                        >
                            Authorize
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-6 animate-in fade-in slide-in-from-bottom-1 duration-500 delay-150">
                            <div className="p-3 lg:p-4 bg-surface-page dark:bg-white/5 rounded-[1.5rem] lg:rounded-[2rem] text-center border border-transparent group-hover:border-brand/20 transition-all duration-500 shadow-sm">
                                <span className="text-[7px] lg:text-[8px] font-black text-ink-muted/40 uppercase tracking-widest">Efficiency</span>
                                <p className="text-lg lg:text-2xl font-black text-brand tracking-tighter tabular-nums">{85 + (parseInt(tech.id.charCodeAt(0).toString()) % 15)}%</p>
                            </div>
                            <div className="p-3 lg:p-4 bg-surface-page dark:bg-white/5 rounded-[1.5rem] lg:rounded-[2rem] text-center border border-transparent group-hover:border-emerald-500/20 transition-all duration-500 shadow-sm">
                                <span className="text-[7px] lg:text-[8px] font-black text-ink-muted/40 uppercase tracking-widest">Rating</span>
                                <p className="text-lg lg:text-2xl font-black text-success tracking-tighter tabular-nums">{(4.5 + (parseInt(tech.id.charCodeAt(tech.id.length - 1).toString()) % 5) / 10).toFixed(1)}</p>
                            </div>
                        </div>

                        <div className="space-y-2.5 lg:space-y-3 mb-6 animate-in fade-in slide-in-from-bottom-1 duration-500 delay-200">
                            <div className="flex justify-between items-center text-[9px] lg:text-[10px] font-black uppercase tracking-[0.4em] text-ink-muted/60">
                                <span className="truncate">Flux Power</span>
                                <span className={cn("shrink-0", workloadPercentage > 80 ? 'text-danger' : 'text-brand')}>
                                    {tech.activeJobs}/{tech.capacity} UNIT
                                </span>
                            </div>
                            <div className="h-1.5 lg:h-2 w-full bg-surface-page dark:bg-white/10 rounded-full overflow-hidden shadow-inner">
                                <div
                                    className={cn("h-full transition-all duration-1000 ease-out rounded-full", workloadPercentage > 80 ? 'bg-danger shadow-[0_0_8px_#ef4444]' : 'bg-brand shadow-[0_0_8px_#eab308]')}
                                    style={{ width: `${Math.max(workloadPercentage, 10)}%` }}
                                >
                                    <div className="w-full h-full bg-white/20 animate-pulse" />
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-5 border-t border-surface-border dark:border-white/10 flex items-center justify-between animate-in fade-in duration-500 delay-300">
                            <div className="flex items-center gap-2 text-ink-muted/30">
                                <ShieldCheck size={14} className="group-hover:text-brand transition-colors duration-500" />
                                <span className="text-[8px] lg:text-[9px] font-black uppercase tracking-[0.4em]">Protocol OK</span>
                            </div>
                            <button className="text-[9px] lg:text-[11px] font-black uppercase text-brand tracking-widest truncate">
                                Profile Stream
                            </button>
                        </div>
                    </>
                )}
            </CardContent>

            {!isPending && (
                <div className="absolute top-5 right-5 flex flex-col gap-2 transition-all duration-500 opacity-0 lg:group-hover:opacity-100 translate-x-4 lg:group-hover:translate-x-0 z-20">
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                        className="w-10 h-10 rounded-[1.2rem] bg-danger/10 text-danger border border-danger/20 flex items-center justify-center hover:bg-danger hover:text-white transition-all shadow-xl backdrop-blur-xl duration-300"
                    >
                        <Trash2 size={18} />
                    </button>
                    <button className="w-10 h-10 rounded-[1.2rem] bg-white/10 dark:bg-black/40 text-brand border border-white/20 flex items-center justify-center hover:bg-brand hover:text-white transition-all shadow-xl backdrop-blur-xl duration-300">
                        <Phone size={18} />
                    </button>
                </div>
            )}
        </Card>
    );
});
TechCard.displayName = 'TechCard';

export default memo(TechnicianWorkloadPage);
