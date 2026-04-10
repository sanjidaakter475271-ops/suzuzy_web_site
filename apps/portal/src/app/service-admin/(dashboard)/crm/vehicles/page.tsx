"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
    Search,
    Bike,
    User,
    Calendar,
    Gauge,
    ChevronRight,
    Wrench,
    ArrowUpDown,
    Filter,
    Loader2,
    ShieldCheck,
    Hash
} from 'lucide-react';
import Breadcrumb from '@/components/service-admin/Breadcrumb';
import { Card, CardContent, Button } from '@/components/service-admin/ui';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { format } from 'date-fns';

interface VehicleListItem {
    id: string;
    customerId: string;
    ownerName: string;
    ownerPhone: string;
    model: string;
    modelCode?: string;
    engineNo: string;
    chassisNo: string;
    regNo?: string;
    color?: string;
    purchaseDate?: string;
    lastServiceDate?: string;
    lastMileage?: number;
    servicePlan?: {
        total: number;
        used: number;
        remaining: number;
    };
}

const VehicleListPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);

    const { data: result, isLoading, error } = useQuery({
        queryKey: ['crm-vehicles', searchQuery, page],
        queryFn: async () => {
            const res = await axios.get('/api/v1/crm/vehicles', {
                params: { query: searchQuery, page, limit: 12 }
            });
            return res.data;
        },
        placeholderData: (previousData) => previousData,
    });

    const vehicles = result?.data || [];
    const pagination = result?.pagination;

    return (
        <div className="p-6 lg:p-8 space-y-6 animate-fade">
            <Breadcrumb items={[{ label: 'CRM', href: '/service-admin/crm' }, { label: 'Vehicles' }]} />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-ink-heading dark:text-white uppercase tracking-tight">Registered Vehicles</h1>
                    <p className="text-sm text-ink-muted font-medium italic">Comprehensive database of all bikes in your network.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2">
                        <Filter size={18} />
                        Filter
                    </Button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full max-w-xl">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={18} />
                    <input
                        type="text"
                        placeholder="Search by Engine, Chassis, Reg No, or Owner..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setPage(1);
                        }}
                        className="w-full bg-surface-card dark:bg-dark-card border-2 border-surface-border dark:border-dark-border rounded-2xl pl-10 pr-4 py-3.5 focus:outline-none focus:border-brand transition-all text-sm shadow-sm font-bold"
                    />
                    {isLoading && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <Loader2 size={16} className="animate-spin text-brand" />
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 text-xs font-black text-ink-muted uppercase tracking-widest bg-surface-page dark:bg-dark-page px-4 py-2 rounded-full border border-surface-border dark:border-dark-border">
                    <ArrowUpDown size={14} />
                    Sort: Recently Registered
                </div>
            </div>

            {error ? (
                <div className="py-20 text-center">
                    <p className="text-danger font-black uppercase">Service Error: Connection Refused</p>
                    <p className="text-sm text-ink-muted mt-2">Check your database status or contact support.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {isLoading && !vehicles.length ? (
                        Array.from({ length: 6 }).map((_, idx) => (
                            <Card key={idx} className="animate-pulse rounded-[2.5rem]">
                                <CardContent className="p-8 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-2">
                                            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-16" />
                                            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-32" />
                                        </div>
                                        <div className="w-20 h-6 bg-slate-200 dark:bg-slate-800 rounded-full" />
                                    </div>
                                    <div className="space-y-3 pt-2">
                                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                                    </div>
                                    <div className="pt-6 border-t border-surface-border dark:border-dark-border/50 flex justify-between items-center">
                                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24" />
                                        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : vehicles.length > 0 ? (
                        vehicles.map((vehicle: VehicleListItem) => (
                            <Link href={`/service-admin/crm/customers/${vehicle.customerId}?tab=vehicles`} key={vehicle.id}>
                                <Card className="hover:border-brand transition-all group cursor-pointer h-full border-2 border-transparent rounded-[2.5rem] shadow-xl shadow-slate-100 dark:shadow-none hover:shadow-brand/10 bg-white dark:bg-dark-card overflow-hidden">
                                    <div className="h-1.5 w-full bg-brand/10 group-hover:bg-brand transition-colors" />
                                    <CardContent className="p-8 space-y-6">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-brand tracking-[0.2em] mb-1">{vehicle.modelCode || 'SUZUKI'}</p>
                                                <h3 className="text-xl font-black text-ink-heading dark:text-white group-hover:text-brand transition-colors italic">{vehicle.model}</h3>
                                            </div>
                                            <div className="bg-brand-soft text-brand px-3 py-1.5 rounded-xl text-[10px] font-black border border-brand/10 shadow-sm uppercase tracking-wider">
                                                {vehicle.regNo || 'NO REG'}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-xs font-bold text-ink-muted">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Engine No</span>
                                                <span className="text-ink-heading dark:text-white tracking-widest">{vehicle.engineNo}</span>
                                            </div>
                                            <div className="flex flex-col gap-1 text-right">
                                                <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Chassis No</span>
                                                <span className="text-ink-heading dark:text-white tracking-widest">{vehicle.chassisNo}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2.5 bg-surface-page dark:bg-dark-page p-4 rounded-3xl border border-surface-border dark:border-dark-border/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-white dark:bg-dark-card rounded-full flex items-center justify-center shadow-sm text-brand border border-surface-border dark:border-dark-border">
                                                    <User size={14} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-ink-heading dark:text-white line-clamp-1">{vehicle.ownerName}</span>
                                                    <span className="text-[10px] text-ink-muted italic">{vehicle.ownerPhone}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-[10px] font-bold border-t border-surface-border dark:border-dark-border/30 pt-2 mt-2">
                                                <div className="flex items-center gap-1.5">
                                                    <Gauge size={12} className="text-brand" />
                                                    <span>{vehicle.lastMileage?.toLocaleString() || 0} km</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar size={12} className="text-brand" />
                                                    <span>{vehicle.lastServiceDate ? format(new Date(vehicle.lastServiceDate), "dd MMM yy") : 'Never'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-dashed border-surface-border dark:border-dark-border/50 flex items-center justify-between">
                                            {vehicle.servicePlan ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600">
                                                        <ShieldCheck size={14} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-black uppercase text-emerald-600">Plan ACTIVE</span>
                                                        <span className="text-[10px] font-bold text-ink-muted">{vehicle.servicePlan.remaining} Free Left</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 bg-slate-100 dark:bg-dark-page rounded-xl text-slate-400">
                                                        <Wrench size={14} />
                                                    </div>
                                                    <span className="text-[9px] font-black uppercase text-slate-400">Standard Plan</span>
                                                </div>
                                            )}

                                            <div className="w-10 h-10 rounded-2xl bg-brand text-white flex items-center justify-center shadow-lg shadow-brand/20 group-hover:scale-110 transition-transform">
                                                <ChevronRight size={20} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full py-32 text-center space-y-6 bg-surface-card dark:bg-dark-card rounded-[3rem] border-4 border-dashed border-surface-border dark:border-dark-border">
                            <div className="p-6 bg-surface-page dark:bg-dark-page rounded-full w-24 h-24 mx-auto flex items-center justify-center border-4 border-white dark:border-dark-border shadow-xl">
                                <Bike className="text-slate-200" size={40} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-ink-heading dark:text-white uppercase tracking-tighter">Inventory Empty</h3>
                                <p className="text-sm text-ink-muted font-medium max-w-xs mx-auto">No vehicles match your search criteria. Try a different query.</p>
                            </div>
                            <Button onClick={() => setSearchQuery('')} variant="outline" className="px-8 border-2">Clear All Filters</Button>
                        </div>
                    )}
                </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 pt-12">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="w-12 h-12 rounded-2xl bg-white dark:bg-dark-card border-2 border-surface-border dark:border-dark-border flex items-center justify-center disabled:opacity-30 hover:border-brand transition-all shadow-sm"
                    >
                        <ChevronRight size={20} className="rotate-180" />
                    </button>

                    <div className="flex items-center gap-2">
                        {Array.from({ length: pagination.totalPages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setPage(i + 1)}
                                className={cn(
                                    "w-12 h-12 rounded-2xl font-black text-sm transition-all shadow-sm",
                                    page === i + 1
                                        ? "bg-brand text-white shadow-brand/20 scale-110"
                                        : "bg-white dark:bg-dark-card border-2 border-surface-border dark:border-dark-border text-ink-muted hover:border-brand"
                                )}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>

                    <button
                        disabled={page === pagination.totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="w-12 h-12 rounded-2xl bg-white dark:bg-dark-card border-2 border-surface-border dark:border-dark-border flex items-center justify-center disabled:opacity-30 hover:border-brand transition-all shadow-sm"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default VehicleListPage;
