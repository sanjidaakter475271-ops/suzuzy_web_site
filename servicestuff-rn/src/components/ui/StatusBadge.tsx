import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle, Clock, AlertCircle, PauseCircle, XCircle } from '@/components/icons';
import { JobStatus } from '@/types';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/theme';

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
          color: COLORS.success,
          bgColor: COLORS.successBg,
          borderColor: COLORS.success + '20',
          Icon: CheckCircle,
        };
      case JobStatus.IN_PROGRESS:
        return {
          label: 'ACTIVE',
          color: COLORS.primary,
          bgColor: COLORS.infoBg,
          borderColor: COLORS.primary + '20',
          Icon: Clock,
        };
      case JobStatus.PENDING:
      case JobStatus.QC_PENDING:
        return {
          label: status.replace('_', ' ').toUpperCase(),
          color: COLORS.warning,
          bgColor: COLORS.warningBg,
          borderColor: COLORS.warning + '20',
          Icon: AlertCircle,
        };
      case JobStatus.PAUSED:
        return {
          label: 'PAUSED',
          color: COLORS.warning,
          bgColor: COLORS.warningBg,
          borderColor: COLORS.warning + '20',
          Icon: PauseCircle,
        };
      case JobStatus.QC_FAILED:
        return {
          label: 'QC FAILED',
          color: COLORS.danger,
          bgColor: COLORS.dangerBg,
          borderColor: COLORS.danger + '20',
          Icon: XCircle,
        };
      default:
        return {
          label: (status as string).toUpperCase(),
          color: COLORS.slate400,
          bgColor: 'rgba(148, 163, 184, 0.1)',
          borderColor: 'rgba(148, 163, 184, 0.2)',
          Icon: AlertCircle,
        };
    }
  };

  const config = getStatusConfig(status);
  const { Icon } = config;

  const iconSize = size === 'sm' ? 10 : 12;

  return (
    <View
      style={[
        styles.container,
        size === 'sm' ? styles.containerSm : styles.containerMd,
        { backgroundColor: config.bgColor, borderColor: config.borderColor }
      ]}
    >
      <Icon size={iconSize} color={config.color} strokeWidth={3} />
      <Text
        style={[
          styles.text,
          size === 'sm' ? styles.textSm : styles.textMd,
          { color: config.color }
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
  },
  containerSm: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  containerMd: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  text: {
    fontFamily: TYPOGRAPHY.families.black,
    fontWeight: '900',
    letterSpacing: 1,
    marginLeft: 4,
  },
  textSm: {
    fontSize: 10,
  },
  textMd: {
    fontSize: 11,
  },
});

