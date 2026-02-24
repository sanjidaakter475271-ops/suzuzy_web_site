'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/service-admin/ui';
import { ChevronLeft, Bike, Info, Calendar, Navigation } from 'lucide-react';
import Link from 'next/link';

export default function CustomerVehiclesPage() {
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/v1/customer/vehicles')
            .then(res => res.json())
            .then(data => {
                if (data.success) setVehicles(data.data);
            })
            .finally(() => setLoading(false));
    }, []);

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
                    <h1 className="text-3xl font-black text-ink-heading dark:text-white uppercase tracking-tight">My Vehicles</h1>
                </div>
            </div>

            {loading ? (
                <div className="text-center p-12 text-ink-muted"><p>Loading your vehicles...</p></div>
            ) : vehicles.length === 0 ? (
                <div className="text-center p-12 bg-white dark:bg-dark-card rounded-3xl border border-surface-border dark:border-dark-border">
                    <Bike size={48} className="mx-auto text-ink-muted/30 mb-4" />
                    <h2 className="text-xl font-black">No Vehicles Found</h2>
                    <p className="text-ink-muted text-sm mt-2">You don't have any vehicles registered yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vehicles.map((v, i) => (
                        <Card key={i} className="rounded-[2rem] border-2 border-surface-border dark:border-dark-border hover:border-brand/30 transition-all group overflow-hidden relative">
                            <CardContent className="p-8 space-y-6">
                                <div className="absolute top-0 right-0 p-4 opacity-5 text-brand transform group-hover:scale-150 transition-transform duration-700 pointer-events-none">
                                    <Bike size={120} />
                                </div>
                                <div className="relative z-10">
                                    <div className="w-14 h-14 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mb-6">
                                        <Bike size={28} />
                                    </div>
                                    <h3 className="text-2xl font-black text-ink-heading dark:text-white uppercase tracking-tighter leading-none mb-1">
                                        {v.bike_models?.name || 'Unknown Model'}
                                    </h3>
                                    <p className="text-sm font-black text-slate-400 tracking-widest">{v.engine_number}</p>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-white/5 relative z-10">
                                    <div className="flex items-center justify-between text-xs font-bold text-ink-muted">
                                        <span className="flex items-center gap-2"><Info size={14} /> Chassis Number</span>
                                        <span className="text-ink-heading dark:text-white">{v.chassis_number.slice(-6) || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs font-bold text-ink-muted">
                                        <span className="flex items-center gap-2"><Calendar size={14} /> Purchase Year</span>
                                        <span className="text-ink-heading dark:text-white">{v.date_of_purchase ? new Date(v.date_of_purchase).getFullYear() : 'Unknown'}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs font-bold text-ink-muted">
                                        <span className="flex items-center gap-2"><Navigation size={14} /> Service Count</span>
                                        <span className="text-brand font-black bg-brand/10 px-2 py-0.5 rounded-md">{v.service_history?.length || 0}</span>
                                    </div>
                                </div>

                                <div className="pt-2 relative z-10 flex gap-2">
                                    <button className="flex-1 bg-surface-page dark:bg-black/20 hover:bg-slate-100 py-3 rounded-xl border border-surface-border dark:border-dark-border text-[10px] font-black uppercase tracking-widest text-ink-muted transition-colors">
                                        Manage
                                    </button>
                                    <Link href="/service-admin/customer/records" className="flex-1">
                                        <button className="w-full bg-brand text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand/20 hover:bg-brand/90 transition-colors">
                                            History
                                        </button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
