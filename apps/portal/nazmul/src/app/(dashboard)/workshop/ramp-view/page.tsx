'use client';

import React, { useState } from 'react';
import Breadcrumb from '@/components/Breadcrumb';
import RampCard from '@/components/workshop/RampCard';
import RampDetailModal from '@/components/workshop/RampDetailModal';
import AssignTechnicianModal from '@/components/workshop/AssignTechnicianModal';
import { Plus, Hammer, UserCheck, Clock } from 'lucide-react';
import { useWorkshopStore } from '@/stores/workshopStore';
import { Ramp } from '@/types/workshop';

const RampManagementPage = () => {
    const { ramps, technicians, jobCards } = useWorkshopStore();
    const [selectedRamp, setSelectedRamp] = useState<Ramp | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

    const availableCount = ramps.filter(r => r.status === 'available').length;
    const occupiedCount = ramps.filter(r => r.status === 'occupied').length;
    const activeTechs = technicians.filter(t => t.status === 'active' || t.status === 'busy').length;

    const handleRampClick = (ramp: Ramp) => {
        setSelectedRamp(ramp);
        setIsDetailModalOpen(true);
    };

    return (
        <div className="p-6 lg:p-8 space-y-8 animate-fade">
            <Breadcrumb items={[{ label: 'Service Center' }, { label: 'Ramp View' }]} />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-ink-heading dark:text-white flex items-center gap-2">
                        Workshop Floor
                    </h1>
                    <p className="text-ink-muted mt-2">Real-time status of all {ramps.length} service ramps.</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-xl border border-emerald-500/20 shadow-sm shadow-emerald-500/5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-xs font-black uppercase tracking-widest">{availableCount} Available</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-brand/10 text-brand rounded-xl border border-brand/20 shadow-sm shadow-brand/5">
                        <div className="w-2 h-2 rounded-full bg-brand"></div>
                        <span className="text-xs font-black uppercase tracking-widest">{occupiedCount} Occupied</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {ramps.map((ramp) => (
                    <RampCard
                        key={ramp.id}
                        {...ramp}
                        onClick={() => handleRampClick(ramp)}
                    />
                ))}

                {/* Add New Ramp Placehoder */}
                <div className="border-2 border-dashed border-surface-border dark:border-dark-border rounded-[2.5rem] flex flex-col items-center justify-center p-8 gap-4 hover:border-brand/40 hover:bg-brand/5 transition-all cursor-pointer group">
                    <div className="p-4 bg-surface-border dark:bg-dark-border rounded-full text-ink-muted group-hover:text-brand transition-all duration-500 group-hover:scale-110 group-hover:rotate-90">
                        <Plus size={24} />
                    </div>
                    <span className="text-sm font-bold text-ink-muted uppercase tracking-[0.2em] group-hover:text-brand transition-colors">Add New Bay</span>
                </div>
            </div>

            {/* Quick Actions / Legend */}
            <div className="bg-white dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-3xl p-8 flex flex-wrap gap-12 items-center justify-center shadow-soft">
                <div className="flex items-center gap-4 group cursor-default">
                    <div className="p-3 bg-brand/10 text-brand rounded-2xl group-hover:scale-110 transition-transform"><Hammer size={24} /></div>
                    <div>
                        <p className="text-[10px] font-black text-ink-muted uppercase tracking-widest opacity-60">Total Jobs Today</p>
                        <p className="text-2xl font-black text-ink-heading dark:text-white">{jobCards.length}</p>
                    </div>
                </div>
                <div className="w-px h-12 bg-surface-border dark:bg-dark-border hidden md:block"></div>
                <div className="flex items-center gap-4 group cursor-default">
                    <div className="p-3 bg-brand-soft/50 text-brand-dark rounded-2xl group-hover:scale-110 transition-transform"><Clock size={24} /></div>
                    <div>
                        <p className="text-[10px] font-black text-ink-muted uppercase tracking-widest opacity-60">Avg. Service Time</p>
                        <p className="text-2xl font-black text-ink-heading dark:text-white">45m</p>
                    </div>
                </div>
                <div className="w-px h-12 bg-surface-border dark:bg-dark-border hidden md:block"></div>
                <div className="flex items-center gap-4 group cursor-default">
                    <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform"><UserCheck size={24} /></div>
                    <div>
                        <p className="text-[10px] font-black text-ink-muted uppercase tracking-widest opacity-60">Active Techs</p>
                        <p className="text-2xl font-black text-ink-heading dark:text-white">{activeTechs}/{technicians.length}</p>
                    </div>
                </div>
            </div>

            <RampDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                ramp={selectedRamp}
                onAssignClick={() => {
                    setIsDetailModalOpen(false);
                    setIsAssignModalOpen(true);
                }}
            />

            <AssignTechnicianModal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                ramp={selectedRamp}
            />
        </div>
    );
};

export default RampManagementPage;
