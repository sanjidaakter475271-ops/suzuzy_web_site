// apps/portal/src/components/service-admin/workshop/visual-map/RampDetailModal.tsx

'use client';

import { RampData } from '@/types/service-admin/visualMap';
import { RAMP_STATUS_CONFIG } from '@/constants/service-admin/mapConfig';
import { TechnicianAvatar } from './TechnicianAvatar';
import { TimeElapsedBadge } from './TimeElapsedBadge';
import {
  X,
  Car,
  User,
  Phone,
  Wrench,
  Clock,
  ClipboardList,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface RampDetailModalProps {
  ramp: RampData | null;
  onClose: () => void;
}

export function RampDetailModal({ ramp, onClose }: RampDetailModalProps) {
  if (!ramp) return null;

  const config = RAMP_STATUS_CONFIG[ramp.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-xl bg-white dark:bg-[#0A0A0B] rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.5)] border-2 border-surface-border dark:border-white/5 overflow-hidden"
      >
        {/* Progress Header */}
        <div className={cn("h-1.5 w-full bg-slate-100 dark:bg-white/5", config.bgClass)}>
           <motion.div
             initial={{ width: 0 }}
             animate={{ width: '100%' }}
             transition={{ duration: 0.8 }}
             className={cn("h-full", config.pulseClass === 'animate-pulse' ? "bg-emerald-500" : "bg-brand")}
           />
        </div>

        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className={cn(
                "flex items-center justify-center h-16 w-16 rounded-[1.5rem] shadow-xl border-2",
                config.bgClass,
                config.borderClass
              )}>
                <span className="text-3xl">{config.icon}</span>
              </div>
              <div>
                <h2 className="text-2xl font-black text-ink-heading dark:text-white uppercase tracking-tight italic">
                  {ramp.rampName}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                    config.bgClass, config.textClass, config.borderClass
                  )}>
                    {config.labelBn}
                  </span>
                  <div className="w-1 h-1 rounded-full bg-slate-300" />
                  <TimeElapsedBadge since={ramp.occupiedSince} />
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-3 rounded-2xl bg-surface-page dark:bg-white/5 border border-surface-border dark:border-white/10 text-ink-muted hover:text-brand transition-all active:scale-95"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
            {/* Vehicle Data Node */}
            {ramp.vehicle && (
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                   <div className="p-2 rounded-lg bg-brand/10 text-brand"><Car size={16} /></div>
                   <h3 className="text-[10px] font-black text-ink-muted uppercase tracking-[0.3em]">Vehicle Identification</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <InfoBlock label="Unit Reg" value={ramp.vehicle.vehicleRegNo} icon={<ShieldCheck className="h-3 w-3" />} primary />
                  <InfoBlock label="Model" value={ramp.vehicle.vehicleName} icon={<Zap className="h-3 w-3" />} />
                  <InfoBlock label="Operator" value={ramp.vehicle.customerName} icon={<User className="h-3 w-3" />} />
                  <InfoBlock label="Contact" value={ramp.vehicle.customerPhone || 'N/A'} icon={<Phone className="h-3 w-3" />} />
                </div>

                {ramp.vehicle.services.length > 0 && (
                  <div className="p-5 rounded-[2rem] bg-slate-50 dark:bg-white/[0.02] border border-surface-border dark:border-white/5">
                    <p className="text-[9px] font-black text-ink-muted uppercase tracking-widest mb-4">Operations Sequence</p>
                    <div className="flex flex-wrap gap-2">
                      {ramp.vehicle.services.map((service, idx) => (
                        <span key={idx} className="px-3 py-1.5 rounded-xl bg-white dark:bg-black/40 border border-surface-border dark:border-white/10 text-[10px] font-bold text-ink-body dark:text-slate-300">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Personnel Assignment */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500"><User size={16} /></div>
                 <h3 className="text-[10px] font-black text-ink-muted uppercase tracking-[0.3em]">Assigned Personnel</h3>
              </div>

              {ramp.technician ? (
                <div className="p-6 rounded-[2rem] bg-emerald-500/[0.03] border-2 border-emerald-500/10 flex items-center justify-between">
                  <TechnicianAvatar technician={ramp.technician} size="lg" />
                  <div className="text-right">
                     <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Active Status</p>
                     <p className="text-xs font-bold text-ink-muted mt-1 uppercase">Ready for Orders</p>
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-[2rem] border-2 border-dashed border-amber-500/20 bg-amber-500/[0.02] text-center">
                  <p className="text-xs font-black text-amber-600 uppercase tracking-widest">
                    ⚠️ System Alert: No Agent Assigned
                  </p>
                </div>
              )}
            </section>

            {/* Stage Transition Control */}
            <div className="pt-4 border-t border-surface-border dark:border-white/5 flex gap-4">
               {ramp.vehicle && (
                 <Link
                   href={`/service-admin/workshop/job-cards/${ramp.vehicle.jobCardId}`}
                   className="flex-1 h-14 bg-brand text-white rounded-2xl flex items-center justify-center text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-brand/20 hover:scale-105 active:scale-95 transition-all gap-3"
                 >
                   Open Case File <ExternalLink size={16} />
                 </Link>
               )}
               <button
                 onClick={onClose}
                 className="flex-1 h-14 bg-slate-100 dark:bg-white/5 text-ink-muted rounded-2xl flex items-center justify-center text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
               >
                 Close Monitor
               </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function InfoBlock({ label, value, icon, primary }: { label: string; value: string; icon: React.ReactNode; primary?: boolean }) {
  return (
    <div className={cn(
      "p-4 rounded-2xl border transition-all",
      primary ? "bg-brand/5 border-brand/10" : "bg-white dark:bg-black/20 border-surface-border dark:border-white/5"
    )}>
      <div className="flex items-center gap-1.5 text-ink-muted mb-2">
        {icon}
        <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <p className={cn(
        "text-sm font-black italic uppercase tracking-tight truncate",
        primary ? "text-brand" : "text-ink-heading dark:text-white"
      )}>
        {value}
      </p>
    </div>
  );
}
