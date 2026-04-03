// apps/portal/src/components/service-admin/workshop/visual-map/DraggableRamp.tsx

'use client';

import { useDraggable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { RampCard } from './RampCard';
import { RampData } from '@/types/service-admin/visualMap';

interface DraggableRampProps {
  ramp: RampData;
  onClick: (ramp: RampData) => void;
}

export function DraggableRamp({ ramp, onClick }: DraggableRampProps) {
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
