import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { Bell, ChevronLeft, Home, ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TechnicianAPI } from '../services/api';
import { SocketService } from '../services/socket';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';

interface Breadcrumb {
    label: string;
    path?: string;
}

interface TopBarProps {
    onMenuClick?: () => void;
    title?: string;
    showBack?: boolean;
    breadcrumbs?: Breadcrumb[];
    onBack?: () => void;
}

// Module-level cache to persist between mounts
let globalHasUnread = false;
let lastFetchTime = 0;
const CACHE_DURATION = 30000; // 30 seconds

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick, title, showBack, breadcrumbs, onBack }) => {
    const router = useRouter();
    const segments = useSegments();
    const insets = useSafeAreaInsets();
    const [hasUnread, setHasUnread] = useState(globalHasUnread);

    const currentPath = `/${segments.join('/')}`;
    const isHome = currentPath === '/(tabs)' || currentPath === '/(tabs)/index' || currentPath === '/';
    const isNotifications = currentPath === '/notifications';

    useEffect(() => {
        let mounted = true;

        const checkUnread = async () => {
            if (isNotifications) {
                if (mounted) {
                    setHasUnread(false);
                    globalHasUnread = false;
                }
                return;
            }

            // Only fetch if cache is expired
            const now = Date.now();
            if (now - lastFetchTime < CACHE_DURATION) {
                if (mounted) setHasUnread(globalHasUnread);
                return;
            }

            try {
                const { data } = await TechnicianAPI.getNotifications();
                if (data.success && data.data && mounted) {
                    const unread = data.data.some((n: any) => !n.is_read);
                    globalHasUnread = unread;
                    lastFetchTime = now;
                    setHasUnread(unread);
                }
            } catch (err: any) {
                if (err.response?.status !== 401) {
                    console.error("TopBar failed to fetch notification status:", err);
                }
            }
        };

        checkUnread();

        const socket = SocketService.getInstance();
        const handleNewNotification = () => {
            globalHasUnread = true;
            if (mounted) setHasUnread(true);
        };

        socket.on('notification:new', handleNewNotification);

        return () => {
            mounted = false;
            socket.off('notification:new', handleNewNotification);
        };
    }, [isNotifications]);

    const handleBackAction = () => {
        if (onBack) {
            onBack();
        } else if (showBack) {
            if (onMenuClick) onMenuClick();
            else router.back();
        } else if (!isHome) {
            router.replace('/(tabs)');
        }
    };

    return (
        <View
            style={{
                paddingTop: insets.top,
                backgroundColor: COLORS.slate900,
                borderBottomWidth: 1,
                borderBottomColor: COLORS.darkBorder,
            }}
        >
            <View style={{ height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <TouchableOpacity
                        onPress={handleBackAction}
                        style={{ padding: SPACING.sm, marginRight: SPACING.sm, borderRadius: 12 }}
                    >
                        {(onBack || showBack) ? (
                            <ChevronLeft size={22} color={COLORS.primary} strokeWidth={2.5} />
                        ) : (
                            <Home size={20} color={isHome ? COLORS.primary : COLORS.slate500} />
                        )}
                    </TouchableOpacity>

                    <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1 }}>
                        <Text style={{
                            fontSize: isHome ? 10 : 14,
                            fontWeight: isHome ? '900' : 'bold',
                            color: isHome ? COLORS.primaryLight : COLORS.slate500,
                            textTransform: isHome ? 'uppercase' : 'none',
                            letterSpacing: isHome ? 2 : 0,
                            fontStyle: isHome ? 'italic' : 'normal',
                            fontFamily: isHome ? TYPOGRAPHY.families.black : TYPOGRAPHY.families.bold,
                        }}>
                            Workshop
                        </Text>

                        {breadcrumbs ? (
                            breadcrumbs.map((bc, idx) => (
                                <React.Fragment key={idx}>
                                    <ChevronRight size={12} color={COLORS.slate700} style={{ marginHorizontal: 4 }} />
                                    <Text
                                        numberOfLines={1}
                                        style={{
                                            fontSize: 14,
                                            fontWeight: '800',
                                            color: idx === breadcrumbs.length - 1 ? COLORS.slate200 : COLORS.primary,
                                            fontFamily: TYPOGRAPHY.families.bold,
                                        }}
                                    >
                                        {bc.label}
                                    </Text>
                                </React.Fragment>
                            ))
                        ) : (
                            !isHome && (
                                <>
                                    <ChevronRight size={14} color={COLORS.slate700} style={{ marginHorizontal: 4 }} />
                                    <Text
                                        numberOfLines={1}
                                        style={{
                                            fontSize: 14,
                                            fontWeight: '900',
                                            color: COLORS.primaryLight,
                                            fontFamily: TYPOGRAPHY.families.bold,
                                        }}
                                    >
                                        {title === 'Dashboard' ? 'Home' : title}
                                    </Text>
                                </>
                            )
                        )}
                    </View>
                </View>

                <TouchableOpacity
                    onPress={() => isNotifications ? router.back() : router.push('/notifications')}
                    style={{
                        padding: 10,
                        borderRadius: 999,
                        backgroundColor: isNotifications ? COLORS.infoBg : 'transparent',
                        borderWidth: isNotifications ? 1 : 0,
                        borderColor: COLORS.darkBorder
                    }}
                >
                    <Bell size={24} color={isNotifications ? COLORS.primary : COLORS.slate500} />
                    {hasUnread && (
                        <View style={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            width: 10,
                            height: 10,
                            backgroundColor: COLORS.danger,
                            borderRadius: 5,
                            borderWidth: 2,
                            borderColor: COLORS.slate900
                        }} />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};
