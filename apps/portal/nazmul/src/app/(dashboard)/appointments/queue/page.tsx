'use client';

import React from 'react';
import {
    Clock,
    User,
    Bike,
    MoreVertical,
    Calendar,
    Phone
} from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import { Card, CardContent } from '@/components/ui';
import { useAppointmentStore } from '@/stores/appointmentStore';
import { cn } from '@/lib/utils';
import { Appointment } from '@/types';
// import AppointmentQueue from '@/components/appointments/QueueBoard'; // To be implemented

const QueuePage = () => {
    const { appointments } = useAppointmentStore();
    const today = new Date().toISOString().split('T')[0]; // Mock "Today"
    // For demo, we might want to mock the date to match the mock data date or filter properly
    // Let's just use all appointments for the visual demo

    const todaysAppointments = appointments.filter((a: Appointment) => a.status === 'scheduled');

    // Dynamic Stats
    const totalBookings = appointments.length;
    const checkedInCount = appointments.filter((a: Appointment) => a.status === 'completed').length; // Assuming completed means checked in/finished
    const completedCount = appointments.filter((a: Appointment) => a.status === 'completed').length;
    const noShowCount = appointments.filter((a: Appointment) => a.status === 'no-show').length;

    return (
        <div className="p-6 lg:p-8 space-y-8 animate-fade">
            <Breadcrumb items={[{ label: 'Appointments', href: '/appointments' }, { label: "Today's Queue" }]} />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-ink-heading dark:text-white">Service Queue</h1>
                    <p className="text-sm text-ink-muted">Live tracking of today's scheduled appointments.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-brand text-white px-4 py-2 rounded-xl text-center shadow-lg shadow-brand/20">
                        <p className="text-[10px] font-black uppercase tracking-wider opacity-80">Serving Now</p>
                        <p className="text-2xl font-black mt-0.5">102</p>
                    </div>
                    <div className="bg-surface-card dark:bg-dark-card border border-surface-border dark:border-dark-border px-4 py-2 rounded-xl text-center">
                        <p className="text-[10px] font-black uppercase tracking-wider text-ink-muted">Next Token</p>
                        <p className="text-2xl font-black mt-0.5 text-ink-heading dark:text-white">103</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Queue List */}
                <div className="lg:col-span-2 space-y-4">
                    {todaysAppointments.length > 0 ? (
                        todaysAppointments.map((apt: Appointment) => (
                            <Card key={apt.id} className="hover-golden group cursor-pointer">
                                <CardContent className="p-4 flex flex-col md:flex-row items-center gap-6">
                                    <div className="flex flex-col items-center justify-center w-16 h-16 bg-surface-page dark:bg-dark-page rounded-2xl border-2 border-surface-border dark:border-dark-border group-hover:border-brand transition-colors">
                                        <span className="text-[10px] font-bold text-ink-muted uppercase">Token</span>
                                        <span className="text-xl font-black text-ink-heading dark:text-white group-hover:text-brand">{apt.token}</span>
                                    </div>

                                    <div className="flex-1 space-y-1 text-center md:text-left">
                                        <div className="flex flex-col md:flex-row md:items-center gap-2">
                                            <h3 className="font-bold text-lg text-ink-heading dark:text-white">{apt.customerId}</h3>
                                            <span className="hidden md:inline text-ink-border">•</span>
                                            <span className="text-sm font-medium text-ink-muted">{apt.vehicleId}</span>
                                        </div>
                                        <div className="flex items-center justify-center md:justify-start gap-4 text-xs text-ink-muted">
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={14} className="text-brand" />
                                                {apt.time}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={14} />
                                                {apt.serviceType}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button className="p-2 hover:bg-success-bg text-success rounded-lg transition-colors" title="Check In">
                                            <Clock size={20} />
                                        </button>
                                        <button className="p-2 hover:bg-brand-soft text-brand rounded-lg transition-colors" title="Message">
                                            <Phone size={20} />
                                        </button>
                                        <button className="p-2 hover:bg-surface-page dark:hover:bg-dark-page text-ink-muted rounded-lg transition-colors">
                                            <MoreVertical size={20} />
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card>
                            <CardContent className="p-12 text-center text-ink-muted">
                                No scheduled appointments found for today.
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Summary / Stats */}
                <div className="space-y-6">
                    <Card className="bg-brand text-white shadow-xl shadow-brand/10">
                        <CardContent className="p-6 text-center space-y-4">
                            <h3 className="font-bold uppercase tracking-widest text-sm">Estimated Wait Time</h3>
                            <div className="text-5xl font-black">25 <span className="text-lg font-bold opacity-80">min</span></div>
                            <p className="text-xs opacity-80">Based on current workshop load</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <h3 className="font-bold uppercase tracking-widest text-xs text-ink-muted">Today's Summary</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-ink-muted">Total Bookings</span>
                                    <span className="font-bold">{totalBookings}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-ink-muted">Checked In</span>
                                    <span className="font-bold text-brand">{checkedInCount}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-ink-muted">Completed</span>
                                    <span className="font-bold text-success">{completedCount}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-ink-muted">No Show</span>
                                    <span className="font-bold text-danger">{noShowCount}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default QueuePage;
