'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/service-admin/ui';
import { ChevronLeft, Calendar, Clock, Bike, Wrench, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function CustomerBookingPage() {
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVehicle, setSelectedVehicle] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [serviceType, setServiceType] = useState('General Service');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetch('/api/v1/customer/vehicles')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setVehicles(data.data);
                    if (data.data.length > 0) setSelectedVehicle(data.data[0].id);
                }
            })
            .finally(() => setLoading(false));

        // Set tomorrow as default date
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setDate(tomorrow.toISOString().split('T')[0]);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/v1/customer/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vehicle_id: selectedVehicle,
                    appointment_date: date,
                    time_slot: time,
                    service_type: serviceType,
                    notes
                })
            });

            const data = await res.json();
            if (data.success) {
                setSuccess(true);
            } else {
                alert(data.error || 'Failed to book appointment');
            }
        } catch (err) {
            console.error(err);
            alert('Server error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-surface-page dark:bg-dark-page flex flex-col items-center justify-center p-6 animate-fade text-center">
                <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-8 mx-auto">
                    <CheckCircle2 size={48} />
                </div>
                <h1 className="text-4xl font-black text-ink-heading dark:text-white uppercase tracking-tighter mb-4">Booking Confirmed!</h1>
                <p className="text-ink-muted mb-8 max-w-md">Your service slot has been successfully reserved. Our team will contact you shortly if necessary.</p>
                <Link href="/service-admin/customer/portal">
                    <button className="bg-brand text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-brand/20 hover:bg-brand-hover hover:-translate-y-1 transition-all">
                        Return to Portal
                    </button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface-page dark:bg-dark-page p-6 lg:p-8 animate-fade pb-24">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/service-admin/customer/portal">
                    <button className="p-3 bg-white dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-xl text-ink-muted hover:text-brand transition-all">
                        <ChevronLeft size={20} />
                    </button>
                </Link>
                <div>
                    <p className="text-[10px] font-black uppercase text-brand tracking-widest">Customer Portal</p>
                    <h1 className="text-3xl font-black text-ink-heading dark:text-white uppercase tracking-tight">Book a Service</h1>
                </div>
            </div>

            <Card className="max-w-3xl mx-auto rounded-[2.5rem] bg-white dark:bg-dark-card border-2 border-surface-border dark:border-dark-border shadow-2xl">
                <CardContent className="p-8 lg:p-12">
                    {loading ? (
                        <div className="text-center py-10 text-ink-muted">Loading available vehicles...</div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* Vehicle Selection */}
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest text-ink-muted flex items-center gap-2">
                                    <Bike size={14} className="text-brand" /> Select Vehicle
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {vehicles.map(v => (
                                        <div
                                            key={v.id}
                                            onClick={() => setSelectedVehicle(v.id)}
                                            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedVehicle === v.id ? 'border-brand bg-brand/5' : 'border-surface-border dark:border-white/5 hover:border-brand/30'}`}
                                        >
                                            <p className="font-black text-ink-heading dark:text-white">{v.bike_models?.name || 'Unknown'}</p>
                                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{v.engine_number}</p>
                                        </div>
                                    ))}
                                </div>
                                {vehicles.length === 0 && (
                                    <div className="p-4 bg-amber-500/10 text-amber-600 rounded-2xl text-sm font-bold border border-amber-500/20">
                                        No vehicles found. Please register a vehicle first.
                                    </div>
                                )}
                            </div>

                            {/* Service Type */}
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest text-ink-muted flex items-center gap-2">
                                    <Wrench size={14} className="text-brand" /> Service Type
                                </label>
                                <select
                                    className="w-full bg-slate-50 dark:bg-black/20 border-2 border-surface-border dark:border-white/5 text-ink-heading dark:text-white text-sm font-bold rounded-2xl p-4 focus:ring-0 focus:border-brand outline-none transition-colors"
                                    value={serviceType}
                                    onChange={(e) => setServiceType(e.target.value)}
                                >
                                    <option>General Service</option>
                                    <option>Paid Service</option>
                                    <option>Free Service</option>
                                    <option>Warranty Claim</option>
                                    <option>Accident Repair</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Date */}
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase tracking-widest text-ink-muted flex items-center gap-2">
                                        <Calendar size={14} className="text-brand" /> Date
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full bg-slate-50 dark:bg-black/20 border-2 border-surface-border dark:border-white/5 text-ink-heading dark:text-white text-sm font-bold rounded-2xl p-4 focus:ring-0 focus:border-brand outline-none transition-colors"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                    />
                                </div>

                                {/* Time Slot */}
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase tracking-widest text-ink-muted flex items-center gap-2">
                                        <Clock size={14} className="text-brand" /> Preferred Time Slot
                                    </label>
                                    <select
                                        required
                                        className="w-full bg-slate-50 dark:bg-black/20 border-2 border-surface-border dark:border-white/5 text-ink-heading dark:text-white text-sm font-bold rounded-2xl p-4 focus:ring-0 focus:border-brand outline-none transition-colors"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                    >
                                        <option value="">Select Time</option>
                                        <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                                        <option value="12:00 PM - 02:00 PM">12:00 PM - 02:00 PM</option>
                                        <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                                        <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                                    </select>
                                </div>
                            </div>

                            {/* Additional Notes */}
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest text-ink-muted flex items-center gap-2">
                                    Additional Notes
                                </label>
                                <textarea
                                    className="w-full bg-slate-50 dark:bg-black/20 border-2 border-surface-border dark:border-white/5 text-ink-heading dark:text-white text-sm font-bold rounded-2xl p-4 focus:ring-0 focus:border-brand outline-none transition-colors min-h-[100px]"
                                    placeholder="Any specific complaints or parts needed?"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || vehicles.length === 0 || !time}
                                className="w-full bg-brand text-white py-5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-brand/20 hover:bg-brand-hover hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                            >
                                {isSubmitting ? 'Confirming...' : 'Confirm Appointment'}
                            </button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
