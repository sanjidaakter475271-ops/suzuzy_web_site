import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, StyleSheet } from 'react-native';
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
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';

import { TechnicianAPI } from '../../services/api';
import { useAuth } from '../../lib/auth';
import { TopBar } from '../../components/TopBar';

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
        <ChevronRight size={18} color="#334155" />
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
        // Root redirect will handle navigation to login
    };

    const stats_cards = [
        { label: 'Efficiency', value: `${stats?.efficiency_score || 0}%`, icon: <TrendingUp size={18} color="#10b981" /> },
        { label: 'Avg Rating', value: '4.8', icon: <Star size={18} color="#f59e0b" /> },
        { label: 'Hours', value: stats?.hours_worked || 0, icon: <Clock size={18} color="#3b82f6" /> }
    ];

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#020617' }}>
                <TopBar title="Profile" />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                </View>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#020617' }}>
            <TopBar title="Profile" />
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
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
                                <UserIcon size={40} color="#3b82f6" style={{ opacity: 0.8 }} />
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
                                <Store size={12} color="#60a5fa" />
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
                        icon={<Award color="#f59e0b" size={20} />}
                        label="Achievements"
                        sub="3 New badges unlocked"
                    />
                    <MenuItem
                        icon={<TrendingUp color="#10b981" size={20} />}
                        label="Performance Stats"
                        sub="View detailed metrics"
                        onClick={() => router.push('/performance')}
                    />
                    <MenuItem
                        icon={<Target color="#3b82f6" size={20} />}
                        label="Work History"
                        sub="Completed jobs log"
                        onClick={() => router.push('/work-history')}
                    />
                    <MenuItem
                        icon={<Settings color="#64748b" size={20} />}
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
                    <LogOut size={16} color="#f43f5e" />
                    <Text style={styles.logoutBtnText}>Terminate Session</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    headerCard: {
        padding: 32,
        borderRadius: 40,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
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
        borderRadius: 32,
        backgroundColor: 'rgba(59, 130, 246, 0.3)',
        padding: 4,
        marginBottom: 16
    },
    avatarInner: {
        width: '100%',
        height: '100%',
        borderRadius: 28,
        backgroundColor: '#0f172a',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)'
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover'
    },
    profileName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8
    },
    roleBadge: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 99,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.2)',
        marginBottom: 16
    },
    roleText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#60a5fa',
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    idBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 99,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)'
    },
    idText: {
        fontSize: 9,
        fontWeight: '900',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: 2
    },
    dealerInfo: {
        marginTop: 24,
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
        width: '100%',
        alignItems: 'center'
    },
    dealerLabel: {
        fontSize: 10,
        fontWeight: '900',
        color: 'rgba(96, 165, 250, 0.8)',
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    dealerName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white'
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24
    },
    statCard: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        padding: 16,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    statIconContainer: {
        marginBottom: 12,
        padding: 8,
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        borderRadius: 16
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        fontStyle: 'italic'
    },
    statLabel: {
        fontSize: 8,
        fontWeight: '900',
        color: '#64748b',
        textTransform: 'uppercase',
        marginTop: 4,
        letterSpacing: 1
    },
    menuContainer: {
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        borderRadius: 40,
        overflow: 'hidden',
        marginTop: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)'
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)'
    },
    menuIconContainer: {
        padding: 10,
        backgroundColor: '#020617',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)'
    },
    menuLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#f1f5f9'
    },
    menuSub: {
        fontSize: 10,
        color: '#64748b',
        textTransform: 'uppercase',
        marginTop: 2,
        letterSpacing: 0.5
    },
    logoutBtn: {
        width: '100%',
        backgroundColor: 'rgba(244, 63, 94, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(244, 63, 94, 0.2)',
        paddingVertical: 20,
        borderRadius: 32,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginTop: 32
    },
    logoutBtnText: {
        color: '#f43f5e',
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 2
    }
});
