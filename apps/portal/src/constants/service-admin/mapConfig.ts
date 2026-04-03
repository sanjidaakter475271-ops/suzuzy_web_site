// apps/portal/src/constants/service-admin/mapConfig.ts

import { RampStatus, TechnicianStatus } from '@/types/service-admin/visualMap';

export const RAMP_STATUS_CONFIG: Record<RampStatus, {
  label: string;
  labelBn: string;
  color: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  pulseClass: string;
  icon: string;
  glowClass: string;
}> = {
  active: {
    label: 'Active',
    labelBn: 'কাজ চলছে',
    color: '#22c55e',
    bgClass: 'bg-emerald-500/20 dark:bg-emerald-500/10',
    borderClass: 'border-emerald-500 dark:border-emerald-400',
    textClass: 'text-emerald-700 dark:text-emerald-300',
    pulseClass: 'animate-pulse',
    icon: '🔧',
    glowClass: 'shadow-emerald-500/30',
  },
  free: {
    label: 'Free',
    labelBn: 'খালি',
    color: '#3b82f6',
    bgClass: 'bg-blue-500/20 dark:bg-blue-500/10',
    borderClass: 'border-blue-500 dark:border-blue-400',
    textClass: 'text-blue-700 dark:text-blue-300',
    pulseClass: '',
    icon: '✅',
    glowClass: 'shadow-blue-500/20',
  },
  booked: {
    label: 'Booked',
    labelBn: 'বুকড',
    color: '#f59e0b',
    bgClass: 'bg-amber-500/20 dark:bg-amber-500/10',
    borderClass: 'border-amber-500 dark:border-amber-400',
    textClass: 'text-amber-700 dark:text-amber-300',
    pulseClass: 'animate-pulse',
    icon: '📋',
    glowClass: 'shadow-amber-500/20',
  },
  qc_pending: {
    label: 'QC Pending',
    labelBn: 'QC বাকি',
    color: '#a855f7',
    bgClass: 'bg-purple-500/20 dark:bg-purple-500/10',
    borderClass: 'border-purple-500 dark:border-purple-400',
    textClass: 'text-purple-700 dark:text-purple-300',
    pulseClass: '',
    icon: '🔍',
    glowClass: 'shadow-purple-500/20',
  },
  on_break: {
    label: 'On Break',
    labelBn: 'বিরতিতে',
    color: '#f97316',
    bgClass: 'bg-orange-500/20 dark:bg-orange-500/10',
    borderClass: 'border-orange-500 dark:border-orange-400',
    textClass: 'text-orange-700 dark:text-orange-300',
    pulseClass: '',
    icon: '☕',
    glowClass: 'shadow-orange-500/20',
  },
  maintenance: {
    label: 'Maintenance',
    labelBn: 'মেরামতে',
    color: '#ef4444',
    bgClass: 'bg-red-500/20 dark:bg-red-500/10',
    borderClass: 'border-red-500 dark:border-red-400',
    textClass: 'text-red-700 dark:text-red-300',
    pulseClass: '',
    icon: '🚫',
    glowClass: 'shadow-red-500/20',
  },
};

export const TECHNICIAN_STATUS_CONFIG: Record<TechnicianStatus, {
  label: string;
  dotClass: string;
  ringClass: string;
}> = {
  working: {
    label: 'Working',
    dotClass: 'bg-emerald-500',
    ringClass: 'ring-emerald-500',
  },
  on_break: {
    label: 'On Break',
    dotClass: 'bg-orange-500',
    ringClass: 'ring-orange-500',
  },
  idle: {
    label: 'Idle',
    dotClass: 'bg-gray-400',
    ringClass: 'ring-gray-400',
  },
  absent: {
    label: 'Absent',
    dotClass: 'bg-red-500',
    ringClass: 'ring-red-500',
  },
};

export const PRIORITY_CONFIG = {
  normal: { badge: 'bg-slate-100 text-slate-700', label: 'Normal' },
  urgent: { badge: 'bg-red-100 text-red-700', label: 'Urgent' },
  vip: { badge: 'bg-amber-100 text-amber-700', label: 'VIP' },
};

// Ramp layout grid (customize per dealer)
export const DEFAULT_MAP_LAYOUT = {
  columns: 4,
  rows: 3,
  gapPx: 16,
};

export const REFRESH_INTERVAL_MS = 5000;
export const ELAPSED_UPDATE_MS = 1000;
