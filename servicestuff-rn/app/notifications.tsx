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
} from 'lucide-react-native';
import { MotiView } from 'moti';
import { FlashList } from '@shopify/flash-list';

import { TopBar } from '../components/TopBar';
import { SocketService } from '../services/socket';
import { Notification } from '../types';
import { TechnicianAPI } from '../services/api';
import { MaterialCircularProgress } from '../components/ui/Loading';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { NotificationSkeleton } from '../components/Skeleton';

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
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'timing', duration: 300, delay: index * 50 }}
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
                    {!item.read && <View style={styles.unreadDot} />}

                    <View style={{ flexDirection: 'row', gap: 16 }}>
                        <View style={[styles.iconContainer, { backgroundColor: styles_type.bg, borderColor: styles_type.border }]}>
                            {getTypeIcon(item.type || 'info', styles_type.color)}
                        </View>

                        <View style={{ flex: 1 }}>
                            <Text style={[styles.notifTitle, item.read ? styles.textDim : styles.textBright]}>
                                {item.title}
                            </Text>
                            <Text style={styles.notifMessage}>{item.message}</Text>

                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 }}>
                                <Clock size={10} color={COLORS.textTertiary} />
                                <Text style={styles.timestamp}>
                                    {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={() => deleteNotification(item.id)}
                        style={styles.deleteBtn}
                    >
                        <Trash2 size={16} color={COLORS.textTertiary} />
                    </TouchableOpacity>
                </TouchableOpacity>
            </MotiView>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.pageBg }}>
            <TopBar title="Notifications" />

            <View style={{ flex: 1 }}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Updates</Text>
                    {notifications.length > 0 && (
                        <TouchableOpacity onPress={clearAll}>
                            <Text style={styles.clearAllText}>Clear All</Text>
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
                        contentContainerStyle={{ padding: 16 }}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <View style={styles.emptyIconBg}><BellOff size={48} color={COLORS.borderStrong} /></View>
                                <Text style={styles.emptyTitle}>No Notifications</Text>
                                <Text style={styles.emptySub}>You're all caught up!</Text>
                            </View>
                        }
                    />
                )}
            </View>

            {/* Push Promo */}
            <View style={styles.promoCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                    <View style={styles.promoIconBg}><Bell size={24} color={COLORS.white} /></View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.promoTitle}>Push Notifications</Text>
                        <Text style={styles.promoSub}>Get live job alerts even when the app is closed.</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.promoBtn}>
                    <Text style={styles.promoBtnText}>Enable Device Alerts</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16 },
    sectionTitle: { fontSize: 10, fontWeight: '900', color: COLORS.textTertiary, textTransform: 'uppercase', letterSpacing: 2 },
    clearAllText: { fontSize: 10, fontWeight: '900', color: COLORS.danger, textTransform: 'uppercase' },
    notifCard: { backgroundColor: COLORS.cardBg, borderRadius: 24, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, position: 'relative', overflow: 'hidden', ...SHADOWS.sm },
    notifRead: { opacity: 0.8, backgroundColor: COLORS.cardBgAlt },
    notifUnread: { backgroundColor: COLORS.cardBg, borderColor: COLORS.primary + '20' },
    unreadDot: { position: 'absolute', top: 16, right: 16, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
    iconContainer: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
    notifTitle: { fontSize: 14, fontWeight: 'bold' },
    textDim: { color: COLORS.textSecondary },
    textBright: { color: COLORS.textPrimary },
    notifMessage: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4, lineHeight: 18 },
    timestamp: { fontSize: 9, fontWeight: '900', color: COLORS.textTertiary, textTransform: 'uppercase' },
    deleteBtn: { position: 'absolute', bottom: 12, right: 12, padding: 8 },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
    emptyIconBg: { width: 80, height: 80, backgroundColor: COLORS.cardBgAlt, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 1, borderColor: COLORS.border },
    emptyTitle: { fontSize: 14, fontWeight: '900', color: COLORS.textTertiary, textTransform: 'uppercase', letterSpacing: 2 },
    emptySub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4, fontWeight: 'bold' },
    promoCard: { margin: 16, marginBottom: Platform.OS === 'ios' ? 40 : 24, backgroundColor: COLORS.primarySurface, borderRadius: 32, padding: 20, borderWidth: 1, borderColor: COLORS.primary + '20' },
    promoIconBg: { width: 48, height: 48, backgroundColor: COLORS.primary, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    promoTitle: { fontSize: 14, fontWeight: 'bold', color: COLORS.textPrimary },
    promoSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
    promoBtn: { width: '100%', backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 16 },
    promoBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 12 }
});

