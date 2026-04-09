import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Alert
} from 'react-native';
import {
    Bell,
    BellOff,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Trash2
} from '@/components/icons';
import { MotiView } from 'moti';
import { FlashList } from '@shopify/flash-list';

import { TopBar } from '@/components/layout/TopBar';
import { SocketService } from '@/lib/socket';
import { Notification } from '@/types';
import { TechnicianAPI } from '@/lib/api';
import { MaterialCircularProgress } from '@/components/ui/Loading';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import { NotificationSkeleton } from '@/components/ui/Skeleton';

export default function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            const { data } = await TechnicianAPI.getNotifications();
            if (data.success) {
                const formatted = data.data.map((n: any) => ({
                    ...n,
                    timestamp: n.created_at ? new Date(n.created_at) : new Date(),
                    read: n.is_read
                }));
                setNotifications(formatted);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();

        const socket = SocketService.getInstance();
        const handleNewNotification = (data: any) => {
            const newNotif = {
                ...data,
                timestamp: new Date(),
                read: false
            };
            setNotifications(prev => [newNotif, ...prev]);
        };

        const handleJobUpdate = () => {
            fetchNotifications(false);
        };

        socket.on('notification:new', handleNewNotification);
        socket.on('job_cards:changed', handleJobUpdate);

        return () => {
            socket.off('notification:new', handleNewNotification);
            socket.off('job_cards:changed', handleJobUpdate);
        };
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await TechnicianAPI.markNotificationsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error("Failed to mark read:", error);
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            await TechnicianAPI.deleteNotifications(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error("Failed to delete:", error);
        }
    };

    const clearAll = async () => {
        Alert.alert(
            "Clear All",
            "Delete all notifications?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Clear All",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await TechnicianAPI.deleteNotifications();
                            setNotifications([]);
                        } catch (error) {
                            console.error("Failed to clear all:", error);
                        }
                    }
                }
            ]
        );
    };

    const getTypeStyles = (type: string) => {
        switch (type) {
            case 'success': return { bg: COLORS.successBg, color: COLORS.success, border: COLORS.success + '20' };
            case 'error': return { bg: COLORS.dangerBg, color: COLORS.danger, border: COLORS.danger + '20' };
            case 'warning': return { bg: COLORS.warningBg, color: COLORS.warning, border: COLORS.warning + '20' };
            default: return { bg: COLORS.primarySurface, color: COLORS.primary, border: COLORS.primary + '20' };
        }
    };

    const getTypeIcon = (type: string, color: string) => {
        switch (type) {
            case 'success': return <CheckCircle2 size={18} color={color} />;
            case 'error':
            case 'warning': return <AlertTriangle size={18} color={color} />;
            default: return <Bell size={18} color={color} />;
        }
    };

    const renderItem = ({ item, index }: { item: Notification, index: number }) => {
        const styles_type = getTypeStyles(item.type || 'info');
        return (
            <MotiView
                from={{ opacity: 0, scale: 0.9, translateY: 20 }}
                animate={{ opacity: 1, scale: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 400, delay: index * 80 }}
            >
                <TouchableOpacity
                    onPress={() => {
                        markAsRead(item.id);
                        // Navigation logic would go here
                    }}
                    style={[
                        styles.notifCard,
                        item.read ? styles.notifRead : styles.notifUnread
                    ]}
                    activeOpacity={0.7}
                >
                    {!item.read && <View style={styles.unreadPulse} />}

                    <View style={{ flexDirection: 'row', gap: 16 }}>
                        <View style={[styles.iconContainer, { backgroundColor: styles_type.bg, borderColor: styles_type.border }]}>
                            {getTypeIcon(item.type || 'info', styles_type.color)}
                        </View>

                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={[styles.notifTitle, item.read ? styles.textDim : styles.textBright]}>
                                    {item.title}
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    <Clock size={8} color={COLORS.textTertiary} />
                                    <Text style={styles.timestamp}>
                                        {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                                    </Text>
                                </View>
                            </View>

                            <Text style={styles.notifMessage} numberOfLines={2}>{item.message}</Text>

                            <View style={styles.cardFooter}>
                                <View style={styles.tagLine} />
                                <TouchableOpacity
                                    onPress={() => deleteNotification(item.id)}
                                    style={styles.actionIcon}
                                >
                                    <Trash2 size={12} color={COLORS.textTertiary} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </MotiView>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.pageBg }}>
            <TopBar title="Pulse Notifications" />

            <View style={{ flex: 1 }}>
                <View style={styles.sectionHeader}>
                    <View>
                        <Text style={styles.sectionTitle}>Agent Intelligence Stream</Text>
                        <Text style={{ fontSize: 9, color: COLORS.accent, fontWeight: 'bold', marginTop: 2, textTransform: 'uppercase' }}>
                            {notifications.length} Signals Captured
                        </Text>
                    </View>
                    {notifications.length > 0 && (
                        <TouchableOpacity onPress={clearAll} style={styles.clearBtn}>
                            <Trash2 size={14} color={COLORS.danger} />
                            <Text style={styles.clearAllText}>Wipe Stream</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {loading && notifications.length === 0 ? (
                    <NotificationSkeleton />
                ) : (
                    <FlashList
                        data={notifications}
                        renderItem={renderItem}
                        // @ts-ignore
                        estimatedItemSize={120}
                        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <View style={styles.emptyIconBg}>
                                    <BellOff size={32} color={COLORS.textTertiary} strokeWidth={1} />
                                </View>
                                <Text style={styles.emptyTitle}>Stream is Silent</Text>
                                <Text style={styles.emptySub}>No active signals detected in your sector.</Text>
                            </View>
                        }
                    />
                )}
            </View>

            {/* Premium Control Center Promo */}
            <MotiView
                from={{ translateY: 100 }}
                animate={{ translateY: 0 }}
                style={styles.promoCard}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                    <View style={styles.promoIconBg}>
                        <MotiView
                            from={{ scale: 1, opacity: 0.5 }}
                            animate={{ scale: 1.2, opacity: 1 }}
                            transition={{ type: 'timing', duration: 1000, loop: true }}
                        >
                            <Bell size={20} color={COLORS.white} />
                        </MotiView>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.promoTitle}>Real-time Matrix Uplink</Text>
                        <Text style={styles.promoSub}>Enable background synchronization for live job deployments.</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.promoBtn} activeOpacity={0.8}>
                    <Text style={styles.promoBtnText}>Synchronize Device</Text>
                </TouchableOpacity>
            </MotiView>
        </View>
    );
}

const styles = StyleSheet.create({
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 24, paddingVertical: 20 },
    sectionTitle: { fontSize: 10, fontWeight: '900', color: COLORS.textTertiary, textTransform: 'uppercase', letterSpacing: 2 },
    clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.danger + '10', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    clearAllText: { fontSize: 9, fontWeight: '900', color: COLORS.danger, textTransform: 'uppercase' },
    notifCard: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 24,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        position: 'relative',
        overflow: 'hidden',
        ...SHADOWS.sm
    },
    notifRead: { opacity: 0.6, backgroundColor: COLORS.cardBgAlt },
    notifUnread: { backgroundColor: COLORS.cardBg, borderColor: COLORS.accent + '30' },
    unreadPulse: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 4,
        height: '100%',
        backgroundColor: COLORS.accent
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1
    },
    notifTitle: { fontSize: 13, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
    textDim: { color: COLORS.textSecondary },
    textBright: { color: COLORS.textPrimary },
    notifMessage: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4, lineHeight: 18, fontWeight: '500' },
    timestamp: { fontSize: 8, fontWeight: 'bold', color: COLORS.textTertiary, textTransform: 'uppercase' },
    cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
    tagLine: { flex: 1, hieght: 1, backgroundColor: COLORS.border, marginRight: 20, opacity: 0.5 },
    actionIcon: { padding: 4 },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
    emptyIconBg: {
        width: 80,
        height: 80,
        backgroundColor: COLORS.cardBgAlt,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderStyle: 'dashed'
    },
    emptyTitle: { fontSize: 14, fontWeight: '900', color: COLORS.textTertiary, textTransform: 'uppercase', letterSpacing: 2 },
    emptySub: { fontSize: 11, color: COLORS.textSecondary, marginTop: 6, fontWeight: 'bold', textAlign: 'center', paddingHorizontal: 40 },
    promoCard: {
        position: 'absolute',
        bottom: 24,
        left: 16,
        right: 16,
        backgroundColor: '#111',
        borderRadius: 32,
        padding: 20,
        borderWidth: 1,
        borderColor: COLORS.accent + '30',
        ...SHADOWS.lg
    },
    promoIconBg: {
        width: 48,
        height: 48,
        backgroundColor: COLORS.accent,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center'
    },
    promoTitle: { fontSize: 14, fontWeight: '900', color: COLORS.white, textTransform: 'uppercase', letterSpacing: 0.5 },
    promoSub: { fontSize: 11, color: COLORS.textTertiary, marginTop: 2, fontWeight: '500' },
    promoBtn: {
        width: '100%',
        backgroundColor: COLORS.accent,
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 16,
        ...SHADOWS.md
    },
    promoBtnText: { color: COLORS.white, fontWeight: '900', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }
});

