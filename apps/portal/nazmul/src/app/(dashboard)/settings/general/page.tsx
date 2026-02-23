'use client';

import React from 'react';
import {
    Globe,
    Save,
    Image as ImageIcon,
    MapPin,
    Phone,
    Mail
} from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import { Card, CardContent } from '@/components/ui';

const GeneralSettingsPage = () => {
    return (
        <div className="p-6 lg:p-8 space-y-8 animate-fade max-w-4xl mx-auto">
            <Breadcrumb items={[{ label: 'Settings', href: '/settings' }, { label: 'General' }]} />

            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-black text-ink-heading dark:text-white">Organization Profile</h1>
                    <p className="text-sm text-ink-muted">Manage company details displayed on invoices and reports.</p>
                </div>
                <button className="bg-brand text-white px-6 py-2.5 rounded-xl font-bold hover:bg-brand-hover shadow-lg shadow-brand/20 active:scale-95 transition-all flex items-center gap-2">
                    <Save size={18} />
                    Save Changes
                </button>
            </div>

            <Card>
                <CardContent className="p-8 space-y-8">
                    {/* Branding */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg text-ink-heading dark:text-white border-b border-surface-border dark:border-dark-border pb-2 flex items-center gap-2">
                            <ImageIcon size={18} className="text-brand" />
                            Branding & Logo
                        </h3>
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 bg-surface-page dark:bg-dark-page rounded-2xl border-2 border-dashed border-surface-border dark:border-dark-border flex flex-col items-center justify-center text-ink-muted cursor-pointer hover:border-brand hover:text-brand transition-colors">
                                <ImageIcon size={24} />
                                <span className="text-[10px] font-black uppercase mt-1">Upload</span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-ink-heading dark:text-white">Company Logo</p>
                                <p className="text-xs text-ink-muted max-w-xs">Recommended size: 512x512px. Used on login screen and invoices.</p>
                            </div>
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-surface-border dark:border-dark-border/50">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-ink-muted uppercase">Company Name</label>
                            <input
                                type="text"
                                defaultValue="Royal Consortium"
                                className="w-full bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-xl px-4 py-3 outline-none focus:border-brand transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-ink-muted uppercase">Tagline / Slogan</label>
                            <input
                                type="text"
                                defaultValue="Premium Service Center"
                                className="w-full bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-xl px-4 py-3 outline-none focus:border-brand transition-colors"
                            />
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="space-y-4 pt-4 border-t border-surface-border dark:border-dark-border/50">
                        <h3 className="font-bold text-lg text-ink-heading dark:text-white border-b border-surface-border dark:border-dark-border pb-2 flex items-center gap-2">
                            <MapPin size={18} className="text-brand" />
                            Contact Information
                        </h3>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-ink-muted uppercase">Address Line 1</label>
                            <input
                                type="text"
                                defaultValue="123, Tejgaon Industrial Area"
                                className="w-full bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-xl px-4 py-3 outline-none focus:border-brand transition-colors"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-ink-muted uppercase flex items-center gap-2">
                                    <Phone size={12} /> Phone Number
                                </label>
                                <input
                                    type="text"
                                    defaultValue="+880 1712 345678"
                                    className="w-full bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-xl px-4 py-3 outline-none focus:border-brand transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-ink-muted uppercase flex items-center gap-2">
                                    <Mail size={12} /> Email Address
                                </label>
                                <input
                                    type="email"
                                    defaultValue="info@royalconsortium.com"
                                    className="w-full bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-xl px-4 py-3 outline-none focus:border-brand transition-colors"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default GeneralSettingsPage;
