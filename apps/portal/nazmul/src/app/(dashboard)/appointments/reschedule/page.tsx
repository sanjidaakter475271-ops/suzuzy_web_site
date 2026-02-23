'use client';

import React, { useState } from 'react';
import {
    Calendar,
    Search,
    Edit2,
    Trash2,
    CheckCircle2,
    XCircle,
    User,
    Bike,
    Clock
} from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import { Card, CardContent } from '@/components/ui';
import { useAppointmentStore } from '@/stores/appointmentStore';
import { cn } from '@/lib/utils';
import { Appointment } from '@/types/index';

const ReschedulePage = () => {
    const { appointments, updateStatus, reschedule } = useAppointmentStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ date: '', time: '' });

    const filteredAppointments = appointments.filter(apt =>
        (apt.customerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            apt.vehicleId.toLowerCase().includes(searchQuery.toLowerCase())) &&
        apt.status !== 'cancelled'
    );

    const handleEditClick = (apt: Appointment) => {
        setEditingId(apt.id);
        setEditForm({ date: apt.date, time: apt.time });
    };

    const handleSave = (id: string) => {
        reschedule(id, editForm.date, editForm.time);
        setEditingId(null);
    };

    const handleCancel = (id: string) => {
        if (confirm('Are you sure you want to cancel this appointment?')) {
            updateStatus(id, 'cancelled');
        }
    };

    return (
        <div className="p-6 lg:p-8 space-y-8 animate-fade">
            <Breadcrumb items={[{ label: 'Appointments', href: '/appointments' }, { label: 'Reschedule / Cancel' }]} />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-ink-heading dark:text-white">Manage & Reschedule</h1>
                    <p className="text-sm text-ink-muted">Modify existing appointment slots.</p>
                </div>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={18} />
                <input
                    type="text"
                    placeholder="Search Customer or Vehicle..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-surface-card dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-brand transition-colors text-sm"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAppointments.map((apt) => (
                    <Card key={apt.id} className={cn("transition-all", editingId === apt.id ? "border-brand ring-2 ring-brand/20" : "hover:border-brand")}>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-ink-heading dark:text-white">{apt.customerId}</h3>
                                    <p className="text-xs text-ink-muted flex items-center gap-1 mt-1">
                                        <Bike size={12} /> {apt.vehicleId}
                                    </p>
                                </div>
                                <span className={cn(
                                    "px-2 py-0.5 rounded text-[10px] font-black uppercase",
                                    apt.status === 'scheduled' ? 'bg-success-bg text-success' : 'bg-slate-100 text-slate-500'
                                )}>
                                    {apt.status}
                                </span>
                            </div>

                            {editingId === apt.id ? (
                                <div className="space-y-3 bg-surface-page dark:bg-dark-page p-3 rounded-xl border border-dashed border-brand">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-ink-muted uppercase">New Date</label>
                                        <input
                                            type="date"
                                            value={editForm.date}
                                            onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                            className="w-full bg-transparent border-b border-surface-border focus:border-brand outline-none text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-ink-muted uppercase">New Time</label>
                                        <input
                                            type="time"
                                            value={editForm.time}
                                            onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                                            className="w-full bg-transparent border-b border-surface-border focus:border-brand outline-none text-xs"
                                        />
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={() => handleSave(apt.id)}
                                            className="flex-1 bg-brand text-white py-1.5 rounded text-xs font-bold"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="flex-1 bg-surface-border text-ink-muted py-1.5 rounded text-xs font-bold"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4 text-sm text-ink-heading dark:text-white font-medium bg-surface-page dark:bg-dark-page p-3 rounded-xl">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-brand" />
                                        {apt.date}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} className="text-brand" />
                                        {apt.time}
                                    </div>
                                </div>
                            )}

                            {editingId !== apt.id && (
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => handleEditClick(apt)}
                                        className="flex-1 py-2 border border-surface-border dark:border-dark-border rounded-xl text-xs font-bold text-ink-muted hover:border-brand hover:text-brand transition-all flex items-center justify-center gap-2"
                                    >
                                        <Edit2 size={14} />
                                        reschedule
                                    </button>
                                    <button
                                        onClick={() => handleCancel(apt.id)}
                                        className="py-2 px-3 border border-surface-border dark:border-dark-border rounded-xl text-xs font-bold text-danger hover:bg-danger-bg hover:border-danger transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ReschedulePage;
