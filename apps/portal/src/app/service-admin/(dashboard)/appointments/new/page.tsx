'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Calendar,
    Clock,
    User,
    Bike,
    Search,
    AlertCircle,
    CheckCircle2,
    ChevronDown,
    Loader2
} from 'lucide-react';
import Breadcrumb from '@/components/service-admin/Breadcrumb';
import { Card, CardContent } from '@/components/service-admin/ui';
import { useAppointmentStore } from '@/stores/service-admin/appointmentStore';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Appointment } from '@/types/service-admin/index';

const NewAppointmentPage = () => {
    const router = useRouter();
    const { addAppointment, isLoading } = useAppointmentStore();

    const [formData, setFormData] = useState({
        customerId: '',
        vehicleId: '',
        serviceType: '',
        date: '',
        time: '',
    });

    const [customerQuery, setCustomerQuery] = useState('');
    const [customerResults, setCustomerResults] = useState<any[]>([]);
    const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

    const [vehicleResults, setVehicleResults] = useState<any[]>([]);
    const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);

    const [isSuccess, setIsSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');

    // Simple debounce for customer search
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    const handleCustomerSearch = (query: string) => {
        setCustomerQuery(query);
        if (query.length < 2) {
            setCustomerResults([]);
            setShowCustomerDropdown(false);
            return;
        }

        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(async () => {
            setIsSearchingCustomer(true);
            try {
                const res = await fetch(`/api/v1/customer/search?query=${encodeURIComponent(query)}`);
                const { data } = await res.json();
                setCustomerResults(data || []);
                setShowCustomerDropdown(true);
            } catch (error) {
                console.error('Customer search failed', error);
            } finally {
                setIsSearchingCustomer(false);
            }
        }, 400);
    };

    const selectCustomer = async (cust: any) => {
        setFormData(prev => ({ ...prev, customerId: cust.id, vehicleId: '' }));
        setCustomerQuery(cust.full_name || cust.phone);
        setShowCustomerDropdown(false);
        setVehicleResults([]);

        // Fetch vehicles for this customer
        setIsLoadingVehicles(true);
        try {
            const res = await fetch(`/api/v1/customer/vehicles/search?customerId=${cust.id}`);
            const { data } = await res.json();
            setVehicleResults(data || []);
        } catch (error) {
            console.error('Vehicle search failed', error);
        } finally {
            setIsLoadingVehicles(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError('');
        if (!formData.customerId || !formData.vehicleId) {
            setSubmitError('Please select a valid customer and vehicle from the list.');
            return;
        }

        try {
            await addAppointment({
                customerId: formData.customerId,
                vehicleId: formData.vehicleId,
                serviceType: formData.serviceType,
                date: formData.date,
                time: formData.time,
                source: 'walk_in',
                status: 'scheduled'
            });
            setIsSuccess(true);
            setTimeout(() => {
                router.push('/service-admin/appointments/queue');
            }, 1000);
        } catch (err: any) {
            setSubmitError('Failed to save appointment. Please try again.');
        }
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
            <Breadcrumb items={[{ label: 'Appointments', href: '/service-admin/appointments' }, { label: 'New Booking' }]} />

            <div className="text-center md:text-left mb-8">
                <h1 className="text-3xl font-black text-ink-heading dark:text-white">Book New Appointment</h1>
                <p className="text-ink-muted mt-2">Schedule a service visit for a customer.</p>
            </div>

            <Card className="border-t-4 border-brand overflow-visible">
                <CardContent className="p-8 pb-12">
                    {submitError && (
                        <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger flex items-center gap-3">
                            <AlertCircle size={18} />
                            <p className="text-sm font-bold">{submitError}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Customer & Vehicle */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4 relative">
                                <div className="flex items-center gap-2 text-brand font-bold uppercase text-xs tracking-wider mb-2">
                                    <User size={16} />
                                    Customer Details
                                </div>
                                <div className="space-y-2 relative">
                                    <label className="text-xs font-bold text-ink-muted uppercase">Search Customer</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={16} />
                                        <input
                                            type="text"
                                            required
                                            autoComplete="off"
                                            placeholder="Name or phone..."
                                            value={customerQuery}
                                            onChange={(e) => {
                                                handleCustomerSearch(e.target.value);
                                                // If they type, invalidate the selected customer
                                                if (formData.customerId) setFormData(prev => ({ ...prev, customerId: '', vehicleId: '' }));
                                            }}
                                            onFocus={() => customerResults.length > 0 && setShowCustomerDropdown(true)}
                                            onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                                            className="w-full bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-xl pl-10 pr-4 py-3 outline-none focus:border-brand transition-colors"
                                        />
                                        {isSearchingCustomer && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-ink-muted" size={16} />}
                                    </div>

                                    {showCustomerDropdown && (
                                        <div className="absolute top-[105%] left-0 w-full bg-white dark:bg-[#111] border border-surface-border dark:border-white/10 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto">
                                            {customerResults.length === 0 ? (
                                                <div className="p-4 text-center text-sm text-ink-muted">No customers found</div>
                                            ) : (
                                                customerResults.map(cust => (
                                                    <div
                                                        key={cust.id}
                                                        className="px-4 py-3 hover:bg-surface-page dark:hover:bg-white/5 cursor-pointer border-b border-surface-border/50 dark:border-white/5 flex flex-col"
                                                        onClick={() => selectCustomer(cust)}
                                                    >
                                                        <span className="font-bold text-sm text-ink-heading dark:text-white">{cust.full_name || 'Unknown'}</span>
                                                        <span className="text-xs text-ink-muted">{cust.phone || 'No phone'}</span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-brand font-bold uppercase text-xs tracking-wider mb-2">
                                    <Bike size={16} />
                                    Vehicle Details
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-ink-muted uppercase">Select Vehicle</label>
                                    <div className="relative">
                                        <select
                                            required
                                            disabled={!formData.customerId || isLoadingVehicles}
                                            value={formData.vehicleId}
                                            onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                                            className="w-full bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-xl px-4 py-3 outline-none focus:border-brand transition-colors appearance-none disabled:opacity-50"
                                        >
                                            <option value="">{isLoadingVehicles ? 'Loading...' : 'Select a vehicle'}</option>
                                            {vehicleResults.map(v => (
                                                <option key={v.id} value={v.id}>{v.reg_no} ({v.model || 'Unknown'})</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" size={16} />
                                    </div>
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
                                <div className="space-y-2 relative">
                                    <label className="text-xs font-bold text-ink-muted uppercase">Service Type</label>
                                    <div className="relative">
                                        <select
                                            required
                                            value={formData.serviceType}
                                            onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                                            className="w-full bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-xl px-4 py-3 outline-none focus:border-brand transition-colors appearance-none"
                                        >
                                            <option value="">Select Service...</option>
                                            <option value="Full Service">Full Service</option>
                                            <option value="Oil Change">Oil Change</option>
                                            <option value="Brake Check">Brake Check</option>
                                            <option value="General Checkup">General Checkup</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" size={16} />
                                    </div>
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
                                disabled={isLoading}
                                className="flex-[2] bg-brand text-white py-3.5 rounded-xl font-black uppercase tracking-widest hover:bg-brand-hover shadow-lg shadow-brand/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:active:scale-100"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
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
