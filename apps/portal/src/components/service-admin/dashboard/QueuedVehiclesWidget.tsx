'use client';

import React from 'react';
import { useWorkshopStore } from '@/stores/service-admin/workshopStore';
import { Card, CardContent } from '@/components/service-admin/ui';
import { Car } from 'lucide-react';
import Link from 'next/link';
import { QueuedVehicle } from '@/hooks/service-admin/useDashboardStats';

interface QueuedVehiclesWidgetProps {
    apiData?: QueuedVehicle[];
}

const QueuedVehiclesWidget: React.FC<QueuedVehiclesWidgetProps> = ({ apiData }) => {
    // Use API data if provided, else fallback to mock store
    const storeJobCards = useWorkshopStore((s) => s.jobCards);

    const items = apiData && apiData.length > 0
        ? apiData.map(v => ({
            id: v.ticket_id,
            model: v.vehicle_model,
            number: v.service_number,
            status: v.status
        }))
        : storeJobCards
            .filter(job => job.status === 'received' || job.status === 'waiting-parts')
            .slice(0, 5)
            .map(job => ({
                id: job.id,
                model: job.vehicleModel,
                number: job.jobNo,
                status: job.status
            }));

    return (
        <Card className="rounded-[2rem] border border-surface-border dark:border-dark-border shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-ink-heading dark:text-white">In Queue</h3>
                    <Link href="/service-admin/workshop/job-cards" className="text-[10px] font-bold text-brand uppercase tracking-widest hover:underline">View All</Link>
                </div>
                {items.length === 0 ? (
                    <div className="text-center py-6">
                        <p className="text-xs text-ink-muted font-bold">No vehicles in queue.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {items.map(item => (
                            <div key={item.id} className="flex items-center justify-between group cursor-pointer hover:bg-surface-page dark:hover:bg-dark-page p-2 rounded-xl transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-100 dark:bg-dark-border rounded-xl flex items-center justify-center text-ink-muted">
                                        <Car size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-ink-heading dark:text-white">{item.model}</p>
                                        <p className="text-[10px] font-bold text-ink-muted uppercase">{item.number}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] bg-brand/10 text-brand px-2 py-1 rounded-lg font-black uppercase tracking-widest">{item.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default QueuedVehiclesWidget;
