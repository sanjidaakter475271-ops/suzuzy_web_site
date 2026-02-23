'use client';

import React, { useEffect, useState } from 'react';
import { useCustomerStore } from '@/stores/customerStore';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent } from '@/components/ui';
import { Search, Bike, History, Clock, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const CustomerDashboardPage = () => {
    const { customer, isAuthenticated } = useCustomerStore();
    const router = useRouter();
    const [jobNo, setJobNo] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (!isAuthenticated) {
            router.push('/customer/login');
        }
    }, [isAuthenticated, router]);

    if (!mounted || !isAuthenticated) return null;

    return (
        <div className="space-y-12 animate-fade">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-brand text-white shadow-2xl shadow-brand/20">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <div className="relative z-10 p-10 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4 text-center md:text-left">
                        <h1 className="text-3xl lg:text-5xl font-black uppercase tracking-tight leading-none">
                            Hello, {customer?.name.split(' ')[0]}!
                        </h1>
                        <p className="text-white/80 font-medium text-lg max-w-lg">
                            Your garage is ready. Manage your vehicles and track comprehensive service history.
                        </p>
                        <div className="pt-4 flex flex-wrap gap-4 justify-center md:justify-start">
                            <Link href="/customer/request-service">
                                <Button className="bg-white text-brand hover:bg-slate-100 rounded-2xl h-14 px-8 font-black uppercase text-xs tracking-[0.2em] shadow-lg">
                                    Book Service
                                </Button>
                            </Link>
                            <Link href="/customer/history">
                                <Button variant="outline" className="border-white text-white hover:bg-white/10 rounded-2xl h-14 px-8 font-black uppercase text-xs tracking-[0.2em]">
                                    My History
                                </Button>
                            </Link>
                        </div>
                    </div>
                    {/* Stat / Info */}
                    <div className="bg-white/10 backdrop-blur-md rounded-[2rem] p-6 border border-white/20 w-full max-w-xs text-center">
                        <div className="text-4xl font-black mb-1">{customer?.vehicles.length}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest opacity-70">Active Vehicles</div>
                    </div>
                </div>
            </div>

            {/* Track Job Section */}
            <div className="max-w-3xl mx-auto -mt-6 relative z-20">
                <div className="bg-white dark:bg-dark-card border-2 border-surface-border dark:border-dark-border rounded-[2.5rem] p-4 pl-8 flex gap-4 shadow-xl shadow-slate-200/50 dark:shadow-none items-center group focus-within:border-brand transition-colors">
                    <Search className="text-ink-muted group-focus-within:text-brand" size={24} />
                    <input
                        type="text"
                        placeholder="Enter Job Card No. to Track (e.g. 1234)"
                        value={jobNo}
                        onChange={(e) => setJobNo(e.target.value)}
                        className="flex-1 bg-transparent border-0 outline-none text-xl font-bold placeholder:font-medium text-ink-heading dark:text-white"
                    />
                    <Button
                        onClick={() => jobNo && router.push(`/customer/track/${jobNo}`)}
                        className="h-14 rounded-[2rem] px-8 bg-brand hover:bg-brand-dark font-black uppercase text-xs tracking-widest shadow-lg shadow-brand/20"
                    >
                        Track
                    </Button>
                </div>
            </div>

            {/* My Vehicles Grid */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-4">
                    <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                        <Bike className="text-brand" /> My Garage
                    </h2>
                    <Button variant="ghost" className="text-brand font-black text-xs uppercase tracking-widest hover:bg-brand/10 rounded-xl gap-2">
                        <Plus size={16} /> Add Vehicle
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {customer?.vehicles.map((vehicle) => (
                        <Card key={vehicle.id} className="rounded-[2.5rem] border-2 border-surface-border dark:border-dark-border hover:border-brand transition-all overflow-hidden group">
                            <CardContent className="p-8 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className="w-14 h-14 bg-surface-page dark:bg-dark-page rounded-2xl flex items-center justify-center text-ink-muted group-hover:text-brand group-hover:bg-brand/10 transition-colors">
                                        <Bike size={28} />
                                    </div>
                                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                        Active
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-ink-heading dark:text-white mb-1">{vehicle.model}</h3>
                                    <p className="text-sm font-bold text-ink-muted bg-surface-page dark:bg-dark-page inline-block px-3 py-1 rounded-lg border border-surface-border dark:border-dark-border">
                                        {vehicle.regNo}
                                    </p>
                                </div>
                                <div className="pt-6 border-t border-surface-border dark:border-dark-border flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] font-bold text-ink-muted uppercase">Last Service</p>
                                        <p className="text-xs font-black text-ink-heading dark:text-white mt-0.5">{vehicle.lastService || 'N/A'}</p>
                                    </div>
                                    <Link href="/customer/request-service" className="w-10 h-10 rounded-full bg-surface-page dark:bg-dark-page flex items-center justify-center hover:bg-brand hover:text-white transition-all shadow-sm">
                                        <ArrowRight size={18} />
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Add New Placeholder */}
                    <div className="border-2 border-dashed border-surface-border dark:border-dark-border rounded-[2.5rem] flex flex-col items-center justify-center p-8 gap-4 hover:border-brand/40 hover:bg-brand/5 transition-all cursor-pointer group min-h-[280px]">
                        <div className="p-4 bg-surface-border dark:bg-dark-border rounded-full text-ink-muted group-hover:text-brand transition-all duration-500 group-hover:scale-110">
                            <Plus size={32} />
                        </div>
                        <span className="text-sm font-bold text-ink-muted uppercase tracking-[0.2em] group-hover:text-brand transition-colors">Register New Bike</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboardPage;
