import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import {
    User as UserIcon,
    Settings,
    LogOut,
    Award,
    TrendingUp,
    Clock,
    ChevronRight,
    Star,
    Target,
    Store
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { TechnicianAPI } from '../../services/api';
import { useAuth } from '../../lib/auth';
import { TopBar } from '../../components/TopBar';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

const MenuItem = ({ icon, label, sub, onClick }: { icon: React.ReactNode, label: string, sub: string, onClick?: () => void }) => (
    <TouchableOpacity
        onPress={onClick}
        style={styles.menuItem}
        activeOpacity={0.7}
    >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View style={styles.menuIconContainer}>
                {icon}
            </View>
            <View>
                <Text style={styles.menuLabel}>{label}</Text>
                <Text style={styles.menuSub}>{sub}</Text>
            </View>
        </View>
        <ChevronRight size={18} color={COLORS.slate700} />
    </TouchableOpacity>
);

export default function Profile() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [statsRes, profileRes] = await Promise.all([
                    TechnicianAPI.getDashboardStats(),
                    TechnicianAPI.getProfile()
                ]);

                if (statsRes.data.success) {
                    setStats(statsRes.data.data.stats);
                }

                if (profileRes.data.success) {
                    setProfile(profileRes.data.data);
                }
            } catch (err) {
                console.error("Error fetching profile data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleLogout = async () => {
        await signOut();
    };

    const handleAchievementsClick = () => {
        Alert.alert("Coming Soon", "The Achievements feature is currently in development. Stay tuned!");
    };

    const stats_cards = [
        { label: 'Efficiency', value: `${stats?.efficiency_score || 0}%`, icon: <TrendingUp size={18} color={COLORS.success} /> },
        { label: 'Avg Rating', value: stats?.average_rating || 'N/A', icon: <Star size={18} color={COLORS.warning} /> },
        { label: 'Hours', value: stats?.hours_worked || 0, icon: <Clock size={18} color={COLORS.primary} /> }
    ];

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: COLORS.slate950 }}>
                <TopBar title="Profile" />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.slate950 }}>
            <TopBar title="Profile" />
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: SPACING.md, paddingBottom: 100 }}>
                {/* Header Card */}
                <LinearGradient
                    colors={['rgba(37, 99, 235, 0.15)', 'rgba(67, 56, 202, 0.15)']}
                    style={styles.headerCard}
                >
                    <View style={styles.avatarGlow} />
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatarInner}>
                            {profile?.avatar_url ? (
                                <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
                            ) : (
                                <UserIcon size={40} color={COLORS.primary} style={{ opacity: 0.8 }} />
                            )}
                        </View>
                    </View>

                    <Text style={styles.profileName}>{profile?.name || user?.name || 'Technician'}</Text>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>{(profile?.role || user?.role || 'TECHNICIAN').replace('_', ' ')}</Text>
                    </View>

                    <View style={styles.idBadge}>
                        <Text style={styles.idText}>ID: {(profile?.id || user?.id || '00000000').slice(0, 8).toUpperCase()}</Text>
                    </View>

                    {profile?.dealer && (
                        <View style={styles.dealerInfo}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                <Store size={12} color={COLORS.primaryLight} />
                                <Text style={styles.dealerLabel}>Official Dealer</Text>
                            </View>
                            <Text style={styles.dealerName}>{profile.dealer.name}</Text>
                        </View>
                    )}
                </LinearGradient>

                {/* Performance Grid */}
                <View style={styles.statsGrid}>
                    {stats_cards.map((card, i) => (
                        <View key={i} style={styles.statCard}>
                            <View style={styles.statIconContainer}>{card.icon}</View>
                            <Text style={styles.statValue}>{card.value}</Text>
                            <Text style={styles.statLabel}>{card.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Menu Items */}
                <View style={styles.menuContainer}>
                    <MenuItem
                        icon={<Award color={COLORS.warning} size={20} />}
                        label="Achievements"
                        sub="Unlock badges for quality service"
                        onClick={handleAchievementsClick}
                    />
                    <MenuItem
                        icon={<TrendingUp color={COLORS.success} size={20} />}
                        label="Performance Stats"
                        sub="View detailed metrics"
                        onClick={() => router.push('/performance')}
                    />
                    <MenuItem
                        icon={<Target color={COLORS.primary} size={20} />}
                        label="Work History"
                        sub="Completed jobs log"
                        onClick={() => router.push('/work-history')}
                    />
                    <MenuItem
                        icon={<Settings color={COLORS.slate500} size={20} />}
                        label="Account Settings"
                        sub="Security & Preferences"
                        onClick={() => router.push('/settings')}
                    />
                </View>

                <TouchableOpacity
                    onPress={handleLogout}
                    style={styles.logoutBtn}
                    activeOpacity={0.8}
                >
                    <LogOut size={16} color={COLORS.danger} />
                    <Text style={styles.logoutBtnText}>Terminate Session</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    headerCard: {
        padding: SPACING.xl,
        borderRadius: BORDER_RADIUS.xxl,
        borderWidth: 1,
        borderColor: COLORS.darkBorder,
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative'
    },
    avatarGlow: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 200,
        height: 200,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderRadius: 999
    },
    avatarContainer: {
        width: 96,
        height: 96,
        borderRadius: BORDER_RADIUS.lg,
        backgroundColor: 'rgba(59, 130, 246, 0.3)',
        padding: 4,
        marginBottom: SPACING.md
    },
    avatarInner: {
        width: '100%',
        height: '100%',
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.slate900,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.darkBorder
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover'
    },
    profileName: {
        fontSize: TYPOGRAPHY.sizes.xxl,
        fontFamily: TYPOGRAPHY.families.bold,
        color: COLORS.white,
        marginBottom: SPACING.sm
    },
    roleBadge: {
        backgroundColor: COLORS.infoBg,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.full,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.2)',
        marginBottom: SPACING.md
    },
    roleText: {
        fontSize: TYPOGRAPHY.sizes.xxs,
        fontFamily: TYPOGRAPHY.families.black,
        color: COLORS.primaryLight,
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    idBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.full,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)'
    },
    idText: {
        fontSize: 9,
        fontFamily: TYPOGRAPHY.families.black,
        color: COLORS.slate400,
        textTransform: 'uppercase',
        letterSpacing: 2
    },
    dealerInfo: {
        marginTop: SPACING.lg,
        paddingTop: SPACING.lg,
        borderTopWidth: 1,
        borderTopColor: COLORS.darkBorder,
        width: '100%',
        alignItems: 'center'
    },
    dealerLabel: {
        fontSize: TYPOGRAPHY.sizes.xxs,
        fontFamily: TYPOGRAPHY.families.bold,
        color: COLORS.primaryLight,
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    dealerName: {
        fontSize: TYPOGRAPHY.sizes.sm,
        fontFamily: TYPOGRAPHY.families.bold,
        color: COLORS.white
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginTop: SPACING.lg
    },
    statCard: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.xl,
        borderWidth: 1,
        borderColor: COLORS.darkBorder,
        alignItems: 'center',
        justifyContent: 'center'
    },
    statIconContainer: {
        marginBottom: SPACING.sm,
        padding: SPACING.sm,
        backgroundColor: COLORS.infoBg,
        borderRadius: BORDER_RADIUS.lg
    },
    statValue: {
        fontSize: TYPOGRAPHY.sizes.xl,
        fontFamily: TYPOGRAPHY.families.bold,
        color: COLORS.white,
        fontStyle: 'italic'
    },
    statLabel: {
        fontSize: 8,
        fontFamily: TYPOGRAPHY.families.black,
        color: COLORS.slate500,
        textTransform: 'uppercase',
        marginTop: 4,
        letterSpacing: 1
    },
    menuContainer: {
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        borderRadius: BORDER_RADIUS.xxl,
        overflow: 'hidden',
        marginTop: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.darkBorder
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.darkBorder
    },
    menuIconContainer: {
        padding: 10,
        backgroundColor: COLORS.slate950,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.darkBorder
    },
    menuLabel: {
        fontSize: TYPOGRAPHY.sizes.sm,
        fontFamily: TYPOGRAPHY.families.bold,
        color: COLORS.slate100
    },
    menuSub: {
        fontSize: TYPOGRAPHY.sizes.xxs,
        color: COLORS.slate500,
        textTransform: 'uppercase',
        marginTop: 2,
        letterSpacing: 0.5,
        fontFamily: TYPOGRAPHY.families.medium
    },
    logoutBtn: {
        width: '100%',
        backgroundColor: COLORS.dangerBg,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
        paddingVertical: 20,
        borderRadius: BORDER_RADIUS.xxl,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginTop: SPACING.xl
    },
    logoutBtnText: {
        color: COLORS.danger,
        fontSize: TYPOGRAPHY.sizes.xxs,
        fontFamily: TYPOGRAPHY.families.black,
        textTransform: 'uppercase',
        letterSpacing: 2
    }
});
