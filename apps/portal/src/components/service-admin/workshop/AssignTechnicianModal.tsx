'use client';

import React, { useState, useMemo, memo } from 'react';
import { Modal, Button } from '@/components/service-admin/ui';
import { Technician, Ramp } from '@/types/service-admin/workshop';
import { useWorkshopStore } from '@/stores/service-admin/workshopStore';
import { User, Check, Search, ShieldCheck, Zap, Star, LayoutGrid, Clock, Hammer, Sparkles, X, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AssignTechnicianModalProps {
    isOpen: boolean;
    onClose: () => void;
    ramp: Ramp | null;
}

const AssignTechnicianModal: React.FC<AssignTechnicianModalProps> = ({ isOpen, onClose, ramp }) => {
    const { technicians, assignJobToRamp, assignDedicatedTechnician, jobCards } = useWorkshopStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [isAssigning, setIsAssigning] = useState(false);
    const [assignMode, setAssignMode] = useState<'dedicated' | 'job'>('job');

    const availableTechs = useMemo(() => {
        return technicians.filter(t =>
            t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.id.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [technicians, searchQuery]);

    if (!ramp) return null;

    const handleAssign = async (techId: string) => {
        setIsAssigning(true);
        try {
            if (assignMode === 'dedicated') {
                await assignDedicatedTechnician(ramp.id, techId);
            } else {
                // Find a pending job to assign, or just assign tech to ramp
                const pendingJob = jobCards.find(j => j.status === 'created' || j.status === 'diagnosed');
                await assignJobToRamp(ramp.id, pendingJob?.id || '', techId);
            }
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsAssigning(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Deploy Specialist"
            maxWidth="max-w-2xl"
        >
            <div className="relative -m-6 p-6">
                {/* Cinematic Header Background Overlay */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-brand/10 to-transparent pointer-events-none rounded-t-[1.8rem]" />

                <div className="relative z-10">
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-px bg-brand" />
                            <span className="text-[10px] font-black text-brand uppercase tracking-[0.4em]">Resource Allocation</span>
                        </div>
                        <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest opacity-60">
                            Target Terminal: <span className="text-brand ml-1 font-black">{ramp.name}</span>
                        </p>
                    </div>

                    {/* Mode Selector */}
                    <div className="flex p-1.5 bg-surface-page dark:bg-black/40 rounded-[1.8rem] border border-surface-border dark:border-white/5 mb-8 shadow-inner">
                        <button
                            type="button"
                            onClick={() => setAssignMode('job')}
                            className={cn(
                                "flex-1 py-4 rounded-[1.4rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3",
                                assignMode === 'job' ? "bg-brand text-white shadow-xl shadow-brand/20" : "text-ink-muted hover:text-brand"
                            )}
                        >
                            <Zap size={14} className={assignMode === 'job' ? "animate-pulse" : ""} />
                            Mission Specific
                        </button>
                        <button
                            type="button"
                            onClick={() => setAssignMode('dedicated')}
                            className={cn(
                                "flex-1 py-4 rounded-[1.4rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3",
                                assignMode === 'dedicated' ? "bg-brand text-white shadow-xl shadow-brand/20" : "text-ink-muted hover:text-brand"
                            )}
                        >
                            <ShieldCheck size={14} />
                            Dedicated Specialist
                        </button>
                    </div>

                    {/* Search Field */}
                    <div className="relative mb-8 group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-ink-muted/30 group-focus-within:text-brand transition-all" size={20} />
                        <input
                            type="text"
                            placeholder="SEARCH SPECIALIST ID OR NAME..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-16 pr-8 py-5 bg-white dark:bg-white/[0.03] border-2 border-surface-border dark:border-white/5 rounded-[2rem] text-xs font-black focus:outline-none focus:border-brand/40 transition-all placeholder:text-ink-muted/20 uppercase tracking-widest"
                        />
                    </div>

                    {/* Technicians List */}
                    <div className="h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        <div className="grid grid-cols-1 gap-4 pb-8">
                            {availableTechs.map((tech, idx) => (
                                <div
                                    key={tech.id}
                                    onClick={() => handleAssign(tech.id)}
                                    className="group relative cursor-pointer"
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                >
                                    <div className="absolute inset-0 bg-brand/5 rounded-[2.2rem] blur-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                    <div className="relative p-5 bg-white dark:bg-white/[0.02] border border-surface-border dark:border-white/10 rounded-[2.2rem] flex items-center gap-6 transition-all duration-700 group-hover:border-brand/40 group-hover:-translate-y-1 overflow-hidden shadow-sm">
                                        {/* Status Indicator */}
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand opacity-0 group-hover:opacity-100 transition-opacity" />

                                        <div className="relative shrink-0">
                                            <img
                                                src={tech.avatar}
                                                className="w-16 h-16 rounded-[1.4rem] object-cover ring-2 ring-brand/5 shadow-xl transition-transform duration-700 group-hover:scale-110"
                                                alt={tech.name}
                                            />
                                            <div className={cn(
                                                "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-[3px] border-white dark:border-[#0a0a0b] shadow-lg",
                                                tech.status === 'active' ? 'bg-success' : 'bg-amber-500'
                                            )} />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-xl font-black text-ink-heading dark:text-white truncate tracking-tighter uppercase italic">{tech.name}</h4>
                                                <div className="flex items-center gap-2 px-2 py-1 bg-brand/5 rounded-lg border border-brand/20">
                                                    <Star size={10} className="text-brand fill-brand" />
                                                    <span className="text-[9px] font-black text-brand tracking-tighter">4.9</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 text-[9px] font-bold text-ink-muted uppercase tracking-widest">
                                                <span className="flex items-center gap-1.5"><LayoutGrid size={12} className="text-brand/40" /> {tech.activeJobs} Active Jobs</span>
                                                <span className="flex items-center gap-1.5"><Clock size={12} className="text-brand/40" /> 94% Efficiency</span>
                                            </div>
                                        </div>

                                        <div className="p-3 bg-brand/10 text-brand rounded-2xl opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-4 transition-all duration-500">
                                            <UserPlus size={20} />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {availableTechs.length === 0 && (
                                <div className="py-20 text-center space-y-6 bg-surface-page/30 dark:bg-white/[0.01] rounded-[3rem] border-2 border-dashed border-surface-border dark:border-white/5">
                                    <div className="w-20 h-20 bg-surface-card dark:bg-white/5 rounded-full flex items-center justify-center mx-auto text-ink-muted/20">
                                        <Hammer size={40} />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-xl font-black text-ink-heading dark:text-white uppercase tracking-tighter opacity-60">No Specialist Found</h4>
                                        <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest">Signal match failure. Adjust coordinates.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default memo(AssignTechnicianModal);
