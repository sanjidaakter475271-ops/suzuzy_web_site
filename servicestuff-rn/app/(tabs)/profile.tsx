import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, Alert, Dimensions, Platform } from 'react-native';
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
    Store,
    Camera,
    ShieldCheck,
    ChevronLeft
} from '@/components/icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TechnicianAPI } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import { ProfileSkeleton } from '@/components/ui/Skeleton';

const SCREEN_WIDTH = Dimensions.get('window').width;

const StatItem = ({ label, value, icon, color }: { label: string, value: string | number, icon: React.ReactNode, color: string }) => (
    <View style={styles.statContainer}>
        <View style={[styles.statIconWrapper, { backgroundColor: color + '15' }]}>
            {icon}
        </View>
        <View>
            <Text style={styles.statValueText}>{value}</Text>
            <Text style={styles.statLabelText}>{label}</Text>
        </View>
    </View>
);

export default function Profile() {
    const { user, signOut } = useAuthStore();
    const router = useRouter();
    const insets = useSafeAreaInsets();
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
        Alert.alert(
            "Logout",
            "Are you sure you want to exit?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Logout", style: "destructive", onPress: () => signOut() }
            ]
        );
    };

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: COLORS.pageBg }}>
                <ProfileSkeleton />
            </View>
        );
    }

    const userAvatar = profile?.avatar_url || null;

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.pageBg }}>
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                {/* Facebook Style Cover Section */}
                <View style={styles.coverWrapper}>
                    {userAvatar ? (
                        <Image 
                            source={{ uri: userAvatar }} 
                            style={styles.coverImage} 
                            blurRadius={Platform.OS === 'ios' ? 40 : 70} 
                        />
                    ) : (
                        <LinearGradient 
                            colors={[COLORS.primary, COLORS.primaryDark]} 
                            style={styles.coverImage} 
                        />
                    )}
                    <LinearGradient
                        colors={['transparent', COLORS.pageBg]}
                        style={styles.coverGradient}
                    />
                    
                    {/* Header Controls */}
                    <View style={[styles.headerControls, { top: insets.top + 10 }]}>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.headerIconBtn}
                        >
                            <ChevronLeft size={20} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => router.push('/settings')}
                            style={styles.headerIconBtn}
                        >
                            <Settings size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Profile Info Overlay Section */}
                <View style={styles.profileSection}>
                    <View style={styles.avatarWrapper}>
                        <View style={styles.avatarMain}>
                            {userAvatar ? (
                                <Image source={{ uri: userAvatar }} style={styles.avatarImg} />
                            ) : (
                                <UserIcon size={50} color={COLORS.primary} />
                            )}
                        </View>
                        <TouchableOpacity style={styles.cameraBtn}>
                            <Camera size={14} color="white" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.mainInfo}>
                        <Text style={styles.nameText}>{profile?.name || user?.name || 'Technician'}</Text>
                        <View style={styles.badgeRow}>
                            <View style={styles.proBadge}>
                                <ShieldCheck size={12} color={COLORS.accent} />
                                <Text style={styles.proBadgeText}>Verified Staff</Text>
                            </View>
                            <Text style={styles.dot}>•</Text>
                            <Text style={styles.roleSubText}>{(profile?.role || user?.role || 'Technician').replace('_', ' ')}</Text>
                        </View>
                    </View>

                    {/* Quick Stats Grid */}
                    <View style={styles.quickStatsRow}>
                        <StatItem 
                            label="Efficiency" 
                            value={`${stats?.efficiency_score || 0}%`} 
                            icon={<TrendingUp size={16} color={COLORS.success} />}
                            color={COLORS.success}
                        />
                        <View style={styles.statDivider} />
                        <StatItem 
                            label="Rating" 
                            value={stats?.average_rating || '5.0'} 
                            icon={<Star size={16} color={COLORS.warning} />}
                            color={COLORS.warning}
                        />
                        <View style={styles.statDivider} />
                        <StatItem 
                            label="Hours" 
                            value={stats?.hours_worked || 0} 
                            icon={<Clock size={16} color={COLORS.primary} />}
                            color={COLORS.primary}
                        />
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionRow}>
                        <TouchableOpacity 
                            style={styles.primaryBtn}
                            onPress={() => router.push('/settings')}
                        >
                            <Settings size={18} color="white" />
                            <Text style={styles.primaryBtnText}>Manage Account</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.secondaryBtn}
                            onPress={() => router.push('/work-history')}
                        >
                            <Target size={18} color={COLORS.textPrimary} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Content Sections */}
                <View style={styles.contentPadding}>
                    <Text style={styles.sectionTitle}>Professional Status</Text>
                    <View style={styles.proCard}>
                        <View style={styles.proRow}>
                            <View style={styles.proIconBox}>
                                <Store size={22} color={COLORS.accent} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.proLabel}>Assigned Dealer</Text>
                                <Text style={styles.proValue}>{profile?.dealer?.name || 'Authorized Service Center'}</Text>
                            </View>
                        </View>
                        <LinearGradient
                            colors={['rgba(249, 115, 22, 0.2)', 'transparent']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.proCardFooter}
                        >
                            <Award size={14} color={COLORS.accent} />
                            <Text style={styles.proFooterText}>Certified Royal Enfield Technician</Text>
                        </LinearGradient>
                    </View>

                    <Text style={styles.sectionTitle}>General</Text>
                    <View style={styles.menuList}>
                        <TouchableOpacity 
                            style={styles.menuRow}
                            onPress={() => router.push('/performance')}
                        >
                            <View style={styles.menuIconBox}>
                                <TrendingUp size={20} color={COLORS.success} />
                            </View>
                            <Text style={styles.menuText}>Performance Analysis</Text>
                            <ChevronRight size={20} color={COLORS.textTertiary} />
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.menuRow}
                            onPress={() => router.push('/settings')}
                        >
                            <View style={styles.menuIconBox}>
                                <Settings size={20} color={COLORS.primary} />
                            </View>
                            <Text style={styles.menuText}>Account Settings</Text>
                            <ChevronRight size={20} color={COLORS.textTertiary} />
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.menuRow, { borderBottomWidth: 0 }]}
                            onPress={handleLogout}
                        >
                            <View style={[styles.menuIconBox, { backgroundColor: COLORS.dangerBg }]}>
                                <LogOut size={20} color={COLORS.danger} />
                            </View>
                            <Text style={[styles.menuText, { color: COLORS.danger }]}>Sign Out</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.footerInfo}>
                        <Text style={styles.versionText}>Technician Portal v1.0.4</Text>
                        <Text style={styles.copyText}>© 2026 Global Motors Limited</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    coverWrapper: {
        height: 220,
        width: '100%',
        position: 'relative',
    },
    coverImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    coverGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 100,
    },
    headerControls: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 30,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        zIndex: 10,
    },
    headerIconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileSection: {
        marginTop: -60,
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 16,
    },
    avatarMain: {
        width: 120,
        height: 120,
        borderRadius: 60,
        padding: 4,
        backgroundColor: COLORS.pageBg,
        ...SHADOWS.md,
    },
    avatarImg: {
        width: '100%',
        height: '100%',
        borderRadius: 60,
        borderWidth: 2,
        borderColor: COLORS.primarySurface,
    },
    cameraBtn: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.slate700,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: COLORS.pageBg,
    },
    mainInfo: {
        alignItems: 'center',
        marginBottom: 24,
    },
    nameText: {
        fontSize: 26,
        fontFamily: TYPOGRAPHY.families.bold,
        color: COLORS.textPrimary,
        marginBottom: 6,
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    proBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: COLORS.accentSurface,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    proBadgeText: {
        fontSize: 10,
        fontFamily: TYPOGRAPHY.families.black,
        color: COLORS.accent,
        textTransform: 'uppercase',
    },
    dot: {
        color: COLORS.textTertiary,
    },
    roleSubText: {
        fontSize: 14,
        fontFamily: TYPOGRAPHY.families.medium,
        color: COLORS.textSecondary,
    },
    quickStatsRow: {
        flexDirection: 'row',
        width: '100%',
        backgroundColor: COLORS.cardBg,
        padding: 16,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: COLORS.border,
        justifyContent: 'space-between',
        marginBottom: 20,
        ...SHADOWS.sm,
    },
    statContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    statIconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statValueText: {
        fontSize: 14,
        fontFamily: TYPOGRAPHY.families.bold,
        color: COLORS.textPrimary,
    },
    statLabelText: {
        fontSize: 10,
        fontFamily: TYPOGRAPHY.families.medium,
        color: COLORS.textTertiary,
    },
    statDivider: {
        width: 1,
        height: '60%',
        backgroundColor: COLORS.divider,
        alignSelf: 'center',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
        marginBottom: 30,
    },
    primaryBtn: {
        flex: 1,
        height: 54,
        backgroundColor: COLORS.primary,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        ...SHADOWS.sm,
    },
    primaryBtnText: {
        color: 'white',
        fontSize: 15,
        fontFamily: TYPOGRAPHY.families.bold,
    },
    secondaryBtn: {
        width: 54,
        height: 54,
        backgroundColor: COLORS.cardBg,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    contentPadding: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 12,
        fontFamily: TYPOGRAPHY.families.black,
        color: COLORS.textTertiary,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 12,
        marginLeft: 4,
    },
    proCard: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
        marginBottom: 24,
        ...SHADOWS.sm,
    },
    proRow: {
        flexDirection: 'row',
        padding: 20,
        alignItems: 'center',
        gap: 16,
    },
    proIconBox: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: COLORS.accentSurface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    proLabel: {
        fontSize: 11,
        fontFamily: TYPOGRAPHY.families.medium,
        color: COLORS.textTertiary,
        textTransform: 'uppercase',
    },
    proValue: {
        fontSize: 16,
        fontFamily: TYPOGRAPHY.families.bold,
        color: COLORS.textPrimary,
    },
    proCardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 8,
    },
    proFooterText: {
        fontSize: 11,
        fontFamily: TYPOGRAPHY.families.bold,
        color: COLORS.accent,
    },
    menuList: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
        ...SHADOWS.sm,
    },
    menuRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.divider,
    },
    menuIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: COLORS.cardBgAlt,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    menuText: {
        flex: 1,
        fontSize: 15,
        fontFamily: TYPOGRAPHY.families.medium,
        color: COLORS.textPrimary,
    },
    footerInfo: {
        marginTop: 40,
        alignItems: 'center',
        gap: 4,
    },
    versionText: {
        fontSize: 12,
        color: COLORS.textTertiary,
        fontFamily: TYPOGRAPHY.families.medium,
    },
    copyText: {
        fontSize: 10,
        color: 'rgba(100, 116, 139, 0.5)',
        fontFamily: TYPOGRAPHY.families.regular,
    }
});
