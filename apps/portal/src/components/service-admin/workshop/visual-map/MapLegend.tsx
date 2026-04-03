// apps/portal/src/components/service-admin/workshop/visual-map/MapLegend.tsx

'use client';

import { RAMP_STATUS_CONFIG } from '@/constants/service-admin/mapConfig';
import type { RampStatus } from '@/types/service-admin/visualMap';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface MapLegendProps {
  filter: RampStatus | 'all';
  onFilterChange: (status: RampStatus | 'all') => void;
}

export function MapLegend({ filter, onFilterChange }: MapLegendProps) {
  const statuses = Object.entries(RAMP_STATUS_CONFIG) as [RampStatus, typeof RAMP_STATUS_CONFIG[RampStatus]][];

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* All filter */}
      <button
        onClick={() => onFilterChange('all')}
        className={cn(
          "inline-flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 border-2",
          filter === 'all'
            ? "bg-brand border-brand text-white shadow-lg shadow-brand/20 scale-105"
            : "bg-white dark:bg-white/5 text-ink-muted border-surface-border dark:border-white/10 hover:border-brand/40"
        )}
      >
        <div className={cn("w-1.5 h-1.5 rounded-full", filter === 'all' ? "bg-white animate-pulse" : "bg-slate-300")} />
        All Units
      </button>

      {statuses.map(([status, cfg]) => (
        <button
          key={status}
          onClick={() => onFilterChange(status)}
          className={cn(
            "inline-flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 border-2",
            filter === status
              ? `${cfg.bgClass} ${cfg.textClass} ${cfg.borderClass} shadow-lg scale-105`
              : "bg-white dark:bg-white/5 text-ink-muted border-surface-border dark:border-white/10 hover:border-brand/40"
          )}
        >
          <span className="text-sm leading-none">{cfg.icon}</span>
          <span>{cfg.label}</span>
          {filter === status && (
             <motion.div
               layoutId="active-dot"
               className={cn("w-1.5 h-1.5 rounded-full bg-current", cfg.pulseClass)}
             />
          )}
        </button>
      ))}
    </div>
  );
}
