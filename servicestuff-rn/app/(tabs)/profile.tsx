import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, Alert } from 'react-native';
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
import { MaterialCircularProgress } from '../../components/ui/Loading';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { ProfileSkeleton } from '../../components/Skeleton';

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
        <ChevronRight size={18} color={COLORS.textTertiary} />
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
            <View style={{ flex: 1, backgroundColor: COLORS.pageBg }}>
                <TopBar title="Profile" />
                <ProfileSkeleton />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.pageBg }}>
            <TopBar title="Profile" />
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: SPACING.md, paddingBottom: 100 }}>
                {/* Header Card */}
                <LinearGradient
                    colors={[COLORS.primaryLight, COLORS.primary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
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
                                <Store size={12} color="rgba(255,255,255,0.7)" />
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
                        icon={<Settings color={COLORS.textTertiary} size={20} />}
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
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
        ...SHADOWS.md
    },
    avatarGlow: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 200,
        height: 200,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 999
    },
    avatarContainer: {
        width: 96,
        height: 96,
        borderRadius: BORDER_RADIUS.lg,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        padding: 4,
        marginBottom: SPACING.md
    },
    avatarInner: {
        width: '100%',
        height: '100%',
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
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
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.full,
        marginBottom: SPACING.md
    },
    roleText: {
        fontSize: TYPOGRAPHY.sizes.xxs,
        fontFamily: TYPOGRAPHY.families.black,
        color: COLORS.white,
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    idBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.full,
    },
    idText: {
        fontSize: 9,
        fontFamily: TYPOGRAPHY.families.black,
        color: 'rgba(255, 255, 255, 0.6)',
        textTransform: 'uppercase',
        letterSpacing: 2
    },
    dealerInfo: {
        marginTop: SPACING.lg,
        paddingTop: SPACING.lg,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
        width: '100%',
        alignItems: 'center'
    },
    dealerLabel: {
        fontSize: TYPOGRAPHY.sizes.xxs,
        fontFamily: TYPOGRAPHY.families.bold,
        color: 'rgba(255, 255, 255, 0.7)',
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
        backgroundColor: COLORS.cardBg,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.sm
    },
    statIconContainer: {
        marginBottom: SPACING.sm,
        padding: SPACING.sm,
        backgroundColor: COLORS.cardBgAlt,
        borderRadius: BORDER_RADIUS.lg
    },
    statValue: {
        fontSize: TYPOGRAPHY.sizes.xl,
        fontFamily: TYPOGRAPHY.families.bold,
        color: COLORS.textPrimary,
        fontStyle: 'italic'
    },
    statLabel: {
        fontSize: 8,
        fontFamily: TYPOGRAPHY.families.black,
        color: COLORS.textTertiary,
        textTransform: 'uppercase',
        marginTop: 4,
        letterSpacing: 1
    },
    menuContainer: {
        backgroundColor: COLORS.cardBg,
        borderRadius: BORDER_RADIUS.xxl,
        overflow: 'hidden',
        marginTop: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.divider
    },
    menuIconContainer: {
        padding: 10,
        backgroundColor: COLORS.cardBgAlt,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border
    },
    menuLabel: {
        fontSize: TYPOGRAPHY.sizes.sm,
        fontFamily: TYPOGRAPHY.families.bold,
        color: COLORS.textPrimary
    },
    menuSub: {
        fontSize: TYPOGRAPHY.sizes.xxs,
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        marginTop: 2,
        letterSpacing: 0.5,
        fontFamily: TYPOGRAPHY.families.medium
    },
    logoutBtn: {
        width: '100%',
        backgroundColor: COLORS.cardBg,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingVertical: 20,
        borderRadius: BORDER_RADIUS.xxl,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginTop: SPACING.xl,
        ...SHADOWS.sm
    },
    logoutBtnText: {
        color: COLORS.danger,
        fontSize: TYPOGRAPHY.sizes.xxs,
        fontFamily: TYPOGRAPHY.families.black,
        textTransform: 'uppercase',
        letterSpacing: 2
    }
});
