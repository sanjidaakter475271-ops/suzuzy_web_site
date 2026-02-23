'use client';

import React from 'react';
import { useWorkshopStore } from '@/stores/workshopStore';
import { Card, CardContent } from '@/components/ui';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const ActiveRampsWidget = () => {
    const { ramps } = useWorkshopStore();

    return (
        <Card className="rounded-[2rem] border border-surface-border dark:border-dark-border shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-ink-heading dark:text-white">Live Bays</h3>
                    <Link href="/workshop/ramp-view" className="text-[10px] font-bold text-brand uppercase tracking-widest hover:underline">View All</Link>
                </div>
                <div className="grid grid-cols-5 gap-2">
                    {ramps.slice(0, 10).map((ramp) => (
                        <div
                            key={ramp.id}
                            className={cn(
                                "aspect-square rounded-xl flex items-center justify-center text-[10px] font-black transition-all",
                                ramp.status === 'available' ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" :
                                    ramp.status === 'occupied' ? "bg-red-500/10 text-red-600 border border-red-500/20 animate-pulse" :
                                        "bg-slate-100 text-slate-400 border border-slate-200"
                            )}
                            title={ramp.name}
                        >
                            {ramp.status === 'occupied' ? ramp.vehicleRegNo?.split(' ').pop() || 'BUSY' : ramp.id.replace('R', '')}
                        </div>
                    ))}
                </div>
                <div className="mt-4 flex gap-4 text-[10px] font-bold text-ink-muted">
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Available</span>
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div> Busy</span>
                </div>
            </CardContent>
        </Card>
    );
};

export default ActiveRampsWidget;
