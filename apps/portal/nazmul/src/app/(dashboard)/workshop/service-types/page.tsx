'use client';

import React, { useState } from 'react';
import {
    Wrench,
    Plus,
    Search,
    Edit2,
    Trash2,
    Clock,
    DollarSign,
    ChevronRight,
    Play
} from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import { Card, CardContent } from '@/components/ui';
import { useWorkshopStore } from '@/stores/workshopStore';
import { cn } from '@/lib/utils';

const ServiceTypesPage = () => {
    const { serviceTypes } = useWorkshopStore();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTypes = serviceTypes.filter(type =>
        type.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6 lg:p-8 space-y-6 animate-fade">
            <Breadcrumb items={[{ label: 'Workshop', href: '/workshop' }, { label: 'Service Types' }]} />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-ink-heading dark:text-white">Service Types & Labor Rates</h1>
                    <p className="text-sm text-ink-muted">Define standard service tasks and their base labor costs.</p>
                </div>
                <button className="bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-brand/20 active:scale-95">
                    <Plus size={20} />
                    Add Service Type
                </button>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={18} />
                <input
                    type="text"
                    placeholder="Search service name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-surface-card dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-brand transition-colors text-sm"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTypes.map((type) => (
                    <Card key={type.id} className="hover:border-brand transition-all group overflow-hidden">
                        <CardContent className="p-0">
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="w-12 h-12 rounded-2xl bg-brand-soft text-brand flex items-center justify-center shadow-inner">
                                        <Wrench size={24} />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button className="p-2 hover:bg-surface-page dark:hover:bg-dark-page rounded-lg text-ink-muted hover:text-brand transition-all">
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="p-2 hover:bg-danger-bg rounded-lg text-ink-muted hover:text-danger transition-all">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-bold text-lg text-ink-heading dark:text-white group-hover:text-brand transition-colors">{type.name}</h3>
                                    <p className="text-xs text-ink-muted mt-1 uppercase font-black tracking-widest">{type.id}</p>
                                </div>

                                <div className="flex items-center gap-6 pt-2">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-ink-muted">EST. Time</p>
                                        <div className="flex items-center gap-1.5 text-ink-heading dark:text-white font-bold text-sm">
                                            <Clock size={14} className="text-brand" />
                                            {type.estimatedTime}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-ink-muted">Labor Rate</p>
                                        <div className="flex items-center gap-1.5 text-success font-black text-lg">
                                            <DollarSign size={16} />
                                            {type.laborRate}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-surface-page dark:bg-dark-page/50 px-6 py-3 flex items-center justify-between border-t border-surface-border dark:border-dark-border/50">
                                <span className="text-[10px] font-black uppercase text-ink-muted">42 Jobs completed this month</span>
                                <button className="text-brand text-xs font-black uppercase tracking-wider flex items-center gap-1 hover:gap-1.5 transition-all">
                                    History
                                    <Play size={10} fill="currentColor" />
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ServiceTypesPage;
