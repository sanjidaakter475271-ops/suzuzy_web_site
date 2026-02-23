'use client';

import React, { useState } from 'react';
import { Button, Card, CardContent } from '@/components/ui';
import { Search, Bike, History, Clock, FileText, ChevronRight, User } from 'lucide-react';
import Link from 'next/link';

const CustomerPortalPage = () => {
    const [jobNo, setJobNo] = useState('');

    return (
        <div className="min-h-screen bg-surface-page dark:bg-dark-page">
            {/* Glossy Header */}
            <div className="bg-brand text-white p-12 lg:p-24 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <div className="max-w-4xl mx-auto space-y-8 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-[2rem] flex items-center justify-center font-black text-3xl">RC</div>
                        <div>
                            <h1 className="text-4xl lg:text-6xl font-black tracking-tighter uppercase leading-none">Customer Portal</h1>
                            <p className="text-sm lg:text-lg font-bold opacity-80 mt-2 tracking-wide uppercase">Track. Manage. Ride.</p>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-4 flex flex-col md:flex-row gap-4 shadow-2xl">
                        <div className="flex-1 relative">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/60" size={24} />
                            <input
                                type="text"
                                placeholder="Enter Job Number (e.g. 1234)"
                                value={jobNo}
                                onChange={(e) => setJobNo(e.target.value)}
                                className="w-full bg-transparent border-0 focus:ring-0 text-xl font-black placeholder:text-white/40 pl-16 py-4 outline-none"
                            />
                        </div>
                        <Link href={`/customer/portal/${jobNo}`}>
                            <Button className="bg-white text-brand hover:bg-slate-100 px-12 h-full rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl">
                                Track Live
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Quick Access Grid */}
            <div className="max-w-6xl mx-auto -mt-12 lg:-mt-24 p-6 lg:p-0 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-20 pb-24">

                {/* My Vehicles */}
                <Card className="rounded-[3rem] border-2 border-surface-border dark:border-dark-border shadow-2xl hover:translate-y-[-8px] transition-all duration-500 overflow-hidden group">
                    <CardContent className="p-10 space-y-8">
                        <div className="w-16 h-16 bg-brand/10 text-brand rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                            <Bike size={32} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-ink-heading dark:text-white uppercase tracking-tight">My Vehicles</h3>
                            <p className="text-ink-muted mt-2 font-medium">Manage your registered bikes and service history.</p>
                        </div>
                        <Button variant="outline" className="w-full rounded-2xl h-12 text-xs font-black uppercase tracking-widest border-2">Configure</Button>
                    </CardContent>
                </Card>

                {/* Service History */}
                <Card className="rounded-[3rem] border-2 border-surface-border dark:border-dark-border shadow-2xl hover:translate-y-[-8px] transition-all duration-500 overflow-hidden group">
                    <CardContent className="p-10 space-y-8">
                        <div className="w-16 h-16 bg-blue-500/10 text-blue-600 rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                            <History size={32} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-ink-heading dark:text-white uppercase tracking-tight">Records</h3>
                            <p className="text-ink-muted mt-2 font-medium">Download previous invoices and service certificates.</p>
                        </div>
                        <Button variant="outline" className="w-full rounded-2xl h-12 text-xs font-black uppercase tracking-widest border-2">View Records</Button>
                    </CardContent>
                </Card>

                {/* Book Appointment */}
                <Card className="rounded-[3rem] border-2 border-brand/20 bg-brand/5 shadow-2xl hover:translate-y-[-8px] transition-all duration-500 overflow-hidden group">
                    <CardContent className="p-10 space-y-8">
                        <div className="w-16 h-16 bg-brand text-white rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-brand/20">
                            <Clock size={32} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-ink-heading dark:text-white uppercase tracking-tight">Book Service</h3>
                            <p className="text-ink-muted mt-2 font-medium">Skip the queue by scheduling your next maintenance.</p>
                        </div>
                        <Button className="w-full rounded-2xl h-12 text-xs font-black uppercase tracking-widest shadow-lg shadow-brand/20">Reserve Slot</Button>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Nav Mock */}
            <div className="max-w-4xl mx-auto p-12 text-center space-y-4">
                <div className="flex justify-center -space-x-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="w-12 h-12 rounded-full border-4 border-surface-page bg-slate-200 overflow-hidden">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="user" />
                        </div>
                    ))}
                    <div className="w-12 h-12 rounded-full border-4 border-surface-page bg-brand flex items-center justify-center text-white font-black text-xs">+5k</div>
                </div>
                <p className="text-sm font-bold text-ink-muted">Join 5,000+ happy riders using RC Autocore.</p>
            </div>
        </div>
    );
};

export default CustomerPortalPage;
