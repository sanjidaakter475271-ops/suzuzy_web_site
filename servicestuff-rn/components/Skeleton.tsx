import React, { useEffect } from 'react';
import { View, StyleSheet, DimensionValue } from 'react-native';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withRepeat, 
    withTiming, 
    Easing 
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

interface SkeletonProps {
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
    const shimmerValue = useSharedValue(0);

    useEffect(() => {
        shimmerValue.value = withRepeat(
            withTiming(1, { 
                duration: 1500, 
                easing: Easing.bezier(0.4, 0, 0.2, 1) 
            }),
            -1, // Infinite
            false
        );
    }, []);

    const shimmerStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateX: -100 + (shimmerValue.value * 300) // Simple shimmer pass
                }
            ],
        };
    });

    return (
        <View 
            style={[
                {
                    width,
                    height,
                    borderRadius,
                    backgroundColor: COLORS.border,
                    overflow: 'hidden',
                },
                style
            ]}
        >
            <Animated.View style={[{ width: '100%', height: '100%' }, shimmerStyle]}>
                <LinearGradient
                    colors={['transparent', 'rgba(255, 255, 255, 0.05)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ width: '100%', height: '100%' }}
                />
            </Animated.View>
        </View>
    );
};

export const JobCardSkeleton = () => (
    <View style={styles.card}>
        <View style={styles.rowBetween}>
            <View>
                <Skeleton width={60} height={12} style={{ marginBottom: 8 }} />
                <Skeleton width={140} height={20} />
            </View>
            <Skeleton width={80} height={24} borderRadius={8} />
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
            <Skeleton width={90} height={18} borderRadius={6} />
            <Skeleton width={50} height={18} borderRadius={6} />
        </View>
        <View style={styles.divider} />
        <View style={styles.rowBetween}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Skeleton width={28} height={28} borderRadius={14} />
                <Skeleton width={100} height={14} />
            </View>
            <Skeleton width={16} height={16} />
        </View>
    </View>
);

export const DashboardSkeleton = () => (
    <View style={{ gap: 24, paddingVertical: 16 }}>
        <View style={{ paddingHorizontal: 16 }}>
            <Skeleton height={140} borderRadius={24} style={{ backgroundColor: COLORS.primarySurface }} />
        </View>
        <View style={{ paddingHorizontal: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between' }}>
            <Skeleton height={100} borderRadius={20} style={{ width: '47%' }} />
            <Skeleton height={100} borderRadius={20} style={{ width: '47%' }} />
            <Skeleton height={80} borderRadius={16} style={{ width: '100%' }} />
        </View>
        <View style={{ paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skeleton width={140} height={24} />
            <Skeleton width={36} height={36} borderRadius={10} />
        </View>
        <View style={{ paddingHorizontal: 16, gap: 16 }}>
            <JobCardSkeleton />
            <JobCardSkeleton />
        </View>
    </View>
);

export const AttendanceSkeleton = () => (
    <View style={{ gap: 20, padding: 16 }}>
        <Skeleton height={200} borderRadius={24} />
        <Skeleton height={40} width={150} style={{ marginTop: 10 }} />
        <Skeleton height={300} borderRadius={24} />
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
            {[1, 2, 3, 4].map(i => <Skeleton key={i} height={30} style={{ flex: 1 }} borderRadius={8} />)}
        </View>
    </View>
);

export const NotificationSkeleton = () => (
    <View style={{ gap: 12, padding: 16 }}>
        {[1, 2, 3, 4, 5].map(i => (
            <View key={i} style={styles.card}>
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                    <Skeleton width={48} height={48} borderRadius={24} />
                    <View style={{ flex: 1, gap: 6 }}>
                        <Skeleton height={16} width="80%" />
                        <Skeleton height={12} width="40%" />
                    </View>
                </View>
            </View>
        ))}
    </View>
);

export const ProfileSkeleton = () => (
    <View style={{ padding: 16, gap: 24 }}>
        <View style={{ alignItems: 'center', gap: 16, marginTop: 20 }}>
            <Skeleton width={100} height={100} borderRadius={50} />
            <Skeleton width={180} height={24} />
            <Skeleton width={120} height={14} />
        </View>
        <View style={{ gap: 12, marginTop: 20 }}>
            {[1, 2, 3, 4].map(i => <Skeleton key={i} height={60} borderRadius={16} />)}
        </View>
    </View>
);

export const PerformanceSkeleton = () => (
    <View style={{ gap: 24, padding: 16 }}>
        <Skeleton height={200} borderRadius={32} />
        <Skeleton height={180} borderRadius={32} />
        <View style={{ flexDirection: 'row', gap: 12 }}>
            <Skeleton height={120} borderRadius={24} style={{ flex: 1 }} />
            <Skeleton height={120} borderRadius={24} style={{ flex: 1 }} />
        </View>
        <Skeleton height={150} borderRadius={32} />
    </View>
);

export const SettingsSkeleton = () => (
    <View style={{ gap: 24, padding: 16 }}>
        <Skeleton height={200} borderRadius={32} />
        <Skeleton width={120} height={14} style={{ marginTop: 24, marginLeft: 8 }} />
        <Skeleton height={150} borderRadius={24} />
        <Skeleton width={120} height={14} style={{ marginTop: 12, marginLeft: 8 }} />
        <Skeleton height={200} borderRadius={24} />
    </View>
);

export const DetailSkeleton = () => (
    <View style={{ gap: 24, padding: 16 }}>
        <Skeleton height={180} borderRadius={32} />
        <View style={{ flexDirection: 'row', gap: 12, height: 60 }}>
            <Skeleton borderRadius={16} style={{ flex: 1 }} />
            <Skeleton borderRadius={16} style={{ flex: 1 }} />
            <Skeleton borderRadius={16} style={{ flex: 1 }} />
        </View>
        <Skeleton height={300} borderRadius={32} />
        <View style={{ gap: 12 }}>
            <Skeleton height={80} borderRadius={24} />
            <Skeleton height={80} borderRadius={24} />
        </View>
    </View>
);

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.cardBg,
        borderColor: COLORS.border,
        borderWidth: 1,
        padding: 16,
        borderRadius: 24,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.divider,
        marginVertical: 16,
    }
});
