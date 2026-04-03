// apps/portal/src/components/service-admin/workshop/visual-map/WorkshopFloorMap.tsx

'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useVisualMapData } from '@/hooks/service-admin/useVisualMapData';
import { RampCard } from './RampCard';
import { RampDetailModal } from './RampDetailModal';
import { MapLegend } from './MapLegend';
import { MapStatsBar } from './MapStatsBar';
import { TechnicianAvatar } from './TechnicianAvatar';
import type { RampData, RampStatus, VehicleOnRamp } from '@/types/service-admin/visualMap';
import {
  Map as MapIcon,
  Maximize2,
  Minimize2,
  RefreshCw,
  Users,
  Search,
  ClipboardCheck,
  CreditCard,
  LogOut,
  LogIn,
  Settings,
  Activity,
  X,
  Car,
  ChevronRight,
  Zap,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { useWorkshopStore } from '@/stores/service-admin/workshopStore';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
  useDraggable
} from '@dnd-kit/core';

export function WorkshopFloorMap() {
  const { rampData, stats, unassignedTechnicians } = useVisualMapData();
  const { fetchWorkshopData, updateJobCardStatus } = useWorkshopStore();

  const [selectedRamp, setSelectedRamp] = useState<RampData | null>(null);
  const [activeQueue, setActiveQueue] = useState<{ id: string, label: string, color: string, items: VehicleOnRamp[] } | null>(null);
  const [filter, setFilter] = useState<RampStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showTechPanel, setShowTechPanel] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeDraggingRamp, setActiveDraggingRamp] = useState<RampData | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 10 } }));

  const filteredRamps = useMemo(() => {
    let result = rampData;
    if (filter !== 'all') result = result.filter((r) => r.status === filter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.rampName.toLowerCase().includes(q) ||
        r.vehicle?.vehicleRegNo.toLowerCase().includes(q) ||
        r.vehicle?.customerName.toLowerCase().includes(q) ||
        r.vehicle?.jobCardNumber.toLowerCase().includes(q)
      );
    }
    return result;
  }, [rampData, filter, searchQuery]);

  const searchInQC = useMemo(() =>
    searchQuery.trim() !== '' && stats.qcQueue.some(v => v.vehicleRegNo.toLowerCase().includes(searchQuery.toLowerCase())),
    [searchQuery, stats.qcQueue]
  );

  const searchInFinance = useMemo(() =>
    searchQuery.trim() !== '' && stats.financeQueue.some(v => v.vehicleRegNo.toLowerCase().includes(searchQuery.toLowerCase())),
    [searchQuery, stats.financeQueue]
  );

  const handleDragStart = (event: any) => {
    const { active } = event;
    const ramp = rampData.find(r => r.id === active.id);
    if (ramp?.vehicle) setActiveDraggingRamp(ramp);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    setActiveDraggingRamp(null);
    if (!over) return;

    const sourceRamp = rampData.find(r => r.id === active.id);
    const targetStage = over.id as string;

    if (sourceRamp?.vehicle) {
      let newStatus: any = null;
      if (targetStage === 'qc-stage') newStatus = 'qc_pending';
      if (targetStage === 'finance-stage') newStatus = 'completed';
      if (targetStage === 'exit-stage') newStatus = 'delivered';

      if (newStatus) {
        try {
          await updateJobCardStatus(sourceRamp.vehicle.jobCardId, newStatus);
          toast.success(`Unit ${sourceRamp.vehicle.vehicleRegNo} transitioned`, {
            description: `Moved to ${targetStage.replace('-stage', '').toUpperCase()} stage.`,
            icon: <Zap size={16} className="text-emerald-500" />
          });
        } catch (err) {
          toast.error("Transition failed");
        }
      }
    }
  };

  const handleQuickStatusUpdate = async (jobId: string, vehicleReg: string, newStatus: any) => {
      try {
          await updateJobCardStatus(jobId, newStatus);
          toast.success(`Unit ${vehicleReg} Updated`, {
              description: `New status: ${newStatus.replace('_', ' ').toUpperCase()}`,
              icon: <CheckCircle2 size={16} className="text-emerald-500" />
          });
          // Close and update local state if needed - store will auto-sync via Socket.io
          setActiveQueue(prev => prev ? { ...prev, items: prev.items.filter(i => i.jobCardId !== jobId) } : null);
      } catch (err) {
          toast.error("Update failed");
      }
  };

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) { document.documentElement.requestFullscreen(); setIsFullscreen(true); }
    else { document.exitFullscreen(); setIsFullscreen(false); }
  }, []);

  const RAMP_WIDTH = 280;
  const GAP = 48;
  const ENTRY_NODE_X = 80;
  const RAMPS_START_X = 240;
  const QC_NODE_X = RAMPS_START_X + (filteredRamps.length * (RAMP_WIDTH + GAP)) + 50;
  const FINANCE_NODE_X = QC_NODE_X + 240;
  const EXIT_NODE_X = FINANCE_NODE_X + 240;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className={cn(
        "flex flex-col gap-6 h-full transition-all duration-1000 select-none",
        isFullscreen ? "p-10 bg-slate-50 dark:bg-[#050505] fixed inset-0 z-[100]" : "bg-transparent"
      )}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-5">
            <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-brand text-white shadow-xl">
              <MapIcon className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-ink-heading dark:text-white uppercase tracking-tight italic leading-none">
                Control <span className="text-brand">Matrix</span>
              </h1>
              <p className="text-[10px] font-black text-ink-muted uppercase tracking-[0.4em] mt-2 opacity-60 flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 Live Interface / Sync: {format(currentTime, 'HH:mm:ss')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/40 dark:bg-white/5 p-1.5 rounded-2xl border border-surface-border dark:border-white/10 backdrop-blur-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-muted" />
              <input type="text" placeholder="Search Reg / Job..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 pr-4 py-2 rounded-xl bg-transparent text-xs font-bold focus:outline-none transition-all w-48" />
            </div>
            <div className="w-px h-6 bg-surface-border dark:bg-white/10 mx-1" />
            <button onClick={() => setShowTechPanel(!showTechPanel)} className={cn("p-2 rounded-xl transition-all", showTechPanel ? 'bg-brand text-white shadow-lg' : 'text-ink-muted hover:text-brand')}>
              <Users className="h-4 w-4" />
            </button>
            <button onClick={handleRefresh} className="p-2 text-ink-muted hover:text-brand transition-all active:rotate-180 duration-500"><RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} /></button>
            <button onClick={toggleFullscreen} className="p-2 text-ink-muted hover:text-brand transition-all">{isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}</button>
          </div>
        </div>

        <MapStatsBar stats={stats} />

        <div className="flex-1 relative w-full overflow-hidden rounded-[4rem] border-2 border-surface-border dark:border-white/5 bg-white dark:bg-[#080809] shadow-2xl flex flex-col">
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08] pointer-events-none" style={{ backgroundImage: `linear-gradient(#C75B12 1px, transparent 1px), linear-gradient(to right, #C75B12 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

          <div className="flex-1 overflow-x-auto custom-scrollbar flex items-center">
            <div className="min-w-fit px-24 py-12 inline-block relative">
              <svg className="absolute top-[280px] left-0 w-full h-[100px] pointer-events-none -z-10" overflow="visible">
                <defs>
                  <marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orientation="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#C75B12" /></marker>
                  <marker id="arrow-emerald" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orientation="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#10b981" /></marker>
                </defs>
                <path d={`M ${ENTRY_NODE_X + 60} 20 H ${RAMPS_START_X - 10}`} stroke="#C75B12" strokeWidth="2.5" fill="transparent" markerEnd="url(#arrow)" strokeDasharray="5,5" />
                <text x={ENTRY_NODE_X + 80} y="10" className="text-[7px] font-black fill-brand/30 uppercase tracking-[0.4em]">Reception</text>
                {filteredRamps.map((ramp, idx) => {
                  const xPos = RAMPS_START_X + (idx * (RAMP_WIDTH + GAP)) + (RAMP_WIDTH / 2);
                  const isOp = ramp.status === 'active';
                  return (
                    <g key={`bay-${ramp.id}`}>
                      <path d={`M ${xPos} 20 V -40`} stroke={isOp ? '#10b981' : '#cbd5e1'} strokeWidth="3" markerEnd={isOp ? "url(#arrow-emerald)" : "url(#arrow)"} />
                      <circle cx={xPos} cy="20" r="5" className={cn("transition-colors duration-500", isOp ? "fill-emerald-500" : "fill-brand")} />
                      {idx < filteredRamps.length - 1 && (<path d={`M ${xPos + (RAMP_WIDTH/2)} 20 H ${xPos + (RAMP_WIDTH/2) + GAP - 10}`} stroke="#C75B12" strokeWidth="2.5" fill="transparent" markerEnd="url(#arrow)" strokeDasharray="5,5" />)}
                    </g>
                  );
                })}
                <path d={`M ${RAMPS_START_X + (filteredRamps.length * (RAMP_WIDTH + GAP)) - GAP} 20 H ${QC_NODE_X - 75}`} stroke={searchInQC ? '#a855f7' : '#C75B12'} strokeWidth={searchInQC ? '4' : '2.5'} fill="transparent" markerEnd="url(#arrow)" strokeDasharray={searchInQC ? "0" : "5,5"} className="transition-all duration-500" />
                <path d={`M ${QC_NODE_X + 75} 20 H ${FINANCE_NODE_X - 75}`} stroke={searchInFinance ? '#f59e0b' : '#C75B12'} strokeWidth={searchInFinance ? '4' : '2.5'} fill="transparent" markerEnd="url(#arrow)" strokeDasharray={searchInFinance ? "0" : "5,5"} className="transition-all duration-500" />
                <path d={`M ${FINANCE_NODE_X + 75} 20 H ${EXIT_NODE_X - 65}`} stroke="#C75B12" strokeWidth="2.5" fill="transparent" markerEnd="url(#arrow)" strokeDasharray="5,5" />
              </svg>

              <div className="flex items-start gap-12 relative min-h-[450px]">
                <div className="mt-[215px] shrink-0" style={{ width: '120px' }}>
                   <StageNode id="entry-stage" icon={<LogIn className="text-emerald-500 h-8 w-8" />} label="INBOUND" color="emerald" />
                </div>

                <div className="flex gap-12">
                  <AnimatePresence mode="popLayout">
                    {filteredRamps.map((ramp) => (
                      <motion.div key={ramp.id} layout className="w-[280px] shrink-0">
                        <DraggableRamp ramp={ramp} onClick={setSelectedRamp} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="mt-[200px] shrink-0" style={{ width: '150px' }}>
                  <StageNode id="qc-stage" highlight={searchInQC} icon={<ClipboardCheck className={cn("h-10 w-10", searchInQC ? "text-white" : "text-purple-500")} />} label="QC STAGE" color="purple" badge={stats.qcPendingRamps} onClick={() => setActiveQueue({ id: 'qc', label: 'QC AUDIT QUEUE', color: 'purple', items: stats.qcQueue })} />
                </div>

                <div className="mt-[200px] shrink-0" style={{ width: '150px' }}>
                  <StageNode id="finance-stage" highlight={searchInFinance} icon={<CreditCard className={cn("h-10 w-10", searchInFinance ? "text-white" : "text-amber-500")} />} label="FINANCE" color="amber" badge={stats.financePendingCount} onClick={() => setActiveQueue({ id: 'finance', label: 'SETTLEMENT QUEUE', color: 'amber', items: stats.financeQueue })} />
                </div>

                <div className="mt-[215px] shrink-0 pr-12" style={{ width: '120px' }}>
                  <StageNode id="exit-stage" icon={<LogOut className="text-rose-500 h-8 w-8" />} label="OUTBOUND" color="rose" />
                </div>
              </div>
            </div>
          </div>

          <div className="shrink-0 p-6 bg-white/40 dark:bg-black/40 border-t border-surface-border dark:border-white/5 backdrop-blur-xl flex items-center justify-between">
             <MapLegend filter={filter} onFilterChange={setFilter} />
             <p className="text-[9px] font-black text-ink-muted uppercase tracking-[0.4em] italic opacity-40">RS-OS Integrated Matrix Console</p>
          </div>
        </div>

        <RampDetailModal ramp={selectedRamp} onClose={() => setSelectedRamp(null)} />

        <DragOverlay>
           {activeDraggingRamp ? (
             <div className="w-[280px] rotate-3 scale-110 opacity-80 pointer-events-none">
                <RampCard ramp={activeDraggingRamp} onClick={() => {}} />
             </div>
           ) : null}
        </DragOverlay>

        <AnimatePresence>
          {activeQueue && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setActiveQueue(null)} />
               <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-2xl bg-white dark:bg-[#0A0A0B] rounded-[3rem] shadow-2xl border-2 border-surface-border dark:border-white/5 overflow-hidden">
                  <div className={cn("p-8 border-b-4", activeQueue.color === 'purple' ? "bg-purple-500/10 border-purple-500" : "bg-amber-500/10 border-amber-500")}>
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className={cn("p-3 rounded-2xl", activeQueue.color === 'purple' ? "bg-purple-500 text-white" : "bg-amber-500 text-white")}>
                              {activeQueue.color === 'purple' ? <ClipboardCheck size={24} /> : <CreditCard size={24} />}
                         </div>
                         <h2 className="text-xl font-black text-ink-heading dark:text-white uppercase tracking-tighter italic">{activeQueue.label}</h2>
                      </div>
                      <button onClick={() => setActiveQueue(null)} className="p-2 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors"><X size={20} /></button>
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
                            {/* Action Buttons based on Stage */}
                            {activeQueue.id === 'qc' && (
                                <button
                                    onClick={() => handleQuickStatusUpdate(item.jobCardId, item.vehicleRegNo, 'completed')}
                                    className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                                >
                                    Approve QC
                                </button>
                            )}
                            {activeQueue.id === 'finance' && (
                                <button
                                    onClick={() => handleQuickStatusUpdate(item.jobCardId, item.vehicleRegNo, 'delivered')}
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
    </div>
    </DndContext>
  );
}

function DraggableRamp({ ramp, onClick }: { ramp: RampData, onClick: any }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: ramp.id,
    disabled: !ramp.vehicle
  });

  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={cn("relative transition-opacity", isDragging && "opacity-20")}>
       <RampCard ramp={ramp} onClick={onClick} />
    </div>
  );
}

function StageNode({ id, icon, label, color, badge, highlight, onClick }: any) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const colors: any = {
    emerald: "bg-emerald-500 border-emerald-500 text-emerald-500 shadow-emerald-500/20",
    purple: "bg-purple-500 border-purple-500 text-purple-500 shadow-purple-500/20",
    amber: "bg-amber-500 border-amber-500 text-amber-500 shadow-amber-500/20",
    rose: "bg-rose-500 border-rose-500 text-rose-500 shadow-rose-500/20",
  };

  return (
    <div ref={setNodeRef} className="flex flex-col items-center">
      <motion.div
        animate={{ scale: isOver ? 1.2 : 1 }}
        onClick={onClick}
        className={cn(
          "w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center shadow-2xl relative transition-all duration-500",
          highlight ? (color === 'purple' ? "bg-purple-600 border-purple-400 shadow-[0_0_40px_#a855f7]" : "bg-amber-600 border-amber-400 shadow-[0_0_40px_#f59e0b]") : (isOver ? "bg-opacity-40 shadow-[0_0_40px_currentColor]" : "bg-opacity-10"),
          !highlight && colors[color].replace('text-', 'bg-opacity-10 '),
          onClick && "cursor-pointer"
        )}
      >
         <div className={cn("absolute inset-[-10px] border-2 border-dashed rounded-full opacity-10", colors[color].replace('text-', 'border-'))} />
         {icon}
         <span className={cn("text-[8px] font-black mt-2 tracking-[0.2em] italic uppercase", highlight ? "text-white" : colors[color])}>{label}</span>
         {badge > 0 && (
           <div className={cn("absolute -top-1 -right-1 px-2.5 py-1 text-white text-[10px] font-black rounded-lg shadow-xl animate-pulse tracking-tighter", colors[color].replace('text-', 'bg-'))}>
             {badge}
           </div>
         )}
      </motion.div>
    </div>
  );
}
