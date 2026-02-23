'use client';

import React from 'react';
import { Modal, Button } from '@/components/ui';
import { Ramp } from '@/types/workshop';
import { Hammer, User, Car, AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react';
import { useWorkshopStore } from '@/stores/workshopStore';
import { cn } from '@/lib/utils';

interface RampDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    ramp: Ramp | null;
    onAssignClick?: () => void;
}

const RampDetailModal: React.FC<RampDetailModalProps> = ({ isOpen, onClose, ramp, onAssignClick }) => {
    const { technicians, updateRampStatus, releaseRamp } = useWorkshopStore();

    if (!ramp) return null;

    const technician = technicians.find(t => t.id === ramp.assignedTechnicianId);

    const handleStatusChange = (status: Ramp['status']) => {
        updateRampStatus(ramp.id, status);
        onClose();
    };

    const handleRelease = () => {
        if (window.confirm("Are you sure you want to release this ramp?")) {
            releaseRamp(ramp.id);
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Ramp Details" maxWidth="max-w-md">
            <div className="space-y-6">
                {/* Status Header */}
                <div className={cn(
                    "p-4 rounded-2xl border-2 flex items-center justify-between",
                    ramp.status === 'available' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" :
                        ramp.status === 'occupied' ? "bg-brand/10 border-brand/20 text-brand" : "bg-amber-500/10 border-amber-500/20 text-amber-600"
                )}>
                    <div className="flex items-center gap-3">
                        <Hammer size={24} />
                        <div>
                            <p className="text-lg font-black uppercase tracking-tight">{ramp.name}</p>
                            <p className="text-[10px] font-black uppercase opacity-60">Status: {ramp.status}</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    {ramp.status === 'occupied' ? (
                        <>
                            <div className="p-4 bg-surface-page dark:bg-black/20 rounded-2xl border border-surface-border dark:border-white/5 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-brand/10 rounded-lg text-brand"><Car size={20} /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-ink-muted uppercase">Vehicle Info</p>
                                        <p className="font-black text-ink-heading dark:text-white">{ramp.vehicleRegNo}</p>
                                        <p className="text-xs font-bold text-brand">Job ID: #{ramp.currentJobCardId}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-brand/10 rounded-lg text-brand"><User size={20} /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-ink-muted uppercase">Technician</p>
                                        <p className="font-black text-ink-heading dark:text-white">{technician?.name || 'Unassigned'}</p>
                                    </div>
                                </div>
                            </div>

                            <Button
                                variant="danger"
                                className="w-full flex items-center gap-2 py-6 rounded-2xl"
                                onClick={handleRelease}
                            >
                                <Trash2 size={20} />
                                RELEASE RAMP
                            </Button>
                        </>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-sm font-bold text-ink-muted">Set Status:</p>
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    variant="outline"
                                    className={cn("flex flex-col gap-2 h-auto py-4 rounded-2xl", ramp.status === 'available' && "border-emerald-500 text-emerald-600 bg-emerald-500/5")}
                                    onClick={() => handleStatusChange('available')}
                                >
                                    <CheckCircle2 size={24} />
                                    Available
                                </Button>
                                <Button
                                    variant="outline"
                                    className={cn("flex flex-col gap-2 h-auto py-4 rounded-2xl", ramp.status === 'maintenance' && "border-amber-500 text-amber-600 bg-amber-500/5")}
                                    onClick={() => handleStatusChange('maintenance')}
                                >
                                    <AlertTriangle size={24} />
                                    Maintenance
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-4 border-t border-surface-border dark:border-dark-border flex gap-3">
                    <Button variant="outline" className="flex-1 rounded-2xl" onClick={onClose}>Close</Button>
                    {ramp.status === 'available' && (
                        <Button className="flex-2 rounded-2xl" onClick={onAssignClick}>Assign Job</Button>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default RampDetailModal;
