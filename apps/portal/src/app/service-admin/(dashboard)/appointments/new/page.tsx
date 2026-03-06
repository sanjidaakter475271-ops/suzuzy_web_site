'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Calendar as CalendarIcon,
    Clock,
    User,
    Bike,
    CheckCircle2,
    ChevronDown,
    Loader2,
    X,
    Search as SearchIcon,
    AlertCircle,
    ChevronRight,
    MapPin,
    ArrowLeft,
} from 'lucide-react';
import Breadcrumb from '@/components/service-admin/Breadcrumb';
import { Card, CardContent } from '@/components/service-admin/ui';
import { Calendar } from '@/components/service-admin/ui/Calendar';
import { useAppointmentStore } from '@/stores/service-admin/appointmentStore';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

/**
 * PREMIUM APPOINTMENT BOOKING EXPERIENCE
 * Focusing on characterful typography, grid-breaking elements, and a high-end atmosphere.
 */
const NewAppointmentPage = () => {
    const router = useRouter();
    const { addAppointment, isLoading } = useAppointmentStore();

    // FORM STATE
    const [formData, setFormData] = useState({
        customerId: '',
        vehicleId: '',
        serviceType: '',
        date: '',
        time: '',
    });

    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [showDatePicker, setShowDatePicker] = useState(false);

    // SEARCH STATES
    const [customerQuery, setCustomerQuery] = useState('');
    const [customerResults, setCustomerResults] = useState<any[]>([]);
    const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

    const [vehicleResults, setVehicleResults] = useState<any[]>([]);
    const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);

    const [isSuccess, setIsSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    // Pre-fill date if selected on mount
    useEffect(() => {
        if (selectedDate && !formData.date) {
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate.getDate()).padStart(2, '0');
            setFormData(prev => ({ ...prev, date: `${year}-${month}-${day}` }));
        }
    }, [selectedDate, formData.date]);

    // HANDLERS
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
        }, 350);
    };

    const selectCustomer = async (cust: any) => {
        // Robust selection to fix the "not selecting" issue
        setFormData(prev => ({ ...prev, customerId: cust.id, vehicleId: '' }));
        setCustomerQuery(cust.full_name || cust.phone);
        setShowCustomerDropdown(false);
        setVehicleResults([]);

        setIsLoadingVehicles(true);
        try {
            const res = await fetch(`/api/v1/customer/vehicles/search?customerId=${cust.id}`);
            const { data } = await res.json();
            setVehicleResults(data || []);
            if (data && data.length > 0) {
                toast.success("Vehicles loaded for " + (cust.full_name || 'customer'));
            }
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
            setSubmitError('Please complete customer and vehicle selection.');
            return;
        }
        if (!formData.date || !formData.time) {
            setSubmitError('Please select a preferred date and time slot.');
            return;
        }

        try {
            await addAppointment({
                customerId: formData.customerId,
                vehicleId: formData.vehicleId,
                serviceType: formData.serviceType || 'General Service',
                date: formData.date,
                time: formData.time,
                source: 'walk_in',
                status: 'scheduled'
            });

            toast.success("Appointment Secured", {
                description: `Customer added to ${formData.date} at ${formData.time}`
            });

            setIsSuccess(true);
            setTimeout(() => {
                router.push('/service-admin/appointments/queue');
            }, 1500);
        } catch (err: any) {
            setSubmitError(err.message || 'The server encountered an error while securing the booking.');
            toast.error("Booking Failed");
        }
    };

    // TIME SLOTS PREVIEW
    const timeSlots = [
        '09:00', '10:00', '11:00', '12:00',
        '14:00', '15:00', '16:00', '17:00'
    ];

    if (isSuccess) {
        return (
            <div className="h-screen flex flex-col items-center justify-center space-y-10 animate-fade bg-surface-page dark:bg-[#080808]">
                <div className="relative">
                    <div className="absolute inset-0 bg-brand/20 blur-[80px] rounded-full scale-150 animate-pulse"></div>
                    <div className="relative w-32 h-32 rounded-full bg-brand text-white flex items-center justify-center shadow-[0_0_50px_rgba(var(--brand-rgb),0.4)]">
                        <CheckCircle2 size={64} className="animate-in zoom-in duration-500" strokeWidth={3} />
                    </div>
                </div>
                <div className="text-center space-y-3">
                    <h2 className="text-4xl font-black text-ink-heading dark:text-white uppercase tracking-tighter italic">Booking Secured</h2>
                    <p className="text-ink-muted font-medium tracking-wide lowercase opacity-60">Redirecting to the service queue...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface-page dark:bg-[#0a0a0a] p-6 lg:p-12 selection:bg-brand/30">
            <div className="max-w-6xl mx-auto space-y-12">
                {/* HEAD & BREADCRUMB */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <Breadcrumb items={[{ label: 'Service', href: '/service-admin/appointments' }, { label: 'Securing Appointment' }]} />
                        <h1 className="text-5xl lg:text-7xl font-black text-ink-heading dark:text-white uppercase tracking-tighter leading-[0.9] italic">
                            New <span className="text-brand">Booking</span>
                        </h1>
                        <p className="text-sm font-medium text-ink-muted uppercase tracking-[0.2em] opacity-60">
                            Orchestrating professional service schedules
                        </p>
                    </div>
                    <button
                        onClick={() => router.back()}
                        className="group flex items-center gap-3 text-ink-muted hover:text-brand transition-colors font-black uppercase tracking-widest text-[10px]"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Go Back
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* MAIN FORM COLUMN */}
                    <div className="lg:col-span-12">
                        <form onSubmit={handleSubmit} className="space-y-8">

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                                {/* LEFT PART: CUSTOMER & VEHICLE */}
                                <div className="md:col-span-5 space-y-8">
                                    <div className="relative">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 text-brand">
                                                <User size={20} strokeWidth={3} />
                                                <span className="text-[11px] font-black uppercase tracking-[0.3em]">Customer Search</span>
                                            </div>

                                            <div className="relative group">
                                                <input
                                                    type="text"
                                                    required
                                                    autoComplete="off"
                                                    placeholder="NAME OR CONNECTED PHONE..."
                                                    value={customerQuery}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        handleCustomerSearch(val);
                                                        if (formData.customerId && val !== customerQuery) {
                                                            setFormData(p => ({ ...p, customerId: '', vehicleId: '' }));
                                                        }
                                                    }}
                                                    onFocus={() => customerResults.length > 0 && setShowCustomerDropdown(true)}
                                                    onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                                                    className="w-full bg-white dark:bg-[#111] border-2 border-surface-border dark:border-white/5 rounded-3xl px-6 py-5 text-sm font-black tracking-widest uppercase focus:border-brand dark:focus:border-brand outline-none transition-all shadow-xl shadow-black/5 placeholder:opacity-30"
                                                />
                                                <div className="absolute right-6 top-1/2 -translate-y-1/2">
                                                    {isSearchingCustomer ? (
                                                        <Loader2 className="animate-spin text-brand" size={18} />
                                                    ) : (
                                                        <SearchIcon size={18} className="text-ink-muted opacity-40" />
                                                    )}
                                                </div>

                                                {/* PREMIUM DROPDOWN */}
                                                {showCustomerDropdown && (
                                                    <div className="absolute top-[calc(100%+12px)] left-0 w-full bg-white dark:bg-[#151515] border border-surface-border dark:border-white/10 rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] z-[100] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                                                        <div className="p-2 space-y-1">
                                                            {customerResults.length === 0 ? (
                                                                <div className="px-6 py-8 text-center text-xs font-black uppercase tracking-widest text-ink-muted opacity-40">Zero Matches Found</div>
                                                            ) : (
                                                                customerResults.map(cust => (
                                                                    <div
                                                                        key={cust.id}
                                                                        className="group/item flex items-center justify-between px-6 py-4 hover:bg-brand/5 dark:hover:bg-brand/10 cursor-pointer rounded-2xl transition-all"
                                                                        onMouseDown={(e) => {
                                                                            e.preventDefault();
                                                                            selectCustomer(cust);
                                                                        }}
                                                                    >
                                                                        <div className="space-y-1">
                                                                            <p className="font-black text-xs uppercase tracking-wider text-ink-heading dark:text-white group-hover/item:text-brand transition-colors">{cust.full_name || 'Legacy Profile'}</p>
                                                                            <p className="text-[10px] font-bold text-ink-muted opacity-60 tracking-widest">{cust.phone}</p>
                                                                        </div>
                                                                        <ChevronRight size={14} className="text-ink-muted opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all" />
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-brand">
                                            <Bike size={20} strokeWidth={3} />
                                            <span className="text-[11px] font-black uppercase tracking-[0.3em]">Vehicle Fleet</span>
                                        </div>
                                        <div className="relative group">
                                            <select
                                                required
                                                disabled={!formData.customerId || isLoadingVehicles}
                                                value={formData.vehicleId}
                                                onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                                                className="w-full bg-white dark:bg-[#111] border-2 border-surface-border dark:border-white/5 rounded-3xl px-6 py-5 text-sm font-black tracking-widest uppercase focus:border-brand dark:focus:border-brand outline-none transition-all shadow-xl shadow-black/5 appearance-none disabled:opacity-30 disabled:grayscale"
                                            >
                                                <option value="">{isLoadingVehicles ? 'SYNCING...' : 'SELECT RECOGNIZED VEHICLE'}</option>
                                                {vehicleResults.map(v => (
                                                    <option key={v.id} value={v.id}>{v.reg_no} — {v.model || 'GENERIC'}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-brand pointer-events-none group-focus-within:rotate-180 transition-transform" />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-brand">
                                            <MapPin size={20} strokeWidth={3} />
                                            <span className="text-[11px] font-black uppercase tracking-[0.3em]">Service Definition</span>
                                        </div>
                                        <div className="relative group">
                                            <select
                                                required
                                                value={formData.serviceType}
                                                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                                                className="w-full bg-white dark:bg-[#111] border-2 border-surface-border dark:border-white/5 rounded-3xl px-6 py-5 text-sm font-black tracking-widest uppercase focus:border-brand dark:focus:border-brand outline-none transition-all shadow-xl shadow-black/5 appearance-none"
                                            >
                                                <option value="">SPECIFY NATURE OF SERVICE</option>
                                                <option value="Paid Service">PAID SERVICE (PERIODIC)</option>
                                                <option value="Free Service">FREE SERVICE (COUPON)</option>
                                                <option value="Warranty Claim">WARRANTY REPAIR</option>
                                                <option value="Accidental Repair">ACCIDENTAL RESTORATION</option>
                                                <option value="General Checkup">DIAGNOSTIC CHECKUP</option>
                                            </select>
                                            <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-brand pointer-events-none group-focus-within:rotate-180 transition-transform" />
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT PART: SCHEDULING - PREMIUM GRID */}
                                <div className="md:col-span-7">
                                    <div className="bg-white dark:bg-[#111] border-2 border-surface-border dark:border-white/5 rounded-[3rem] p-10 shadow-2xl shadow-black/10 flex flex-col lg:flex-row gap-12 border-b-[8px] border-b-brand/30">

                                        {/* CALENDAR SECTION */}
                                        <div className="flex-1 space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 text-brand">
                                                    <CalendarIcon size={20} strokeWidth={3} />
                                                    <span className="text-[11px] font-black uppercase tracking-[0.3em]">Date Selection</span>
                                                </div>
                                            </div>
                                            <div className="calendar-premium flex justify-center">
                                                <Calendar
                                                    value={selectedDate}
                                                    onChange={(date: Date) => {
                                                        setSelectedDate(date);
                                                        const y = date.getFullYear();
                                                        const m = String(date.getMonth() + 1).padStart(2, '0');
                                                        const d = String(date.getDate()).padStart(2, '0');
                                                        setFormData(p => ({ ...p, date: `${y}-${m}-${d}` }));
                                                    }}
                                                    className="rounded-3xl border-none p-0 scale-110 lg:scale-[1.15] origin-top"
                                                />
                                            </div>
                                        </div>

                                        {/* TIME GRID SECTION */}
                                        <div className="w-full lg:w-60 space-y-6 flex flex-col">
                                            <div className="flex items-center gap-3 text-brand">
                                                <Clock size={20} strokeWidth={3} />
                                                <span className="text-[11px] font-black uppercase tracking-[0.3em]">Temporal Slot</span>
                                            </div>
                                            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 flex-1 overflow-y-auto pr-1">
                                                {timeSlots.map(t => (
                                                    <button
                                                        key={t}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedTime(t);
                                                            setFormData(p => ({ ...p, time: t }));
                                                        }}
                                                        className={cn(
                                                            "py-4 px-6 rounded-2xl text-xs font-black uppercase tracking-widest transition-all text-center border-2 border-transparent",
                                                            selectedTime === t
                                                                ? "bg-brand text-white shadow-[0_10px_20px_rgba(var(--brand-rgb),0.3)] scale-105 z-10"
                                                                : "bg-surface-page dark:bg-white/5 text-ink-muted hover:border-brand/30"
                                                        )}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>

                            {/* SUBMIT FOOTER */}
                            <div className="flex flex-col md:flex-row items-center gap-6 pt-4">
                                <div className="flex-1">
                                    {submitError && (
                                        <div className="p-5 rounded-3xl bg-danger/10 text-danger border border-danger/20 flex items-center gap-4 animate-shake">
                                            <AlertCircle size={20} />
                                            <span className="text-[11px] font-black uppercase tracking-wider">{submitError}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <button
                                        type="button"
                                        onClick={() => router.push('/service-admin/appointments/queue')}
                                        className="px-8 py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] text-ink-muted hover:bg-surface-card transition-all"
                                    >
                                        Abandon
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="relative group bg-brand text-white px-12 py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] overflow-hidden shadow-2xl shadow-brand/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                                    >
                                        <span className="relative z-10 flex items-center gap-3">
                                            {isLoading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} strokeWidth={3} />}
                                            Finalize Booking
                                        </span>
                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                    </button>
                                </div>
                            </div>

                        </form>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .calendar-premium .rdp {
                    --rdp-cell-size: 45px;
                    --rdp-accent-color: var(--brand);
                    --rdp-background-color: var(--brand-soft);
                    margin: 0;
                }
                .calendar-premium .rdp-day_selected {
                    background-color: var(--brand) !important;
                    font-weight: 900 !important;
                    color: white !important;
                    border-radius: 12px !important;
                    box-shadow: 0 10px 20px rgba(var(--brand-rgb), 0.2);
                }
                .calendar-premium .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
                    background-color: var(--brand-soft) !important;
                    border-radius: 12px !important;
                    color: var(--brand) !important;
                }
                .calendar-premium .rdp-day_today {
                    font-weight: 900;
                    color: var(--brand);
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: var(--brand);
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
};

export default NewAppointmentPage;
