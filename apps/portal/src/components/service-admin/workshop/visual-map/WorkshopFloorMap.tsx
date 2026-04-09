// apps/portal/src/components/service-admin/workshop/visual-map/WorkshopFloorMap.tsx

'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useVisualMapData } from '@/hooks/service-admin/useVisualMapData';
import { RampCard } from './RampCard';
import { RampDetailModal } from './RampDetailModal';
import { MapLegend } from './MapLegend';
import { MapStatsBar } from './MapStatsBar';
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
  Zap,
} from 'lucide-react';
import { useWorkshopStore } from '@/stores/service-admin/workshopStore';
import { useSocket } from '@/hooks/useSocket';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent
} from '@dnd-kit/core';
import { LiveClock } from './LiveClock';
import { QueueModal } from './QueueModal';
import { WORKSHOP_STAGES } from '@/constants/service-admin/mapConfig';
import { StageNode } from './StageNode';
import { DraggableRamp } from './DraggableRamp';

export function WorkshopFloorMap() {
  const { rampData, stats } = useVisualMapData();
  const { fetchWorkshopData, updateJobCardStatus, isLoading } = useWorkshopStore();
  const { isConnected } = useSocket();

  const [selectedRamp, setSelectedRamp] = useState<RampData | null>(null);
  const [activeQueue, setActiveQueue] = useState<{ id: string, label: string, color: 'purple' | 'amber' | 'emerald' | 'rose', items: VehicleOnRamp[] } | null>(null);
  const [filter, setFilter] = useState<RampStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showTechPanel, setShowTechPanel] = useState(false);
  const [activeDraggingRamp, setActiveDraggingRamp] = useState<RampData | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 10 } }));

  const filteredRamps = useMemo(() => {
    let result = rampData;
    if (filter !== 'all') result = result.filter((r) => r.status === filter);
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(r =>
        r.rampName.toLowerCase().includes(q) ||
        r.vehicle?.vehicleRegNo.toLowerCase().includes(q) ||
        r.vehicle?.customerName.toLowerCase().includes(q) ||
        r.vehicle?.jobCardNumber.toLowerCase().includes(q)
      );
    }
    return result;
  }, [rampData, filter, debouncedSearch]);

  const searchInQC = useMemo(() =>
    debouncedSearch.trim() !== '' && stats.qcQueue.some(v => v.vehicleRegNo.toLowerCase().includes(debouncedSearch.toLowerCase())),
    [debouncedSearch, stats.qcQueue]
  );

  const searchInFinance = useMemo(() =>
    debouncedSearch.trim() !== '' && stats.financeQueue.some(v => v.vehicleRegNo.toLowerCase().includes(debouncedSearch.toLowerCase())),
    [debouncedSearch, stats.financeQueue]
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const ramp = rampData.find(r => r.id === active.id);
    if (ramp?.vehicle) setActiveDraggingRamp(ramp);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDraggingRamp(null);
    if (!over) return;

    const sourceRamp = rampData.find(r => r.id === active.id);
    const targetStageId = over.id as string;

    if (sourceRamp?.vehicle) {
      const stageConfig = Object.values(WORKSHOP_STAGES).find(s => s.id === targetStageId);
      const newStatus = stageConfig?.targetStatus;

      if (newStatus) {
        try {
          await updateJobCardStatus(sourceRamp.vehicle.jobCardId, newStatus);
          toast.success(`Unit ${sourceRamp.vehicle.vehicleRegNo} transitioned`, {
            description: `Moved to ${stageConfig.label} stage.`,
            icon: <Zap size={16} className="text-emerald-500" />
          });
        } catch (err) {
          toast.error("Transition failed");
        }
      }
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchWorkshopData();
      toast.success("Workshop Data Synced", { icon: <Zap size={16} className="text-emerald-500" /> });
    } finally {
      setIsRefreshing(false);
    }
  };

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) { document.documentElement.requestFullscreen(); setIsFullscreen(true); }
    else { document.exitFullscreen(); setIsFullscreen(false); }
  }, []);

  // PIXEL PERFECT ALIGNMENT MATH
  const RAMP_WIDTH = 280;
  const GAP = 48; // flex gap-12
  const STAGE_NODE_WIDTH = 112; // w-28
  const QC_WIDTH = 120;

  const ENTRY_CENTER = STAGE_NODE_WIDTH / 2;
  const RAMPS_START = STAGE_NODE_WIDTH + GAP;
  const NUM_RAMPS = Math.max(1, filteredRamps.length);
  const RAMPS_TOTAL_WIDTH = (NUM_RAMPS * RAMP_WIDTH) + ((NUM_RAMPS - 1) * GAP);
  const QC_START = RAMPS_START + RAMPS_TOTAL_WIDTH + GAP;
  const QC_CENTER = QC_START + (QC_WIDTH / 2);
  const FINANCE_START = QC_START + QC_WIDTH + GAP;
  const FINANCE_CENTER = FINANCE_START + (QC_WIDTH / 2);
  const EXIT_START = FINANCE_START + QC_WIDTH + GAP;
  const EXIT_CENTER = EXIT_START + (STAGE_NODE_WIDTH / 2);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className={cn(
        "flex flex-col gap-6 h-full transition-all duration-1000 select-none max-w-full overflow-hidden",
        isFullscreen ? "p-10 bg-slate-50 dark:bg-[#050505] fixed inset-0 z-[100]" : "bg-transparent"
      )}>
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-5">
            <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-brand text-white shadow-xl">
              <MapIcon className="h-7 w-7" />
            </div>
            <div>
               <h1 className="text-2xl font-black text-ink-heading dark:text-white uppercase tracking-tight italic leading-none">
                Control <span className="text-brand">Matrix</span>
              </h1>
              <div className="text-[10px] font-black text-ink-muted uppercase tracking-[0.4em] mt-2 opacity-60 flex items-center gap-3">
                 <LiveClock />
                 <div className="w-px h-3 bg-surface-border dark:bg-white/10" />
                 <div className={cn(
                   "flex items-center gap-1.5 px-2 py-0.5 rounded-full border transition-all duration-500",
                   isConnected
                     ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                     : "bg-rose-500/10 border-rose-500/20 text-rose-600"
                 )}>
                   <div className={cn(
                     "w-1.5 h-1.5 rounded-full",
                     isConnected ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                   )} />
                   <span className="text-[8px] tracking-widest">{isConnected ? 'LIVE' : 'OFFLINE'}</span>
                 </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/40 dark:bg-white/5 p-1.5 rounded-2xl border border-surface-border dark:border-white/10 backdrop-blur-md shadow-soft">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-muted" />
              <input type="text" placeholder="Filter Bays..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 pr-4 py-2 rounded-xl bg-transparent text-xs font-bold focus:outline-none transition-all w-48" />
            </div>
            <div className="w-px h-6 bg-surface-border dark:bg-white/10 mx-1" />
            <button onClick={() => setShowTechPanel(!showTechPanel)} className={cn("p-2 rounded-xl transition-all", showTechPanel ? 'bg-brand text-white shadow-lg' : 'text-ink-muted hover:text-brand')}><Users className="h-4 w-4" /></button>
            <button onClick={handleRefresh} className="p-2 text-ink-muted hover:text-brand transition-all active:rotate-180 duration-500"><RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} /></button>
            <button onClick={toggleFullscreen} className="p-2 text-ink-muted hover:text-brand transition-all">{isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}</button>
          </div>
        </div>

        <MapStatsBar stats={stats} />

        {/* Fluid Console Stage */}
        <div className="flex-1 relative w-full overflow-hidden rounded-[4rem] border-2 border-surface-border dark:border-white/5 bg-white dark:bg-[#080809] shadow-2xl flex flex-col">
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08] pointer-events-none" style={{ backgroundImage: `linear-gradient(#C75B12 1.5px, transparent 1.5px), linear-gradient(to right, #C75B12 1.5px, transparent 1.5px)`, backgroundSize: '40px 40px' }} />

          <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar flex items-center">
            <div className="w-full min-w-max px-16 py-12 relative flex justify-center">
              {isLoading && rampData.length === 0 ? (
                <div className="flex gap-12 animate-pulse">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-[280px] h-[350px] bg-slate-200 dark:bg-white/5 rounded-[3rem]" />
                  ))}
                </div>
              ) : (
                <div className="relative inline-block">
                  {/* DYNAMIC SVG PIPELINE */}
                  <svg className="absolute top-[280px] left-0 w-full h-[100px] pointer-events-none -z-10" overflow="visible">
                    <defs>
                      <marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orientation="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#C75B12" /></marker>
                      <marker id="arrow-active" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orientation="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#10b981" /></marker>
                    </defs>

                    {/* Flow Path: Entry to Bays */}
                    <path d={`M ${ENTRY_CENTER + 60} 20 H ${RAMPS_START - 10}`} stroke="#C75B12" strokeWidth="2.5" fill="transparent" markerEnd="url(#arrow)" strokeDasharray="5,5" />

                    {/* Ramp Connections */}
                    {filteredRamps.map((ramp, idx) => {
                      const xPos = RAMPS_START + (idx * (RAMP_WIDTH + GAP)) + (RAMP_WIDTH / 2);
                      const isOp = ramp.status === 'active';
                      return (
                        <g key={`pipe-${ramp.id}`}>
                          <path d={`M ${xPos} 20 V -40`} stroke={isOp ? '#10b981' : '#cbd5e1'} strokeWidth="3" markerEnd={isOp ? "url(#arrow-active)" : "url(#arrow)"} />
                          <circle cx={xPos} cy="20" r="6" className={cn("transition-colors duration-500", isOp ? "fill-emerald-500 shadow-[0_0_15px_#10b981]" : "fill-brand")} />
                          {idx < filteredRamps.length - 1 && (
                            <path d={`M ${xPos + (RAMP_WIDTH/2)} 20 H ${xPos + (RAMP_WIDTH/2) + GAP - 10}`} stroke="#C75B12" strokeWidth="2.5" fill="transparent" markerEnd="url(#arrow)" strokeDasharray="5,5" />
                          )}
                        </g>
                      );
                    })}

                    {/* Path to Stages */}
                    <path d={`M ${RAMPS_START + RAMPS_TOTAL_WIDTH} 20 H ${QC_CENTER - 70}`} stroke={searchInQC ? '#a855f7' : '#C75B12'} strokeWidth={searchInQC ? '4' : '2.5'} fill="transparent" markerEnd="url(#arrow)" strokeDasharray={searchInQC ? "0" : "5,5"} />
                    <path d={`M ${QC_CENTER + 70} 20 H ${FINANCE_CENTER - 70}`} stroke={searchInFinance ? '#f59e0b' : '#C75B12'} strokeWidth={searchInFinance ? '4' : '2.5'} fill="transparent" markerEnd="url(#arrow)" strokeDasharray={searchInFinance ? "0" : "5,5"} />
                    <path d={`M ${FINANCE_CENTER + 70} 20 H ${EXIT_CENTER - 60}`} stroke="#C75B12" strokeWidth="2.5" fill="transparent" markerEnd="url(#arrow)" strokeDasharray="5,5" />
                  </svg>

                  {/* Nodes Container */}
                  <div className="flex items-start gap-12 relative min-h-[450px]">
                    <div className="mt-[215px] shrink-0" style={{ width: `${STAGE_NODE_WIDTH}px` }}>
                      <StageNode {...WORKSHOP_STAGES.ENTRY} icon={<LogIn className="text-emerald-500 h-8 w-8" />} />
                    </div>

                    <div className="flex gap-12 shrink-0">
                      <AnimatePresence mode="popLayout">
                        {filteredRamps.map((ramp) => (
                          <motion.div key={ramp.id} layout className="w-[280px] shrink-0">
                            <DraggableRamp ramp={ramp} onClick={setSelectedRamp} />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      {filteredRamps.length === 0 && (
                        <div className="w-[280px] h-[350px] border-4 border-dashed border-surface-border dark:border-white/5 rounded-[3rem] flex items-center justify-center text-ink-muted opacity-20 italic font-black text-xs uppercase tracking-widest">Sector Standby</div>
                      )}
                    </div>

                    <div className="mt-[200px] shrink-0" style={{ width: `${QC_WIDTH}px` }}>
                      <StageNode {...WORKSHOP_STAGES.QC} highlight={searchInQC} icon={<ClipboardCheck className={cn("h-10 w-10", searchInQC ? "text-white" : "text-purple-500")} />} badge={stats.qcPendingRamps} onClick={() => setActiveQueue({ id: 'qc', label: WORKSHOP_STAGES.QC.queueLabel, color: 'purple', items: stats.qcQueue })} />
                    </div>

                    <div className="mt-[200px] shrink-0" style={{ width: `${QC_WIDTH}px` }}>
                      <StageNode {...WORKSHOP_STAGES.FINANCE} highlight={searchInFinance} icon={<CreditCard className={cn("h-10 w-10", searchInFinance ? "text-white" : "text-amber-500")} />} badge={stats.financePendingCount} onClick={() => setActiveQueue({ id: 'finance', label: WORKSHOP_STAGES.FINANCE.queueLabel, color: 'amber', items: stats.financeQueue })} />
                    </div>

                    <div className="mt-[215px] shrink-0 pr-12" style={{ width: `${STAGE_NODE_WIDTH}px` }}>
                      <StageNode {...WORKSHOP_STAGES.EXIT} icon={<LogOut className="text-rose-500 h-8 w-8" />} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Fixed Footer Console */}
          <div className="shrink-0 p-6 bg-white/40 dark:bg-black/40 border-t border-surface-border dark:border-white/5 backdrop-blur-xl flex items-center justify-between">
             <MapLegend filter={filter} onFilterChange={setFilter} />
             <p className="text-[9px] font-black text-ink-muted uppercase tracking-[0.4em] italic opacity-40">System Core v4.2 // Automated Floor Interface</p>
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

        <QueueModal activeQueue={activeQueue} onClose={() => setActiveQueue(null)} onQuickStatusUpdate={(id, reg, status) => updateJobCardStatus(id, status)} />
      </div>
    </DndContext>
  );
}
