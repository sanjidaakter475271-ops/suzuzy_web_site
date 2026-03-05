'use client';

import React from 'react';
import {
    Globe,
    Search,
    CheckCircle2,
    XCircle,
    Clock,
    User,
    Calendar
} from 'lucide-react';
import Breadcrumb from '@/components/service-admin/Breadcrumb';
import { Card, CardContent } from '@/components/service-admin/ui';
import { cn } from '@/lib/utils';
import { useAppointmentStore } from '@/stores/service-admin/appointmentStore';
import { Appointment } from '@/types/service-admin/index';

const OnlineBookingPage = () => {
    const { appointments, fetchAppointments, isLoading, updateStatus } = useAppointmentStore();

    React.useEffect(() => {
        fetchAppointments(); // fetch all active to filter out online/pending
    }, [fetchAppointments]);

    const onlineBookings = appointments.filter(
        (a: Appointment) => a.source === 'online' && a.status === 'pending'
    );

    const handleApprove = (id: string) => {
        updateStatus(id, 'scheduled');
    };

    const handleReject = (id: string) => {
        if (confirm("Are you sure you want to reject this request?")) {
            updateStatus(id, 'cancelled');
        }
    };

    return (
        <div className="p-6 lg:p-8 space-y-8 animate-fade">
            <Breadcrumb items={[{ label: 'Appointments', href: '/service-admin/appointments' }, { label: 'Online Requests' }]} />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-ink-heading dark:text-white">Online Booking Requests</h1>
                    <p className="text-sm text-ink-muted">Approve or reject customer web bookings.</p>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center p-12 text-ink-muted">Loading requests...</div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {onlineBookings.map((booking: Appointment) => (
                        <Card key={booking.id} className="hover:border-brand transition-all">
                            <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                                        <Globe size={24} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <h3 className="text-lg font-bold text-ink-heading dark:text-white truncate">{booking.customerName}</h3>
                                            <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-[10px] font-black uppercase whitespace-nowrap">Web</span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-xs text-ink-muted">
                                            <span className="flex items-center gap-1"><User size={12} /> {booking.vehicleRegNo} ({booking.vehicleModel})</span>
                                            <span className="flex items-center gap-1"><Calendar size={12} /> {booking.date}</span>
                                            <span className="flex items-center gap-1"><Clock size={12} /> {booking.time}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 w-full md:w-auto shrink-0 mt-4 md:mt-0">
                                    <button
                                        onClick={() => handleReject(booking.id)}
                                        className="flex-1 md:flex-none px-4 py-2 bg-surface-page dark:bg-dark-page hover:bg-danger-bg text-danger font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                                    >
                                        <XCircle size={16} />
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleApprove(booking.id)}
                                        className="flex-1 md:flex-none px-6 py-2 bg-brand text-white font-bold rounded-xl shadow-lg shadow-brand/20 hover:bg-brand-hover active:scale-95 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                                    >
                                        <CheckCircle2 size={16} />
                                        Approve
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {onlineBookings.length === 0 && (
                        <div className="py-20 text-center space-y-4 bg-surface-card dark:bg-dark-card rounded-2xl border-2 border-dashed border-surface-border dark:border-dark-border">
                            <CheckCircle2 size={48} className="mx-auto text-success/40" />
                            <p className="text-ink-muted font-bold">No pending online requests.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default OnlineBookingPage;
