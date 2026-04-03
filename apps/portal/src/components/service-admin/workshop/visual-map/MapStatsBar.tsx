// apps/portal/src/components/service-admin/workshop/visual-map/MapStatsBar.tsx

'use client';

import { memo } from 'react';
import { MapStats } from '@/types/service-admin/visualMap';
import {
  LayoutGrid,
  Wrench,
  CheckCircle2,
  Clock,
  AlertCircle,
  Coffee,
  Users,
  Timer,
  CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MapStatsBarProps {
  stats: MapStats;
}

export const MapStatsBar = memo(function MapStatsBar({ stats }: MapStatsBarProps) {
  const items = [
    {
      label: 'TOTAL BAYS',
      value: stats.totalRamps,
      icon: LayoutGrid,
      color: 'text-slate-600 dark:text-slate-300',
      bg: 'bg-slate-100 dark:bg-white/5',
    },
    {
      label: 'ACTIVE OPS',
      value: stats.activeRamps,
      icon: Wrench,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'AVAILABILITY',
      value: stats.freeRamps,
      icon: CheckCircle2,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'BOOKED',
      value: stats.bookedRamps,
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'QC QUEUE',
      value: stats.qcPendingRamps,
      icon: AlertCircle,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      label: 'FINANCE QUEUE',
      value: stats.financePendingCount,
      icon: CreditCard,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'STAFF RATIO',
      value: `${stats.workingTechnicians}/${stats.totalTechnicians}`,
      icon: Users,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-500/10',
    },
    {
      label: 'AVG CYCLE',
      value: stats.avgOccupancyMinutes > 0 ? `${stats.avgOccupancyMinutes}m` : '0m',
      icon: Timer,
      color: 'text-brand',
      bg: 'bg-brand/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            "p-4 rounded-[1.5rem] border border-surface-border dark:border-white/5 shadow-soft transition-all hover:scale-105 duration-300",
            item.bg
          )}
        >
          <div className="flex items-center gap-2 mb-2">
             <item.icon className={cn("h-3.5 w-3.5", item.color)} strokeWidth={3} />
             <p className="text-[8px] font-black text-ink-muted uppercase tracking-[0.2em]">
               {item.label}
             </p>
          </div>
          <p className={cn("text-2xl font-black tabular-nums tracking-tighter", item.color)}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
});
MapStatsBar.displayName = 'MapStatsBar';
