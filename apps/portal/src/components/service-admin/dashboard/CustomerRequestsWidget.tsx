'use client';

import React, { useEffect, useState } from 'react';
import { useCustomerStore } from '@/stores/service-admin/customerStore';
import { Card, CardContent, Button } from '@/components/service-admin/ui';
import { FileText, CheckCircle2, X } from 'lucide-react';
import { CustomerRequest } from '@/hooks/service-admin/useDashboardStats';

interface CustomerRequestsWidgetProps {
    apiData?: CustomerRequest[];
}

const CustomerRequestsWidget: React.FC<CustomerRequestsWidgetProps> = ({ apiData }) => {
    const { serviceRequests } = useCustomerStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);
    if (!mounted) return null; // Hydration fix

    // Normalize to common shape
    const requests = apiData && apiData.length > 0
        ? apiData.map(req => ({
            id: req.id,
            label: req.service_number,
            description: req.service_description,
            date: req.created_at.split('T')[0],
            customerName: req.customer_name
        }))
        : serviceRequests
            .filter(req => req.status === 'pending')
            .map(req => ({
                id: req.id,
                label: `REQ #${req.id}`,
                description: req.complaint,
                date: req.date.split('T')[0],
                customerName: ''
            }));

    return (
        <Card className="rounded-[2rem] border border-surface-border dark:border-dark-border shadow-sm hover:shadow-md transition-all h-full flex flex-col">
            <CardContent className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-ink-heading dark:text-white flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-brand animate-pulse"></div> Customer Requests
                    </h3>
                    <span className="bg-brand text-white px-2 py-0.5 rounded-full text-[10px] font-black">{requests.length}</span>
                </div>

                {requests.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-surface-page dark:bg-dark-page rounded-xl border-dashed border-2 border-surface-border dark:border-dark-border">
                        <FileText className="text-ink-muted/30 mb-2" size={32} />
                        <p className="text-xs font-bold text-ink-muted">No pending requests.</p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                        {requests.map(req => (
                            <div key={req.id} className="bg-surface-page dark:bg-dark-page p-3 rounded-xl border border-surface-border dark:border-dark-border group hover:border-brand/30 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-xs font-black text-ink-heading dark:text-white uppercase tracking-tight">{req.label}</h4>
                                    <span className="text-[10px] text-ink-muted font-mono">{req.date}</span>
                                </div>
                                <p className="text-xs text-ink-muted line-clamp-2 mb-3 font-medium">{req.description}</p>
                                <div className="flex gap-2">
                                    <Button variant="ghost" className="flex-1 h-8 px-3 text-[10px] bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 uppercase font-black tracking-widest gap-1 rounded-lg">
                                        <CheckCircle2 size={12} /> Accept
                                    </Button>
                                    <Button variant="ghost" className="w-8 h-8 p-0 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg flex items-center justify-center">
                                        <X size={14} />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default CustomerRequestsWidget;
