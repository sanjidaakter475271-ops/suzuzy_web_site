import React from 'react';
import { View, Text } from 'react-native';
import { CheckCircle, Clock, AlertCircle, PauseCircle, ShieldCheck, XCircle } from 'lucide-react-native';
import { JobStatus } from '../../types';
import { COLORS } from '../../constants/theme';

interface StatusBadgeProps {
  status: JobStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStatusConfig = (status: JobStatus) => {
    switch (status) {
      case JobStatus.COMPLETED:
      case JobStatus.QC_PASSED:
      case JobStatus.VERIFIED:
        return {
          label: status === JobStatus.COMPLETED ? 'DONE' : status.replace('_', ' ').toUpperCase(),
          color: 'text-success',
          bgColor: 'bg-success/10',
          borderColor: 'border-success/20',
          Icon: CheckCircle,
        };
      case JobStatus.IN_PROGRESS:
        return {
          label: 'ACTIVE',
          color: 'text-primary',
          bgColor: 'bg-primary/10',
          borderColor: 'border-primary/20',
          Icon: Clock,
        };
      case JobStatus.PENDING:
      case JobStatus.QC_PENDING:
        return {
          label: status.replace('_', ' ').toUpperCase(),
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          borderColor: 'border-warning/20',
          Icon: AlertCircle,
        };
      case JobStatus.PAUSED:
        return {
          label: 'PAUSED',
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          borderColor: 'border-warning/20',
          Icon: PauseCircle,
        };
      case JobStatus.QC_FAILED:
        return {
          label: 'QC FAILED',
          color: 'text-danger',
          bgColor: 'bg-danger/10',
          borderColor: 'border-danger/20',
          Icon: XCircle,
        };
      default:
        return {
          label: (status as string).toUpperCase(),
          color: 'text-slate-400',
          bgColor: 'bg-slate-400/10',
          borderColor: 'border-slate-400/20',
          Icon: AlertCircle,
        };
    }
  };

  const config = getStatusConfig(status);
  const { Icon } = config;

  const paddingClasses = size === 'sm' ? 'px-2 py-0.5' : 'px-3 py-1';
  const textClasses = size === 'sm' ? 'text-[10px]' : 'text-[11px]';
  const iconSize = size === 'sm' ? 10 : 12;

  const getIconColor = (colorClass: string) => {
    switch (colorClass) {
      case 'text-success': return COLORS.success;
      case 'text-primary': return COLORS.primary;
      case 'text-warning': return COLORS.warning;
      case 'text-danger': return COLORS.danger;
      default: return COLORS.slate400;
    }
  };

  return (
    <View
      className={`flex-row items-center rounded-full border ${config.bgColor} ${config.borderColor} ${paddingClasses}`}
    >
      <Icon size={iconSize} color={getIconColor(config.color)} strokeWidth={3} />
      <Text
        className={`ml-1 font-black tracking-widest ${config.color} ${textClasses}`}
      >
        {config.label}
      </Text>
    </View>
  );
};
