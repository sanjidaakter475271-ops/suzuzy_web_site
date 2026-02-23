'use client';

import React, { useState } from 'react';
import {
    Search,
    Bike,
    User,
    Calendar,
    Gauge,
    ChevronRight,
    Wrench
} from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import { Card, CardContent } from '@/components/ui';
import { useCRMStore } from '@/stores/crmStore';
import { cn } from '@/lib/utils';

const VehicleListPage = () => {
    const { vehicles, customers } = useCRMStore();
    const [searchQuery, setSearchQuery] = useState('');

    const getOwnerName = (id: string) => customers.find(c => c.id === id)?.name || 'Unknown';

    const filteredVehicles = vehicles.filter(v =>
        v.regNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.model.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6 lg:p-8 space-y-6 animate-fade">
            <Breadcrumb items={[{ label: 'CRM', href: '/crm' }, { label: 'Vehicles' }]} />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-ink-heading dark:text-white">Registered Vehicles</h1>
                    <p className="text-sm text-ink-muted">Track service history and ownership details.</p>
                </div>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={18} />
                <input
                    type="text"
                    placeholder="Search Reg No or Model..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-surface-card dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-brand transition-colors text-sm"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredVehicles.map((vehicle) => (
                    <Card key={vehicle.id} className="hover:border-brand transition-all group cursor-pointer">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-brand tracking-widest">{vehicle.brand}</p>
                                    <h3 className="text-lg font-black text-ink-heading dark:text-white group-hover:text-brand transition-colors">{vehicle.model}</h3>
                                </div>
                                <div className="bg-surface-page dark:bg-dark-page px-2 py-1 rounded text-[10px] font-bold text-ink-muted border border-surface-border dark:border-dark-border">
                                    {vehicle.regNo}
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-ink-muted">
                                <div className="flex items-center gap-2">
                                    <User size={14} className="text-brand" />
                                    Owner: <span className="text-ink-heading dark:text-white font-bold">{getOwnerName(vehicle.ownerId)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Gauge size={14} />
                                    Mileage: {vehicle.mileage}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} />
                                    Last Service: {vehicle.lastServiceDate}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-surface-border dark:border-dark-border/50 flex items-center justify-between">
                                <button className="text-xs font-bold text-ink-muted hover:text-brand flex items-center gap-1.5 transition-colors">
                                    <Wrench size={14} />
                                    Service History
                                </button>
                                <ChevronRight size={16} className="text-ink-muted group-hover:translate-x-1 transition-transform" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default VehicleListPage;
