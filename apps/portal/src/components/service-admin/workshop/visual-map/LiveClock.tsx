// apps/portal/src/components/service-admin/workshop/visual-map/LiveClock.tsx

'use client';

import { useState, useEffect, memo } from 'react';
import { format } from 'date-fns';

/**
 * LiveClock: A specialized memoized component for the real-time clock.
 * Extracted to prevent the entire floor map and its expensive SVG paths
 * from re-rendering every second.
 */
export const LiveClock = memo(function LiveClock() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest tabular-nums">
        {format(currentTime, 'HH:mm:ss')}
      </span>
    </div>
  );
});

LiveClock.displayName = 'LiveClock';
