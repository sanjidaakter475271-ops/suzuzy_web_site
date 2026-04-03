// apps/portal/src/components/service-admin/workshop/visual-map/TechnicianAvatar.tsx

'use client';

import { TechnicianOnMap } from '@/types/service-admin/visualMap';
import { TECHNICIAN_STATUS_CONFIG } from '@/constants/service-admin/mapConfig';
import { User, Coffee, Wrench } from 'lucide-react';
import Image from 'next/image';

interface TechnicianAvatarProps {
  technician: TechnicianOnMap;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

const sizeMap = {
  sm: 'h-7 w-7',
  md: 'h-9 w-9',
  lg: 'h-12 w-12',
};

const dotSizeMap = {
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
};

export function TechnicianAvatar({ technician, size = 'md', showName = true }: TechnicianAvatarProps) {
  const config = TECHNICIAN_STATUS_CONFIG[technician.status];
  const initials = technician.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const StatusIcon = technician.status === 'on_break' ? Coffee :
                     technician.status === 'working' ? Wrench : User;

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        {/* Avatar circle */}
        <div
          className={`
            ${sizeMap[size]} rounded-full flex items-center justify-center
            ring-2 ${config.ringClass} ring-offset-1 ring-offset-white dark:ring-offset-slate-900
            bg-slate-200 dark:bg-slate-700 overflow-hidden
            text-xs font-bold text-slate-600 dark:text-slate-300
          `}
        >
          {technician.avatar ? (
            <Image
              src={technician.avatar}
              alt={technician.name}
              width={48}
              height={48}
              className="object-cover w-full h-full"
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        {/* Status dot */}
        <div
          className={`
            absolute -bottom-0.5 -right-0.5 ${dotSizeMap[size]} rounded-full
            ${config.dotClass} border-2 border-white dark:border-slate-900
          `}
        />
      </div>

      {showName && (
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate leading-tight">
            {technician.name}
          </p>
          <div className="flex items-center gap-1">
            <StatusIcon className="h-2.5 w-2.5 text-slate-400" />
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {config.label}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
