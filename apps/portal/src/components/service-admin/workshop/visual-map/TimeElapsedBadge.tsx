// apps/portal/src/components/service-admin/workshop/visual-map/TimeElapsedBadge.tsx

'use client';

import { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { ELAPSED_UPDATE_MS } from '@/constants/service-admin/mapConfig';

interface TimeElapsedBadgeProps {
  since: string | null;
  warningThresholdMin?: number;
  dangerThresholdMin?: number;
  compact?: boolean;
}

function formatElapsed(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

export function TimeElapsedBadge({
  since,
  warningThresholdMin = 120,
  dangerThresholdMin = 240,
  compact = false,
}: TimeElapsedBadgeProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!since) return;

    const start = new Date(since).getTime();
    const update = () => setElapsed(Date.now() - start);

    update();
    const interval = setInterval(update, ELAPSED_UPDATE_MS);
    return () => clearInterval(interval);
  }, [since]);

  if (!since) return null;

  const minutes = elapsed / 60000;
  const isDanger = minutes >= dangerThresholdMin;
  const isWarning = minutes >= warningThresholdMin;

  const colorClass = isDanger
    ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-300'
    : isWarning
    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-300'
    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200';

  return (
    <div
      className={`
        inline-flex items-center gap-1 rounded-full border px-2 py-0.5
        font-mono text-xs font-medium tabular-nums
        ${colorClass}
        ${isDanger ? 'animate-pulse' : ''}
      `}
    >
      {isDanger ? (
        <AlertTriangle className="h-3 w-3" />
      ) : (
        <Clock className="h-3 w-3" />
      )}
      <span>{formatElapsed(elapsed)}</span>
    </div>
  );
}
