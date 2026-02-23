'use client';

import React, { useState } from 'react';
import {
    Calendar,
    Clock,
    User,
    Bike,
    Search,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import { Card, CardContent } from '@/components/ui';
import { useAppointmentStore } from '@/stores/appointmentStore';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Appointment } from '@/types/index';

const NewAppointmentPage = () => {
    const router = useRouter();
    const { addAppointment } = useAppointmentStore();
    const [formData, setFormData] = useState({
        customerId: '',
        vehicleId: '',
        serviceType: '',
        date: '',
        time: '',
    });

    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newApt: Appointment = {
            id: `APT${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
            ...formData,
            status: 'scheduled',
            token: Math.floor(Math.random() * 100) + 200, // Mock token logic
        };
        addAppointment(newApt);
        setIsSuccess(true);
        setTimeout(() => {
            router.push('/appointments/queue');
        }, 2000);
    };

    if (isSuccess) {
        return (
            <div className="h-full flex flex-col items-center justify-center space-y-6 animate-fade">
                <div className="w-24 h-24 rounded-full bg-success text-white flex items-center justify-center animate-bounce">
                    <CheckCircle2 size={48} />
                </div>
                <h2 className="text-3xl font-black text-ink-heading dark:text-white">Appointment Confirmed!</h2>
                <p className="text-ink-muted">Redirecting to today's queue...</p>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 space-y-8 animate-fade max-w-4xl mx-auto">
            <Breadcrumb items={[{ label: 'Appointments', href: '/appointments' }, { label: 'New Booking' }]} />

            <div className="text-center md:text-left mb-8">
                <h1 className="text-3xl font-black text-ink-heading dark:text-white">Book New Appointment</h1>
                <p className="text-ink-muted mt-2">Schedule a service visit for a customer.</p>
            </div>

            <Card className="border-t-4 border-brand">
                <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Customer & Vehicle */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-brand font-bold uppercase text-xs tracking-wider mb-2">
                                    <User size={16} />
                                    Customer Details
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-ink-muted uppercase">Customer Name / Phone</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={16} />
                                        <input
                                            type="text"
                                            required
                                            placeholder="Search customer..."
                                            value={formData.customerId}
                                            onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                                            className="w-full bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-xl pl-10 pr-4 py-3 outline-none focus:border-brand transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-brand font-bold uppercase text-xs tracking-wider mb-2">
                                    <Bike size={16} />
                                    Vehicle Details
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-ink-muted uppercase">Vehicle Reg / Model</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Enter vehicle details..."
                                        value={formData.vehicleId}
                                        onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                                        className="w-full bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-xl px-4 py-3 outline-none focus:border-brand transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Scheduling */}
                        <div className="space-y-4 pt-4 border-t border-surface-border dark:border-dark-border/50">
                            <div className="flex items-center gap-2 text-brand font-bold uppercase text-xs tracking-wider mb-2">
                                <Calendar size={16} />
                                Schedule Information
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-ink-muted uppercase">Service Type</label>
                                    <select
                                        required
                                        value={formData.serviceType}
                                        onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                                        className="w-full bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-xl px-4 py-3 outline-none focus:border-brand transition-colors"
                                    >
                                        <option value="">Select Service...</option>
                                        <option value="Full Service">Full Service</option>
                                        <option value="Oil Change">Oil Change</option>
                                        <option value="Brake Check">Brake Check</option>
                                        <option value="General Checkup">General Checkup</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-ink-muted uppercase">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-xl px-4 py-3 outline-none focus:border-brand transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-ink-muted uppercase">Time Slot</label>
                                    <input
                                        type="time"
                                        required
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        className="w-full bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-xl px-4 py-3 outline-none focus:border-brand transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 flex gap-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="flex-1 py-3.5 rounded-xl font-bold uppercase tracking-widest text-ink-muted hover:bg-surface-page dark:hover:bg-dark-page transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-[2] bg-brand text-white py-3.5 rounded-xl font-black uppercase tracking-widest hover:bg-brand-hover shadow-lg shadow-brand/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 size={20} />
                                Confirm Booking
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default NewAppointmentPage;
