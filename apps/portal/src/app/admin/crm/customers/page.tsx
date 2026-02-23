'use client';

import React, { useState } from 'react';
import {
    Search,
    UserPlus,
    Phone,
    Mail,
    MapPin,
    Bike,
    ChevronRight
} from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import { Card, CardContent } from '@/components/ui';
import { useCRMStore } from '@/stores/crmStore';
import { cn } from '@/lib/utils'; // Assuming utils exists

const CustomerListPage = () => {
    const { customers } = useCRMStore();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery)
    );

    return (
        <div className="p-6 lg:p-8 space-y-6 animate-fade">
            <Breadcrumb items={[{ label: 'CRM', href: '/crm' }, { label: 'Customers' }]} />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-ink-heading dark:text-white">Customer Database</h1>
                    <p className="text-sm text-ink-muted">View and manage all registered clients.</p>
                </div>
                <button className="bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-brand/20 active:scale-95">
                    <UserPlus size={20} />
                    Add Customer
                </button>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={18} />
                <input
                    type="text"
                    placeholder="Search by Name or Phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-surface-card dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-brand transition-colors text-sm"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCustomers.map((customer) => (
                    <Card key={customer.id} className="hover:border-brand transition-all group cursor-pointer">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-surface-page dark:bg-dark-page border-2 border-surface-border dark:border-dark-border flex items-center justify-center text-lg font-black text-ink-muted uppercase">
                                        {customer.name.substring(0, 2)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-ink-heading dark:text-white group-hover:text-brand transition-colors">{customer.name}</h3>
                                        <p className="text-[10px] font-black uppercase text-ink-muted bg-surface-page dark:bg-dark-page px-2 py-0.5 rounded-md inline-block mt-1">
                                            {customer.type}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-ink-muted">
                                <div className="flex items-center gap-2">
                                    <Phone size={14} className="text-brand" />
                                    {customer.phone}
                                </div>
                                {customer.email && (
                                    <div className="flex items-center gap-2">
                                        <Mail size={14} />
                                        {customer.email}
                                    </div>
                                )}
                                {customer.address && (
                                    <div className="flex items-center gap-2">
                                        <MapPin size={14} />
                                        <span className="truncate">{customer.address}</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-surface-border dark:border-dark-border/50 flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-ink-heading dark:text-white">
                                    <Bike size={14} className="text-brand" />
                                    {customer.vehicles.length} Vehicles
                                </div>
                                <button className="text-brand text-xs font-black uppercase tracking-wider flex items-center gap-1 hover:gap-1.5 transition-all">
                                    Profile
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default CustomerListPage;
