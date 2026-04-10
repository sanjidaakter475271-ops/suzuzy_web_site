"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
    Search,
    UserPlus,
    Phone,
    Mail,
    MapPin,
    Bike,
    ChevronRight,
    ArrowUpDown,
    Filter,
    Loader2
} from 'lucide-react';
import Breadcrumb from '@/components/service-admin/Breadcrumb';
import { Card, CardContent, Button } from '@/components/service-admin/ui';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface CustomerListItem {
    id: string;
    name: string;
    phone: string;
    email?: string;
    address: string;
    type: string;
    vehicles: string[];
    createdAt: string;
}

const CustomerListPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);

    const { data: result, isLoading, error } = useQuery({
        queryKey: ['crm-customers', searchQuery, page],
        queryFn: async () => {
            const res = await axios.get('/api/v1/crm/customers', {
                params: { query: searchQuery, page, limit: 12 }
            });
            return res.data;
        },
        // Debounce search a bit
        placeholderData: (previousData) => previousData,
    });

    const customers = result?.data || [];
    const pagination = result?.pagination;

    return (
        <div className="p-6 lg:p-8 space-y-6 animate-fade">
            <Breadcrumb items={[{ label: 'CRM', href: '/service-admin/crm' }, { label: 'Customers' }]} />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-ink-heading dark:text-white">Customer Database</h1>
                    <p className="text-sm text-ink-muted">View and manage all registered clients.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2">
                        <Filter size={18} />
                        Filter
                    </Button>
                    <Button className="gap-2">
                        <UserPlus size={20} />
                        Add Customer
                    </Button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full max-w-lg">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={18} />
                    <input
                        type="text"
                        placeholder="Search by Name, Phone, Engine No, Chassis No..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setPage(1);
                        }}
                        className="w-full bg-surface-card dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-brand transition-all text-sm shadow-sm"
                    />
                    {isLoading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 size={16} className="animate-spin text-brand" />
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-ink-muted">
                    <ArrowUpDown size={14} />
                    Sort: Recently Added
                </div>
            </div>

            {error ? (
                <div className="py-20 text-center">
                    <p className="text-danger font-bold">Failed to load customers. Please try again.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {isLoading && !customers.length ? (
                        Array.from({ length: 8 }).map((_, idx) => (
                            <Card key={idx} className="animate-pulse">
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800" />
                                        <div className="space-y-2">
                                            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24" />
                                            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-16" />
                                        </div>
                                    </div>
                                    <div className="space-y-2 pt-2">
                                        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                                        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                                    </div>
                                    <div className="pt-4 border-t border-surface-border dark:border-dark-border/50 flex justify-between">
                                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20" />
                                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-12" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : customers.length > 0 ? (
                        customers.map((customer: CustomerListItem) => (
                            <Link href={`/service-admin/crm/customers/${customer.id}`} key={customer.id}>
                                <Card className="hover:border-brand transition-all group cursor-pointer h-full border-2 border-transparent">
                                    <CardContent className="p-6 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-2xl bg-brand-soft border-2 border-white dark:border-dark-border flex items-center justify-center text-lg font-black text-brand uppercase group-hover:bg-brand group-hover:text-white transition-all">
                                                    {customer.name.substring(0, 2)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-ink-heading dark:text-white group-hover:text-brand transition-colors line-clamp-1">{customer.name}</h3>
                                                    <p className="text-[10px] font-black uppercase text-ink-muted bg-surface-page dark:bg-dark-page px-2 py-0.5 rounded-md inline-block mt-1">
                                                        {customer.type}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-sm text-ink-muted">
                                            <div className="flex items-center gap-2">
                                                <Phone size={14} className="text-brand" />
                                                <span className="font-bold text-ink-heading dark:text-white">{customer.phone}</span>
                                            </div>
                                            {customer.email && (
                                                <div className="flex items-center gap-2">
                                                    <Mail size={14} />
                                                    <span className="truncate">{customer.email}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <MapPin size={14} />
                                                <span className="truncate text-xs">{customer.address}</span>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-surface-border dark:border-dark-border/50 flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-ink-heading dark:text-white">
                                                <Bike size={14} className="text-brand" />
                                                {customer.vehicles.length} {customer.vehicles.length === 1 ? 'Vehicle' : 'Vehicles'}
                                            </div>
                                            <div className="text-brand text-[10px] font-black uppercase tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-all">
                                                View Profile
                                                <ChevronRight size={14} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center space-y-4 bg-surface-card dark:bg-dark-card rounded-3xl border border-dashed border-surface-border dark:border-dark-border">
                            <div className="p-4 bg-surface-page dark:bg-dark-page rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                                <Search className="text-ink-muted" size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-ink-heading dark:text-white">No customers found</h3>
                                <p className="text-sm text-ink-muted">Try adjusting your search query or add a new customer.</p>
                            </div>
                            <Button className="gap-2">
                                <UserPlus size={18} />
                                Add Your First Customer
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-8">
                    <Button
                        variant="outline"
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="px-3"
                    >
                        Previous
                    </Button>
                    <div className="flex items-center gap-1">
                        {Array.from({ length: pagination.totalPages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setPage(i + 1)}
                                className={cn(
                                    "w-10 h-10 rounded-xl font-bold text-sm transition-all",
                                    page === i + 1
                                        ? "bg-brand text-white shadow-soft"
                                        : "bg-surface-card dark:bg-dark-card border border-surface-border dark:border-dark-border text-ink-muted hover:bg-surface-hover"
                                )}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <Button
                        variant="outline"
                        disabled={page === pagination.totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="px-3"
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
};

export default CustomerListPage;
