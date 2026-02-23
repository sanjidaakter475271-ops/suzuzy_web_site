'use client';

import React from 'react';
import {
    Bell,
    Save,
    Mail,
    MessageSquare,
    ToggleLeft,
    ToggleRight
} from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import { Card, CardContent } from '@/components/ui';

const NotificationSettingsPage = () => {
    return (
        <div className="p-6 lg:p-8 space-y-8 animate-fade max-w-4xl mx-auto">
            <Breadcrumb items={[{ label: 'Settings', href: '/settings' }, { label: 'Notifications' }]} />

            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-black text-ink-heading dark:text-white">Alert Preferences</h1>
                    <p className="text-sm text-ink-muted">Configure who receives system notifications.</p>
                </div>
                <button className="bg-brand text-white px-6 py-2.5 rounded-xl font-bold hover:bg-brand-hover shadow-lg shadow-brand/20 active:scale-95 transition-all flex items-center gap-2">
                    <Save size={18} />
                    Save Changes
                </button>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardContent className="p-6">
                        <h3 className="font-bold text-lg text-ink-heading dark:text-white mb-6 border-b border-surface-border dark:border-dark-border pb-2">Admin Alerts</h3>

                        <div className="space-y-4">
                            {[
                                { title: "Low Stock Alert", desc: "Notify when inventory drops below min level." },
                                { title: "New Online Booking", desc: "Alert on new appointment requests." },
                                { title: "Daily Closing Report", desc: "Email summary of daily sales." },
                                { title: "Technician Absence", desc: "Alert if staff doesn't check in on time." },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-surface-page dark:bg-dark-page rounded-xl border border-surface-border dark:border-dark-border">
                                    <div>
                                        <h4 className="font-bold text-ink-heading dark:text-white text-sm">{item.title}</h4>
                                        <p className="text-xs text-ink-muted">{item.desc}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button className="text-success"><ToggleRight size={32} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <h3 className="font-bold text-lg text-ink-heading dark:text-white mb-6 border-b border-surface-border dark:border-dark-border pb-2">Email Configuration</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-ink-muted uppercase">Admin Email</label>
                                <input
                                    type="email"
                                    defaultValue="admin@royalconsortium.com"
                                    className="w-full bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-xl px-4 py-3 outline-none focus:border-brand transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-ink-muted uppercase">Finance Email</label>
                                <input
                                    type="email"
                                    defaultValue="accounts@royalconsortium.com"
                                    className="w-full bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-xl px-4 py-3 outline-none focus:border-brand transition-colors"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default NotificationSettingsPage;
