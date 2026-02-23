'use client';

import React from 'react';
import { Modal, Button } from '@/components/ui';
import { Technician, Ramp } from '@/types/workshop';
import { useWorkshopStore } from '@/stores/workshopStore';
import { User, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AssignTechnicianModalProps {
    isOpen: boolean;
    onClose: () => void;
    ramp: Ramp | null;
}

const AssignTechnicianModal: React.FC<AssignTechnicianModalProps> = ({ isOpen, onClose, ramp }) => {
    const { technicians, assignJobToRamp } = useWorkshopStore();

    if (!ramp) return null;

    const availableTechs = technicians.filter(t => t.status === 'active');

    const handleAssign = (techId: string) => {
        // Mocking assignment - in real app, we'd select a Job Card too
        assignJobToRamp(ramp.id, 'JC' + Math.floor(Math.random() * 1000), techId, 'NEW-VEHICLE-' + Math.floor(Math.random() * 100));
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Assign Technician" maxWidth="max-w-md">
            <div className="space-y-6">
                <p className="text-sm text-ink-muted">Select an available technician for <strong>{ramp.name}</strong>:</p>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                    {availableTechs.map((tech) => (
                        <div
                            key={tech.id}
                            className="p-4 bg-surface-page dark:bg-black/20 rounded-2xl border border-surface-border dark:border-white/5 flex items-center justify-between group hover:border-brand/40 transition-all cursor-pointer"
                            onClick={() => handleAssign(tech.id)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center font-black">
                                    {tech.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-black text-ink-heading dark:text-white">{tech.name}</p>
                                    <p className="text-[10px] font-black uppercase text-ink-muted tracking-widest">{tech.activeJobs} Jobs Active</p>
                                </div>
                            </div>
                            <div className="p-2 bg-brand/10 text-brand rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                <Check size={18} />
                            </div>
                        </div>
                    ))}

                    {availableTechs.length === 0 && (
                        <div className="py-10 text-center space-y-2">
                            <p className="text-ink-muted font-bold">No active technicians available.</p>
                        </div>
                    )}
                </div>

                <div className="pt-4 border-t border-surface-border dark:border-dark-border">
                    <Button variant="outline" className="w-full rounded-2xl" onClick={onClose}>Cancel</Button>
                </div>
            </div>
        </Modal>
    );
};

export default AssignTechnicianModal;
