import React from 'react';
import { View, StyleSheet, DimensionValue } from 'react-native';
import { MotiView } from 'moti';

interface SkeletonProps {
    className?: string; // Kept for compatibility, though style is preferred
    width?: DimensionValue;
    height?: DimensionValue;
    borderRadius?: number;
    style?: any;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    width = '100%',
    height = 20,
    borderRadius = 12,
    style
}) => {
    return (
        <MotiView
            from={{ opacity: 0.4 }}
            animate={{ opacity: 0.7 }}
            transition={{
                type: 'timing',
                duration: 1000,
                loop: true,
            }}
            style={[
                {
                    width,
                    height,
                    borderRadius,
                    backgroundColor: 'rgba(30, 41, 59, 0.5)',
                },
                style
            ]}
        />
    );
};

export const JobCardSkeleton = () => (
    <View style={styles.card}>
        <View style={styles.rowBetween}>
            <View>
                <Skeleton width={60} height={12} style={{ marginBottom: 8 }} />
                <Skeleton width={140} height={20} />
            </View>
            <Skeleton width={70} height={20} borderRadius={6} />
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <Skeleton width={80} height={16} borderRadius={4} />
            <Skeleton width={40} height={16} borderRadius={4} />
        </View>
        <View style={[styles.rowBetween, styles.footer]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Skeleton width={24} height={24} borderRadius={12} />
                <Skeleton width={80} height={14} />
            </View>
            <Skeleton width={16} height={16} />
        </View>
    </View>
);

export const DetailSkeleton = () => (
    <View style={{ gap: 24, padding: 16 }}>
        <View style={styles.detailCard}>
            <View style={styles.rowBetween}>
                <View>
                    <Skeleton width={180} height={32} style={{ marginBottom: 8 }} />
                    <Skeleton width={100} height={16} />
                </View>
                <Skeleton width={100} height={28} borderRadius={14} />
            </View>
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 24 }}>
                <Skeleton height={20} style={{ flex: 1 }} />
                <Skeleton height={20} style={{ flex: 1 }} />
            </View>
            <Skeleton height={80} borderRadius={16} style={{ marginTop: 24 }} />
        </View>
        <View style={{ gap: 12 }}>
            <Skeleton width={100} height={14} style={{ marginLeft: 8 }} />
            <Skeleton height={60} borderRadius={16} />
            <Skeleton height={60} borderRadius={16} />
        </View>
    </View>
);

export const DashboardSkeleton = () => (
    <View style={{ gap: 24 }}>
        <View style={{ paddingHorizontal: 16 }}>
            <Skeleton height={80} borderRadius={16} style={{ backgroundColor: 'rgba(30, 58, 138, 0.2)' }} />
        </View>
        <View style={{ paddingHorizontal: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
            <Skeleton height={80} borderRadius={12} style={{ width: '100%' }} />
            <Skeleton height={80} borderRadius={12} style={{ width: '47%' }} />
            <Skeleton height={80} borderRadius={12} style={{ width: '47%' }} />
            <Skeleton height={100} borderRadius={16} style={{ width: '100%' }} />
        </View>
        <View style={{ paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skeleton width={120} height={24} />
            <Skeleton width={32} height={32} borderRadius={8} />
        </View>
        <View style={{ paddingHorizontal: 16, gap: 16 }}>
            <JobCardSkeleton />
            <JobCardSkeleton />
        </View>
    </View>
);

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        borderColor: '#1e293b',
        borderWidth: 1,
        padding: 16,
        borderRadius: 24,
    },
    detailCard: {
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        borderColor: '#1e293b',
        borderWidth: 1,
        borderRadius: 32,
        padding: 24,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    footer: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(30, 41, 59, 0.5)',
        alignItems: 'center',
    }
});
