import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { ChevronRight } from '@/components/icons';
import { MotiView } from 'moti';
import { JobCard } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '@/constants/theme';

interface MyJobCardProps {
    job: JobCard;
    onClick: (id: string) => void;
    isInitialMount: boolean;
}

const MyJobCard = React.memo(({ job, onClick, isInitialMount }: MyJobCardProps) => (
    <MotiView
        from={isInitialMount ? { opacity: 0, translateY: 20 } : false}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 200 }}
    >
        <TouchableOpacity
            onPress={() => onClick(job.id)}
            style={{ backgroundColor: 'rgba(30, 64, 175, 0.12)', borderColor: 'rgba(30, 64, 175, 0.25)', borderWidth: 1, padding: 16, borderRadius: 24, marginBottom: 16, ...SHADOWS.sm }}
            activeOpacity={0.8}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <View>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: COLORS.textTertiary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                        {job.ticket?.ticket_number || 'ST-0000'}
                    </Text>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary }}>
                        {job.vehicle?.model_name || 'Vehicle'}
                    </Text>
                </View>
                <StatusBadge status={job.status} size="sm" />
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <View style={{ backgroundColor: COLORS.cardBgAlt, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: COLORS.border, marginRight: 8 }}>
                    <Text style={{ fontSize: 10, color: COLORS.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
                        {job.vehicle?.license_plate || 'N/A'}
                    </Text>
                </View>
                <Text style={{ fontSize: 10, color: COLORS.textTertiary }}>
                    {job.vehicle?.color || 'N/A'}
                </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.divider }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.cardBgAlt, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border }}>
                        <Text style={{ fontSize: 10, fontWeight: 'bold', color: COLORS.textSecondary }}>
                            {job.vehicle?.customer_name?.charAt(0) || '?'}
                        </Text>
                    </View>
                    <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginLeft: 8 }}>
                        {job.vehicle?.customer_name || 'Anonymous'}
                    </Text>
                </View>
                <ChevronRight size={16} color={COLORS.textTertiary} />
            </View>
        </TouchableOpacity>
    </MotiView>
), (prev, next) => prev.job.id === next.job.id && prev.job.status === next.job.status && prev.job.vehicle?.model_name === next.job.vehicle?.model_name);

MyJobCard.displayName = 'MyJobCard';

export default MyJobCard;
