// apps/portal/src/components/service-admin/workshop/visual-map/StageNode.tsx

'use client';

import { motion } from 'framer-motion';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface StageNodeProps {
  id: string;
  icon: ReactNode;
  label: string;
  color: 'emerald' | 'purple' | 'amber' | 'rose';
  badge?: number;
  highlight?: boolean;
  onClick?: () => void;
}

export function StageNode({ id, icon, label, color, badge = 0, highlight, onClick }: StageNodeProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const colors = {
    emerald: "bg-emerald-500 border-emerald-500 text-emerald-500 shadow-emerald-500/20",
    purple: "bg-purple-500 border-purple-500 text-purple-500 shadow-purple-500/20",
    amber: "bg-amber-500 border-amber-500 text-amber-500 shadow-amber-500/20",
    rose: "bg-rose-500 border-rose-500 text-rose-500 shadow-rose-500/20",
  };

  const borderColors = {
    emerald: "border-emerald-500",
    purple: "border-purple-500",
    amber: "border-amber-500",
    rose: "border-rose-500",
  };

  const bgColors = {
    emerald: "bg-emerald-500",
    purple: "bg-purple-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
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
         <div className={cn("absolute inset-[-10px] border-2 border-dashed rounded-full opacity-10", borderColors[color])} />
         {icon}
         <span className={cn("text-[8px] font-black mt-2 tracking-[0.2em] italic uppercase", highlight ? "text-white" : colors[color].split(' ')[2])}>{label}</span>
         {badge > 0 && (
           <div className={cn("absolute -top-1 -right-1 px-2.5 py-1 text-white text-[10px] font-black rounded-lg shadow-xl animate-pulse tracking-tighter", bgColors[color])}>
             {badge}
           </div>
         )}
      </motion.div>
    </div>
  );
}
