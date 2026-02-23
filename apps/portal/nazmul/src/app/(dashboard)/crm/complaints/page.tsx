'use client';

import React, { useState } from 'react';
import {
    MessageSquare,
    Search,
    AlertCircle,
    CheckCircle2,
    Calendar,
    Bike,
    Clock
} from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import { Card, CardContent } from '@/components/ui';
import { useCRMStore } from '@/stores/crmStore';
import { cn } from '@/lib/utils'; // Assuming utils exists

const ComplaintsPage = () => {
    const { complaints } = useCRMStore();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredComplaints = complaints.filter(c =>
        c.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6 lg:p-8 space-y-6 animate-fade">
            <Breadcrumb items={[{ label: 'CRM', href: '/crm' }, { label: 'Complaints' }]} />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-ink-heading dark:text-white">Customer Complaints</h1>
                    <p className="text-sm text-ink-muted">Track and resolve issues reported by clients.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredComplaints.map((complaint) => (
                    <Card key={complaint.id} className="hover:border-danger transition-all group">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center text-white",
                                        complaint.status === 'open' ? "bg-danger" : "bg-success"
                                    )}>
                                        <AlertCircle size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-ink-heading dark:text-white">Ticket #{complaint.id}</h3>
                                        <p className="text-xs text-ink-muted">{complaint.date}</p>
                                    </div>
                                </div>
                                <span className={cn(
                                    "px-2.5 py-1 rounded-full text-[10px] font-black uppercase",
                                    complaint.status === 'open' ? "bg-danger-bg text-danger" : "bg-success-bg text-success"
                                )}>
                                    {complaint.status}
                                </span>
                            </div>

                            <div className="bg-surface-page dark:bg-dark-page/50 p-4 rounded-xl border border-surface-border dark:border-dark-border/50">
                                <p className="text-sm font-medium italic text-ink-heading dark:text-white">"{complaint.description}"</p>
                            </div>

                            <div className="flex items-center justify-between text-xs text-ink-muted pt-2">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1 font-bold">
                                        <User size={14} /> {complaint.customerId}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Bike size={14} /> {complaint.vehicleId}
                                    </span>
                                </div>
                                {complaint.jobCardId && (
                                    <span className="bg-brand-soft text-brand px-2 py-0.5 rounded font-bold">
                                        Job: {complaint.jobCardId}
                                    </span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};
import { User } from 'lucide-react';

export default ComplaintsPage;
