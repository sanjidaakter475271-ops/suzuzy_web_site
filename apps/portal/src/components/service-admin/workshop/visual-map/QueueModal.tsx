// apps/portal/src/components/service-admin/workshop/visual-map/QueueModal.tsx

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Car, ChevronRight, ClipboardCheck, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { VehicleOnRamp } from '@/types/service-admin/visualMap';

interface QueueModalProps {
  activeQueue: {
    id: string;
    label: string;
    color: string;
    items: VehicleOnRamp[]
  } | null;
  onClose: () => void;
  onQuickStatusUpdate: (jobId: string, vehicleReg: string, newStatus: any) => Promise<void>;
}

export function QueueModal({ activeQueue, onClose, onQuickStatusUpdate }: QueueModalProps) {
  return (
    <AnimatePresence>
      {activeQueue && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-white dark:bg-[#0A0A0B] rounded-[3rem] shadow-2xl border-2 border-surface-border dark:border-white/5 overflow-hidden"
          >
            <div className={cn("p-8 border-b-4", activeQueue.color === 'purple' ? "bg-purple-500/10 border-purple-500" : "bg-amber-500/10 border-amber-500")}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn("p-3 rounded-2xl", activeQueue.color === 'purple' ? "bg-purple-500 text-white" : "bg-amber-500 text-white")}>
                    {activeQueue.color === 'purple' ? <ClipboardCheck size={24} /> : <CreditCard size={24} />}
                  </div>
                  <h2 className="text-xl font-black text-ink-heading dark:text-white uppercase tracking-tighter italic">{activeQueue.label}</h2>
                </div>
                <button onClick={onClose} className="p-2 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors"><X size={20} /></button>
              </div>
            </div>
            <div className="p-8 max-h-[50vh] overflow-y-auto custom-scrollbar space-y-4">
              {activeQueue.items.length === 0 ? (
                <div className="py-12 text-center opacity-30 italic uppercase font-black text-xs tracking-widest">Queue Empty</div>
              ) : activeQueue.items.map((item) => (
                <div key={item.jobCardId} className="p-5 rounded-[2rem] bg-slate-50 dark:bg-white/[0.03] border border-surface-border dark:border-white/5 flex items-center justify-between group hover:border-brand/40 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center"><Car size={20} /></div>
                    <div>
                      <p className="text-sm font-black text-ink-heading dark:text-white italic uppercase">{item.vehicleRegNo}</p>
                      <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest">{item.vehicleName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeQueue.id === 'qc' && (
                      <button
                        onClick={() => onQuickStatusUpdate(item.jobCardId, item.vehicleRegNo, 'completed')}
                        className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                      >
                        Approve QC
                      </button>
                    )}
                    {activeQueue.id === 'finance' && (
                      <button
                        onClick={() => onQuickStatusUpdate(item.jobCardId, item.vehicleRegNo, 'delivered')}
                        className="px-4 py-2 bg-amber-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-600 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                      >
                        Release Unit
                      </button>
                    )}

                    <Link href={`/service-admin/workshop/job-cards/${item.jobCardId}`} className="p-3 bg-white dark:bg-white/5 rounded-xl border border-surface-border dark:border-white/10 text-ink-muted hover:text-brand hover:border-brand transition-all">
                      <ChevronRight size={18} strokeWidth={3} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
