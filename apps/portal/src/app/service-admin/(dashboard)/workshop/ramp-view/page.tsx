'use client';

import React, { memo, useMemo, useState, useCallback } from 'react';
import Breadcrumb from '@/components/service-admin/Breadcrumb';
import RampCard from '@/components/service-admin/workshop/RampCard';
import RampSidePanel from '@/components/service-admin/workshop/RampSidePanel';
import AssignTechnicianModal from '@/components/service-admin/workshop/AssignTechnicianModal';
import { Plus, Target, Users, Zap, Search, LayoutGrid, LayoutList, X } from 'lucide-react';
import { useWorkshopStore } from '@/stores/service-admin/workshopStore';
import { cn } from '@/lib/utils';

// Memoized Stat Card - High Performance Snappy Version
const StatCard = memo(({ label, value, icon: Icon, color, bg, delay }: any) => (
    <div className={cn(
        "p-5 lg:p-6 bg-white dark:bg-white/[0.03] border border-surface-border dark:border-white/5 rounded-[2rem] flex items-center gap-5 shadow-soft hover:shadow-2xl transition-all duration-500 ease-out group cursor-default shrink min-w-0 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-2",
        delay
    )}>
        <div className={cn("p-4 lg:p-5 rounded-[1.5rem] lg:rounded-[2rem] transition-all duration-500 group-hover:scale-110 shadow-lg shrink-0", bg, color)}>
            <Icon size={22} className="lg:w-[24px] lg:h-[24px]" strokeWidth={2.5} />
        </div>
        <div className="min-w-0 flex-1">
            <p className="text-[9px] lg:text-[10px] font-black text-ink-muted uppercase tracking-[0.3em] mb-1 opacity-60 truncate">{label}</p>
            <p className="text-xl lg:text-3xl font-black text-ink-heading dark:text-white leading-tight tabular-nums tracking-tighter truncate">{value}</p>
        </div>
    </div>
));
StatCard.displayName = 'StatCard';

const RampManagementPage = () => {
    const ramps = useWorkshopStore(state => state.ramps);
    const technicians = useWorkshopStore(state => state.technicians);
    const addRamp = useWorkshopStore(state => state.addRamp);

    const [selectedRampId, setSelectedRampId] = useState<string | null>(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const stats = useMemo(() => ({
        available: ramps.filter(r => r.status === 'available').length,
        occupied: ramps.filter(r => r.status === 'occupied').length,
        activeTechs: technicians.filter(t => t.status === 'active' || t.status === 'busy').length
    }), [ramps, technicians]);

    const filteredRamps = useMemo(() => ramps.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.vehicleRegNo?.toLowerCase().includes(searchQuery.toLowerCase())
    ), [ramps, searchQuery]);

    const selectedRamp = useMemo(() =>
        ramps.find(r => r.id === selectedRampId) || null
        , [ramps, selectedRampId]);

    const handleRampClick = useCallback((rampId: string) => {
        setSelectedRampId(prev => prev === rampId ? null : rampId);
    }, []);

    const handleCloseSidePanel = useCallback(() => setSelectedRampId(null), []);
    const handleOpenAssign = useCallback(() => setIsAssignModalOpen(true), []);

    return (
        <div className="h-full lg:h-[calc(100vh-65px)] flex flex-col lg:flex-row overflow-hidden bg-[#fafafa] dark:bg-[#080809] relative transition-colors duration-700 w-full max-w-full">
            {/* Cinematic Background Ambient - Clipped */}
            <div className="absolute top-0 left-0 w-[100%] h-[100%] bg-brand/[0.02] blur-[200px] pointer-events-none rounded-full overflow-hidden" />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative transition-all duration-500 ease-in-out overflow-hidden w-full max-w-full">
                <div className="flex-1 overflow-y-auto no-scrollbar custom-scrollbar scroll-smooth w-full">
                    <div className="p-6 lg:p-12 pb-48 space-y-10 lg:space-y-14 relative z-10 w-full max-w-[1500px] mx-auto overflow-x-hidden">
                        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-10">
                            <div className="animate-in fade-in slide-in-from-left-4 duration-500 ease-out min-w-0 flex-1">
                                <div className="opacity-40"><Breadcrumb items={[{ label: 'Workshop' }, { label: 'Service Bays' }]} /></div>
                                <h1 className="text-3xl sm:text-4xl lg:text-7xl font-black text-ink-heading dark:text-white tracking-tighter mt-6 lg:mt-8 flex items-center flex-wrap gap-4 lg:gap-6 leading-none">
                                    Workshop <span className="text-brand">Hub</span>
                                    <span className="bg-brand/10 text-brand text-[10px] lg:text-[11px] px-4 py-2 rounded-2xl border border-brand/20 tracking-[0.4em] font-black uppercase shadow-2xl shadow-brand/10 animate-pulse shrink-0">Active</span>
                                </h1>
                                <p className="text-base lg:text-xl font-medium text-ink-muted/40 mt-4 tracking-tight max-w-xl break-words">Monitor your terminal nodes and operational streams in real-time.</p>
                            </div>

                            {/* Stats Grid - Wrapped for Auto Adjustment */}
                            <div className="flex flex-wrap items-center gap-4 lg:gap-6 animate-in fade-in slide-in-from-right-4 duration-500 ease-out w-full xl:w-auto">
                                <div className="flex -space-x-4 overflow-hidden py-2 shrink-0">
                                    {technicians.slice(0, 5).map((t, i) => (
                                        <div key={t.id} className="w-10 h-10 lg:w-16 lg:h-16 rounded-[1.2rem] lg:rounded-[2rem] border-[4px] border-white dark:border-black bg-surface-page shadow-2xl overflow-hidden shrink-0 transition-all duration-500 hover:-translate-y-2" style={{ transitionDelay: `${i * 30}ms` }}>
                                            <img src={t.avatar} alt={t.name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" loading="lazy" />
                                        </div>
                                    ))}
                                </div>
                                <div className="h-10 w-px bg-surface-border dark:bg-white/10 mx-1 hidden xl:block" />
                                <div className="flex flex-wrap gap-4 lg:gap-6 w-full sm:w-auto flex-1 sm:flex-initial">
                                    <StatCard label="Active Nodes" value={stats.occupied} icon={Zap} color="text-brand" bg="bg-brand/10" delay="duration-500 delay-100" />
                                    <StatCard label="Idle Terminals" value={stats.available} icon={Target} color="text-emerald-500" bg="bg-emerald-500/10" delay="duration-500 delay-200" />
                                </div>
                            </div>
                        </div>

                        {/* Filter & Search */}
                        <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-center justify-between pt-8 border-t border-surface-border dark:border-white/5 animate-in fade-in duration-700 delay-300 w-full">
                            <div className="relative w-full md:w-[450px] lg:w-[500px] group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-ink-muted group-focus-within:text-brand transition-all duration-300 group-focus-within:scale-110" size={20} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search Command System..."
                                    className="w-full pl-16 pr-8 py-4 lg:py-6 bg-white dark:bg-white/[0.03] border border-surface-border dark:border-white/5 rounded-[2rem] text-sm lg:text-base font-black focus:outline-none focus:ring-[10px] focus:ring-brand/5 focus:border-brand/30 transition-all duration-300 placeholder:text-ink-muted/30 placeholder:uppercase placeholder:tracking-[0.2em]"
                                />
                            </div>
                            <div className="flex items-center gap-3 p-2 bg-white dark:bg-white/[0.03] border border-surface-border dark:border-white/5 rounded-[2.2rem] shrink-0 shadow-soft">
                                <button className="p-4 rounded-[1.8rem] bg-surface-page dark:bg-white/5 text-ink-muted hover:text-brand shadow-sm transition-all duration-300 active:scale-95 hover:scale-105"><LayoutGrid size={22} /></button>
                                <button className="p-4 rounded-[1.8rem] text-ink-muted hover:text-brand transition-all duration-300 active:scale-95 hover:scale-105"><LayoutList size={22} /></button>
                            </div>
                        </div>

                        <div className="pb-48">
                            <div className={cn(
                                "grid gap-8 lg:gap-10 transition-all duration-500 ease-in-out w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                            )}>
                                {filteredRamps.map((ramp, i) => (
                                    <div
                                        key={ramp.id}
                                        className="animate-in fade-in zoom-in-95 duration-500 ease-out"
                                        style={{ animationDelay: `${i * 30}ms` }}
                                    >
                                        <RampCard
                                            {...ramp}
                                            isSelected={selectedRampId === ramp.id}
                                            onClick={() => handleRampClick(ramp.id)}
                                        />
                                    </div>
                                ))}

                                <button
                                    onClick={() => addRamp({ name: `BAY-${ramps.length + 1}` })}
                                    className="h-[280px] rounded-[3rem] border-2 border-dashed border-surface-border dark:border-white/10 flex flex-col items-center justify-center p-8 lg:p-10 gap-6 lg:gap-8 hover:border-brand/40 hover:bg-brand/[0.02] transition-all duration-500 ease-in-out group active:scale-95"
                                >
                                    <div className="w-16 h-16 lg:w-20 lg:h-20 bg-surface-page dark:bg-white/5 rounded-[1.5rem] lg:rounded-[2rem] flex items-center justify-center text-brand border border-surface-border dark:border-white/5 transition-all duration-500 group-hover:rotate-45 group-hover:scale-110 shadow-lg">
                                        <Plus size={36} className="lg:w-[40px] lg:h-[40px]" strokeWidth={1} />
                                    </div>
                                    <div className="text-center group-hover:translate-y-[-2px] transition-transform duration-500">
                                        <p className="text-[10px] lg:text-[11px] font-black uppercase tracking-[0.4em] text-ink-muted/60 group-hover:text-brand transition-colors duration-500">Expansion Protocol</p>
                                        <p className="text-[9px] font-bold text-ink-muted/30 uppercase tracking-widest mt-1">Authorize New Node</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cinematic Backdrop Overlay */}
            {selectedRamp && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in duration-300"
                    onClick={handleCloseSidePanel}
                />
            )}

            {/* Slide-in Side Panel - HIGH SPEED VERSION */}
            <div className={cn(
                "fixed inset-y-0 right-0 z-50 w-[95%] sm:w-[500px] lg:w-[550px] bg-white dark:bg-[#0a0a0b] border-l border-surface-border dark:border-white/10 transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[-30px_0_100px_rgba(0,0,0,0.5)] overflow-hidden",
                selectedRamp ? "translate-x-0" : "translate-x-full"
            )}>
                {selectedRamp && (
                    <RampSidePanel
                        ramp={selectedRamp}
                        onClose={handleCloseSidePanel}
                        onAssignClick={handleOpenAssign}
                    />
                )}
            </div>

            <AssignTechnicianModal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                ramp={selectedRamp}
            />
        </div>
    );
};

export default memo(RampManagementPage);
