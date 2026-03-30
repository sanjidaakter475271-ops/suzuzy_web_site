import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import {
    TrendingUp,
    Target,
    Award,
    Zap,
    Clock,
    CheckCircle,
    ChevronRight,
    Trophy,
    Flame,
    WifiOff
} from 'lucide-react-native';
import { MotiView } from 'moti';
import Svg, { Circle } from 'react-native-svg';

import { TechnicianAPI } from '../services/api';
import { DashboardStats } from '../types';
import { TopBar } from '../components/TopBar';
import { OfflineService } from '../services/offline';

const TargetProgress = ({ label, current, target, color }: { label: string, current: number, target: number, color: string }) => {
    const percentage = Math.min((current / target) * 100, 100);
    return (
        <View style={{ gap: 6, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.targetLabel}>{label}</Text>
                <Text style={styles.targetValue}>{current}/{target}</Text>
            </View>
            <View style={styles.progressBarBg}>
                <MotiView
                    from={{ width: '0%' }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ type: 'timing', duration: 1000 }}
                    style={[styles.progressBarFill, { backgroundColor: color }]}
                />
            </View>
        </View>
    );
};

export default function Performance() {
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const offlineService = OfflineService.getInstance();
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const onlineStatus = offlineService.getOnlineStatus();
                setIsOnline(onlineStatus);

                if (!onlineStatus) {
                    const cached = await offlineService.getCachedStats();
                    if (cached) {
                        setStats(cached);
                        setLoading(false);
                        return;
                    }
                }

                const res = await TechnicianAPI.getDashboardStats();
                setStats(res.data.data.stats);
                await offlineService.cacheStats(res.data.data.stats);
            } catch (err) {
                console.error("Error fetching stats:", err);
                const cached = await offlineService.getCachedStats();
                if (cached) setStats(cached);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const badges = [
        { id: 1, name: 'Speed Demon', icon: <Flame color="#f97316" size={24} />, desc: 'Finished 5 jobs under estimated time', unlocked: true },
        { id: 2, name: 'Precision Pro', icon: <Target color="#3b82f6" size={24} />, desc: 'Zero QC failures this month', unlocked: true },
        { id: 3, name: 'Customer Hero', icon: <Award color="#f59e0b" size={24} />, desc: 'Maintain 4.8+ rating', unlocked: false },
    ];

    const renderEfficiencyCircle = () => {
        const score = stats?.efficiency_score || 0;
        const radius = 58;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (score / 100) * circumference;

        return (
            <View style={styles.heroCircleContainer}>
                <Svg width="130" height="130" viewBox="0 0 130 130" style={{ transform: [{ rotate: '-90deg' }] }}>
                    <Circle
                        cx="65"
                        cy="65"
                        r={radius}
                        stroke="#1e293b"
                        strokeWidth="8"
                        fill="transparent"
                    />
                    <Circle
                        cx="65"
                        cy="65"
                        r={radius}
                        stroke="#3b82f6"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                    />
                </Svg>
                <View style={styles.heroScoreContainer}>
                    <Text style={styles.heroScoreText}>{score}%</Text>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#020617' }}>
                <TopBar title="Performance" />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                </View>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#020617' }}>
            <TopBar title="Performance" showBack onBack={() => router.back()} />

            {!isOnline && (
                <View style={styles.offlineBanner}>
                    <WifiOff size={14} color="#f59e0b" />
                    <Text style={styles.offlineText}>Offline - Showing Cached Progress</Text>
                </View>
            )}

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
                {/* Efficiency Hero */}
                <View style={styles.heroCard}>
                    <View style={styles.heroLine} />
                    <Text style={styles.heroLabel}>Overall Efficiency</Text>
                    {renderEfficiencyCircle()}
                    <View style={styles.heroComparison}>
                        <TrendingUp size={16} color="#10b981" />
                        <Text style={styles.comparisonText}>+4% vs last week</Text>
                    </View>
                </View>

                {/* Activity Chart */}
                <View style={styles.chartCard}>
                    <View style={styles.cardHeader}>
                        <Flame size={18} color="#f97316" />
                        <Text style={styles.cardTitle}>Activity History</Text>
                    </View>

                    <View style={styles.chartContainer}>
                        {(stats?.daily_performance || [
                            { day: 'M', jobs: 4 }, { day: 'T', jobs: 6 }, { day: 'W', jobs: 3 },
                            { day: 'T', jobs: 8 }, { day: 'F', jobs: 5 }, { day: 'S', jobs: 2 }, { day: 'S', jobs: 0 }
                        ]).map((d, i) => (
                            <View key={i} style={styles.chartBarGroup}>
                                <View style={styles.chartBarBg}>
                                    <MotiView
                                        from={{ height: '0%' }}
                                        animate={{ height: `${(d.jobs / 10) * 100}%` }}
                                        transition={{ type: 'timing', duration: 1000, delay: i * 100 }}
                                        style={styles.chartBarFill}
                                    />
                                </View>
                                <Text style={styles.chartDayText}>{d.day}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* KPI Grid */}
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
                    <View style={styles.kpiCard}>
                        <View style={[styles.kpiIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.2)' }]}>
                            <Clock size={20} color="#3b82f6" />
                        </View>
                        <Text style={styles.kpiValue}>{stats?.hours_worked || 0}</Text>
                        <Text style={styles.kpiLabel}>Hours Logged</Text>
                    </View>
                    <View style={styles.kpiCard}>
                        <View style={[styles.kpiIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' }]}>
                            <CheckCircle size={20} color="#10b981" />
                        </View>
                        <Text style={styles.kpiValue}>{stats?.completed || 0}</Text>
                        <Text style={styles.kpiLabel}>Jobs Completed</Text>
                    </View>
                </View>

                {/* Targets */}
                <View style={styles.sectionCard}>
                    <View style={[styles.cardHeader, { marginBottom: 20 }]}>
                        <Target size={18} color="#f43f5e" />
                        <Text style={styles.cardTitle}>Weekly Targets</Text>
                    </View>
                    <TargetProgress label="Total Jobs" current={stats?.completed || 0} target={20} color="#3b82f6" />
                    <TargetProgress label="Work Hours" current={stats?.hours_worked || 0} target={40} color="#6366f1" />
                    <TargetProgress label="Efficiency" current={stats?.efficiency_score || 0} target={90} color="#10b981" />
                </View>

                {/* Achievements */}
                <View style={{ marginTop: 24 }}>
                    <View style={[styles.cardHeader, { marginBottom: 16, paddingHorizontal: 8 }]}>
                        <Trophy size={16} color="#f59e0b" />
                        <Text style={styles.sectionTitle}>Achievements</Text>
                    </View>
                    <View style={{ gap: 12 }}>
                        {badges.map(badge => (
                            <View
                                key={badge.id}
                                style={[
                                    styles.badgeCard,
                                    !badge.unlocked && { opacity: 0.5 }
                                ]}
                            >
                                <View style={[styles.badgeIconBg, !badge.unlocked && { backgroundColor: '#020617', borderColor: '#1e293b' }]}>
                                    {badge.icon}
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.badgeName}>{badge.name}</Text>
                                    <Text style={styles.badgeDesc}>{badge.desc}</Text>
                                </View>
                                {badge.unlocked ? (
                                    <CheckCircle size={16} color="#10b981" />
                                ) : (
                                    <Zap size={16} color="#1e293b" />
                                )}
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    offlineBanner: { backgroundColor: 'rgba(245, 158, 11, 0.1)', borderBottomWidth: 1, borderBottomColor: 'rgba(245, 158, 11, 0.2)', paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    offlineText: { fontSize: 10, fontWeight: 'bold', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: 1 },
    heroCard: { backgroundColor: '#0f172a', borderRadius: 32, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: '#1e293b', overflow: 'hidden' },
    heroLine: { position: 'absolute', top: 0, left: 0, right: 0, height: 4, backgroundColor: '#3b82f6', opacity: 0.5 },
    heroLabel: { fontSize: 10, fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 },
    heroCircleContainer: { position: 'relative', width: 130, height: 130, alignItems: 'center', justifyContent: 'center' },
    heroScoreContainer: { position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' },
    heroScoreText: { fontSize: 32, fontWeight: 'bold', color: 'white' },
    heroComparison: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 24 },
    comparisonText: { fontSize: 13, fontWeight: 'bold', color: '#10b981' },
    chartCard: { backgroundColor: '#0f172a', borderRadius: 32, padding: 24, marginVertical: 24, borderWidth: 1, borderColor: '#1e293b' },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    cardTitle: { fontSize: 14, fontWeight: 'bold', color: 'white' },
    chartContainer: { flexDirection: 'row', height: 100, alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 32, gap: 12 },
    chartBarGroup: { flex: 1, alignItems: 'center', gap: 8 },
    chartBarBg: { width: '100%', height: '100%', backgroundColor: '#020617', borderRadius: 99, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    chartBarFill: { width: '100%', backgroundColor: '#3b82f6', borderRadius: 99 },
    chartDayText: { fontSize: 10, fontWeight: 'bold', color: '#475569' },
    kpiCard: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#1e293b' },
    kpiIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, marginBottom: 16 },
    kpiValue: { fontSize: 24, fontWeight: 'bold', color: 'white' },
    kpiLabel: { fontSize: 10, fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginTop: 4 },
    sectionCard: { backgroundColor: '#0f172a', borderRadius: 32, padding: 24, borderWidth: 1, borderColor: '#1e293b' },
    targetLabel: { fontSize: 12, color: '#94a3b8', fontWeight: 'bold' },
    targetValue: { fontSize: 12, color: '#cbd5e1', fontWeight: 'bold' },
    progressBarBg: { height: 8, backgroundColor: '#020617', borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 4 },
    sectionTitle: { fontSize: 10, fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: 2 },
    badgeCard: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: 'rgba(15, 23, 42, 0.4)', padding: 16, borderRadius: 24, borderWidth: 1, borderColor: '#1e293b' },
    badgeIconBg: { width: 48, height: 48, backgroundColor: '#0f172a', borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#334155' },
    badgeName: { fontSize: 14, fontWeight: 'bold', color: '#f1f5f9' },
    badgeDesc: { fontSize: 11, color: '#64748b', marginTop: 2 }
});
