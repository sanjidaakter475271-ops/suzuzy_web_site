'use client';

import React, { useState } from 'react';
import {
    Bell,
    Save,
    MessageSquare,
    Mail,
    CheckCircle2,
    ToggleLeft,
    ToggleRight,
    Clock
} from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import { Card, CardContent } from '@/components/ui';
import { SERVICE_REMINDERS_SETTINGS } from '@/constants/appointmentData';

const RemindersPage = () => {
    const [settings, setSettings] = useState(SERVICE_REMINDERS_SETTINGS);

    const handleToggle = (field: keyof typeof settings) => {
        setSettings({ ...settings, [field]: !settings[field] });
    };

    const handleTemplateChange = (type: 'sms' | 'whatsapp', value: string) => {
        setSettings({
            ...settings,
            templates: { ...settings.templates, [type]: value }
        });
    };

    return (
        <div className="p-6 lg:p-8 space-y-8 animate-fade max-w-4xl mx-auto">
            <Breadcrumb items={[{ label: 'Appointments', href: '/appointments' }, { label: 'Service Reminders' }]} />

            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-black text-ink-heading dark:text-white">Reminder Settings</h1>
                    <p className="text-sm text-ink-muted">Configure automated SMS & WhatsApp notification templates.</p>
                </div>
                <button className="bg-brand text-white px-6 py-2.5 rounded-xl font-bold hover:bg-brand-hover shadow-lg shadow-brand/20 active:scale-95 transition-all flex items-center gap-2">
                    <Save size={18} />
                    Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Channels Configuration */}
                <Card>
                    <CardContent className="p-6 space-y-6">
                        <div className="flex items-center gap-2 text-brand font-bold uppercase text-xs tracking-wider mb-2">
                            <Bell size={16} />
                            Notification Channels
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-surface-page dark:bg-dark-page rounded-xl border border-surface-border dark:border-dark-border">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                                        <MessageSquare size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-ink-heading dark:text-white">SMS Reminders</h4>
                                        <p className="text-xs text-ink-muted">Send text alerts to customers.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleToggle('smsEnabled')}
                                    className={`text-2xl transition-colors ${settings.smsEnabled ? 'text-success' : 'text-slate-300'}`}
                                >
                                    {settings.smsEnabled ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-surface-page dark:bg-dark-page rounded-xl border border-surface-border dark:border-dark-border">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center">
                                        <MessageSquare size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-ink-heading dark:text-white">WhatsApp</h4>
                                        <p className="text-xs text-ink-muted">Send rich messages via WhatsApp API.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleToggle('whatsappEnabled')}
                                    className={`text-2xl transition-colors ${settings.whatsappEnabled ? 'text-success' : 'text-slate-300'}`}
                                >
                                    {settings.whatsappEnabled ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-surface-border dark:border-dark-border/50">
                            <label className="text-xs font-bold text-ink-muted uppercase">Reminder Timing</label>
                            <div className="relative mt-2">
                                <select
                                    value={settings.reminderBeforeHours}
                                    onChange={(e) => setSettings({ ...settings, reminderBeforeHours: Number(e.target.value) })}
                                    className="w-full bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-xl px-4 py-3 outline-none focus:border-brand transition-colors appearance-none"
                                >
                                    <option value={24}>24 Hours Before Appointment</option>
                                    <option value={48}>48 Hours Before Appointment</option>
                                    <option value={2}>2 Hours Before Appointment</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-ink-muted">
                                    <Clock size={16} />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Templates */}
                <Card>
                    <CardContent className="p-6 space-y-6">
                        <div className="flex items-center gap-2 text-brand font-bold uppercase text-xs tracking-wider mb-2">
                            <Mail size={16} />
                            Message Templates
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-ink-muted uppercase flex justify-between">
                                    SMS Template
                                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 rounded text-ink-muted">145 chars</span>
                                </label>
                                <textarea
                                    rows={3}
                                    value={settings.templates.sms}
                                    onChange={(e) => handleTemplateChange('sms', e.target.value)}
                                    className="w-full bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-xl px-4 py-3 outline-none focus:border-brand transition-colors text-sm resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-ink-muted uppercase flex justify-between">
                                    WhatsApp Template
                                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 rounded text-ink-muted">Standard</span>
                                </label>
                                <textarea
                                    rows={5}
                                    value={settings.templates.whatsapp}
                                    onChange={(e) => handleTemplateChange('whatsapp', e.target.value)}
                                    className="w-full bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-xl px-4 py-3 outline-none focus:border-brand transition-colors text-sm resize-none"
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-brand/5 rounded-xl border border-brand/10">
                            <p className="text-[10px] text-ink-muted uppercase font-black mb-1">Available Variables</p>
                            <div className="flex flex-wrap gap-2 text-xs font-bold text-brand cursor-help">
                                <span title="Customer Name">{`{customer}`}</span>
                                <span title="Vehicle Model">{`{vehicle}`}</span>
                                <span title="Appointment Date">{`{date}`}</span>
                                <span title="Appointment Time">{`{time}`}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default RemindersPage;
