// apps/portal/src/components/service-admin/workshop/visual-map/RampCard.tsx

'use client';

import { memo } from 'react';
import { RampData } from '@/types/service-admin/visualMap';
import { RAMP_STATUS_CONFIG, PRIORITY_CONFIG } from '@/constants/service-admin/mapConfig';
import { TechnicianAvatar } from './TechnicianAvatar';
import { TimeElapsedBadge } from './TimeElapsedBadge';
import {
  Car,
  Wrench,
  AlertCircle,
  CheckCircle2,
  PauseCircle,
  XCircle,
  Timer,
  ChevronRight,
  ShieldAlert,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface RampCardProps {
  ramp: RampData;
  onClick: (ramp: RampData) => void;
  isHighlighted?: boolean;
}

const statusIcons = {
  active: Wrench,
  free: CheckCircle2,
  booked: Timer,
  qc_pending: ShieldAlert,
  on_break: PauseCircle,
  maintenance: XCircle,
};

export const RampCard = memo(function RampCard({ ramp, onClick, isHighlighted }: RampCardProps) {
  const config = RAMP_STATUS_CONFIG[ramp.status];
  const StatusIcon = statusIcons[ramp.status];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="relative group"
    >
      <div
        className={cn(
          "relative w-full text-left rounded-[2.5rem] border-2 p-6 transition-all duration-500 ease-out shadow-sm cursor-grab active:cursor-grabbing",
          config.bgClass,
          config.borderClass,
          isHighlighted ? "shadow-[0_20px_50px_rgba(199,91,18,0.2)] border-brand ring-2 ring-brand/10" : "",
          ramp.status === 'active' ? "border-dashed" : ""
        )}
        onClick={(e) => {
           // Only trigger card click if not clicking on nested buttons/links
           if ((e.target as HTMLElement).closest('.stop-propagation')) return;
           onClick(ramp);
        }}
      >
        {/* Blueprint Style Decorations */}
        {ramp.status === 'active' && (
          <div className="absolute inset-0 rounded-[2.5rem] bg-emerald-400/[0.03] animate-pulse pointer-events-none" />
        )}
        <div className="absolute top-4 left-4 w-2 h-2 border-t-2 border-l-2 border-current opacity-20" />
        <div className="absolute bottom-4 right-4 w-2 h-2 border-b-2 border-r-2 border-current opacity-20" />

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex items-center justify-center h-12 w-12 rounded-2xl shadow-inner border transition-transform duration-500 group-hover:rotate-12",
              config.bgClass,
              config.borderClass
            )}>
              <span className="text-xl">{config.icon}</span>
            </div>
            <div>
              <h3 className="text-xs font-black text-ink-muted uppercase tracking-[0.2em] mb-0.5">
                {ramp.rampName}
              </h3>
              <p className={cn("text-base font-black italic tracking-tight leading-none uppercase", config.textClass)}>
                {config.labelBn}
              </p>
            </div>
          </div>

          <div className={cn("p-2 rounded-xl border border-current/10", config.bgClass)}>
            <StatusIcon className={cn("h-4 w-4", config.textClass, ramp.status === 'active' && "animate-spin-slow")} />
          </div>
        </div>

        {/* Body Content */}
        {ramp.vehicle ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/10 shadow-inner group-hover:bg-white/60 dark:group-hover:bg-black/60 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                  <Car size={16} strokeWidth={3} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-ink-heading dark:text-white tabular-nums tracking-tighter truncate uppercase italic">
                    {ramp.vehicle.vehicleRegNo}
                  </p>
                  <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest truncate">
                    {ramp.vehicle.vehicleName}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {ramp.vehicle.priority !== 'normal' && (
                  <span className={cn("text-[8px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest", PRIORITY_CONFIG[ramp.vehicle.priority].badge)}>
                    {ramp.vehicle.priority}
                  </span>
                )}
                <span className="text-[8px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest bg-slate-100 dark:bg-white/10 text-ink-muted">
                  {ramp.vehicle.serviceType}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-ink-muted uppercase tracking-widest mb-1">Duration</span>
                <TimeElapsedBadge since={ramp.occupiedSince} />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[8px] font-black text-ink-muted uppercase tracking-widest mb-1 italic">Mission Case</span>
                <Link
                   href={`/service-admin/workshop/job-cards/${ramp.vehicle.jobCardId}`}
                   className="stop-propagation inline-flex items-center gap-1 text-[10px] font-black text-brand hover:underline"
                   onClick={(e) => e.stopPropagation()}
                >
                   #{ramp.vehicle.jobCardNumber} <ExternalLink size={10} />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 opacity-30 group-hover:opacity-100 transition-opacity">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-current flex items-center justify-center mb-2">
               <CheckCircle2 size={32} className="text-blue-500" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ink-muted">Bay Available</p>
          </div>
        )}

        {/* Technician Footer */}
        {ramp.technician ? (
          <div className="mt-6 pt-5 border-t border-surface-border dark:border-white/5">
            <TechnicianAvatar technician={ramp.technician} size="sm" />
          </div>
        ) : ramp.status !== 'free' && ramp.status !== 'maintenance' ? (
          <div className="mt-6 pt-5 border-t border-surface-border dark:border-white/5 flex items-center gap-2 text-amber-500 animate-pulse">
            <AlertCircle size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest">Awaiting Staff</span>
          </div>
        ) : null}

        {/* Interaction hint */}
        <div className="absolute top-1/2 -right-2 -translate-y-1/2 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
           <div className="bg-brand text-white p-1.5 rounded-full shadow-lg">
              <ChevronRight size={16} strokeWidth={4} />
           </div>
        </div>
      </div>
    </motion.div>
  );
});
RampCard.displayName = 'RampCard';
