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
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', damping: 15 }}
      className="relative group"
    >
      <div
        className={cn(
          "relative w-full text-left rounded-[2.5rem] border-2 p-7 transition-all duration-500 ease-out shadow-2xl cursor-grab active:cursor-grabbing overflow-hidden",
          config.bgClass,
          config.borderClass,
          isHighlighted ? "border-brand ring-4 ring-brand/10" : "border-opacity-30",
          ramp.status === 'active' ? "border-dashed" : "border-solid"
        )}
        onClick={(e) => {
           if ((e.target as HTMLElement).closest('.stop-propagation')) return;
           onClick(ramp);
        }}
      >
        {/* Glassmorphism Background */}
        <div className="absolute inset-0 bg-white/[0.01] dark:bg-black/20 backdrop-blur-sm pointer-events-none" />

        {/* Blueprint Style corner markings */}
        <div className="absolute top-5 left-5 w-3 h-3 border-t-2 border-l-2 border-current opacity-30" />
        <div className="absolute bottom-5 right-5 w-3 h-3 border-b-2 border-r-2 border-current opacity-30" />

        {/* Dynamic Scan Line for Active Bays */}
        {ramp.status === 'active' && (
          <motion.div
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            className="absolute left-0 right-0 h-px bg-emerald-500/30 blur-sm pointer-events-none z-10"
          />
        )}

        {/* Header Section */}
        <div className="flex items-start justify-between mb-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className={cn(
              "flex items-center justify-center h-14 w-14 rounded-2xl shadow-inner border-2 transition-all duration-700 group-hover:rotate-[360deg]",
              config.bgClass,
              config.borderClass
            )}>
              <span className="text-2xl">{config.icon}</span>
            </div>
            <div>
              <h3 className="text-[10px] font-black text-ink-muted uppercase tracking-[0.4em] mb-1 opacity-70">
                R A M P - {ramp.rampNumber}
              </h3>
              <p className={cn("text-xl font-black italic tracking-tighter leading-none uppercase", config.textClass)}>
                {config.labelBn}
              </p>
            </div>
          </div>

          <div className={cn(
            "p-2.5 rounded-full border-2 transition-all duration-500",
            config.bgClass, config.borderClass,
            ramp.status === 'active' && "animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          )}>
            <StatusIcon className={cn("h-5 w-5", config.textClass, ramp.status === 'active' && "animate-spin-slow")} />
          </div>
        </div>

        {/* Unit Data Container */}
        {ramp.vehicle ? (
          <div className="space-y-5 relative z-10">
            <div className="p-5 rounded-[2rem] bg-white/40 dark:bg-black/50 backdrop-blur-xl border border-white/10 shadow-2xl group-hover:bg-white/60 dark:group-hover:bg-black/80 transition-all duration-500">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-brand/10 flex items-center justify-center text-brand border border-brand/20">
                  <Car size={20} strokeWidth={2.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-black text-ink-heading dark:text-white tabular-nums tracking-tighter truncate uppercase italic">
                    {ramp.vehicle.vehicleRegNo}
                  </p>
                  <p className="text-[11px] font-bold text-ink-muted uppercase tracking-widest truncate opacity-60">
                    {ramp.vehicle.vehicleName}
                  </p>
                </div>
              </div>

              {/* Enhanced Tags Area */}
              <div className="flex flex-wrap gap-2 pt-1">
                {ramp.vehicle.priority !== 'normal' && (
                  <span className={cn(
                    "text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg",
                    PRIORITY_CONFIG[ramp.vehicle.priority].badge
                  )}>
                    {ramp.vehicle.priority}
                  </span>
                )}
                <span className="text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest bg-slate-100 dark:bg-white/10 text-ink-muted border border-current/10">
                  {ramp.vehicle.serviceType}
                </span>
              </div>
            </div>

            {/* Bottom Metrics */}
            <div className="flex items-center justify-between px-2">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black text-ink-muted uppercase tracking-[0.2em] opacity-50">Operation Time</span>
                <TimeElapsedBadge since={ramp.occupiedSince} />
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[9px] font-black text-ink-muted uppercase tracking-[0.2em] opacity-50 italic">Process Flow</span>
                <Link
                   href={`/service-admin/workshop/job-cards/${ramp.vehicle.jobCardId}`}
                   className="stop-propagation inline-flex items-center gap-1.5 text-[11px] font-black text-brand hover:text-brand-hover hover:scale-105 transition-all"
                   onClick={(e) => e.stopPropagation()}
                >
                   #{ramp.vehicle.jobCardNumber} <ExternalLink size={12} strokeWidth={3} />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-14 opacity-20 group-hover:opacity-100 transition-all duration-700">
            <div className="relative mb-4">
               <div className="w-20 h-20 rounded-full border-4 border-dashed border-current flex items-center justify-center animate-spin-slow opacity-20" />
               <CheckCircle2 size={40} className="text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-glow" />
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-ink-muted italic">Sector Available</p>
          </div>
        )}

        {/* Technician Status Area */}
        {ramp.technician ? (
          <div className="mt-8 pt-6 border-t-2 border-surface-border dark:border-white/5 relative z-10 flex items-center justify-between">
            <TechnicianAvatar technician={ramp.technician} size="md" />
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
          </div>
        ) : ramp.status !== 'free' && ramp.status !== 'maintenance' ? (
          <div className="mt-8 pt-6 border-t-2 border-dashed border-surface-border dark:border-white/5 flex items-center gap-3 text-amber-500 animate-pulse relative z-10">
            <div className="p-2 rounded-xl bg-amber-500/10"><AlertCircle size={18} /></div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Personnel Required</span>
          </div>
        ) : null}

        {/* Console Action Hint */}
        <div className="absolute top-1/2 -right-1 -translate-y-1/2 translate-x-8 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-700 ease-out z-20">
           <div className="bg-brand text-white p-2 rounded-2xl shadow-[0_10px_30px_rgba(199,91,18,0.5)] border-2 border-white/20">
              <ChevronRight size={20} strokeWidth={4} />
           </div>
        </div>
      </div>
    </motion.div>
  );
});
RampCard.displayName = 'RampCard';
