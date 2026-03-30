import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { Bell, ChevronLeft, Home, ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TechnicianAPI } from '../services/api';
import { SocketService } from '../services/socket';

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

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick, title, showBack, breadcrumbs, onBack }) => {
    const router = useRouter();
    const segments = useSegments();
    const insets = useSafeAreaInsets();
    const [hasUnread, setHasUnread] = useState(false);

    const currentPath = `/${segments.join('/')}`;
    const isHome = currentPath === '/(tabs)' || currentPath === '/(tabs)/index' || currentPath === '/';
    const isNotifications = currentPath === '/notifications';

    useEffect(() => {
        let mounted = true;

        const checkUnread = async () => {
            if (isNotifications) {
                if (mounted) setHasUnread(false);
                return;
            }

            try {
                const { data } = await TechnicianAPI.getNotifications();
                if (data.success && data.data && mounted) {
                    const unread = data.data.some((n: any) => !n.is_read);
                    setHasUnread(unread);
                }
            } catch (err) {
                console.error("TopBar failed to fetch notification status:", err);
            }
        };

        checkUnread();

        const socket = SocketService.getInstance();
        const handleNewNotification = () => {
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
                backgroundColor: '#0f172a',
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(30, 41, 59, 0.5)',
            }}
        >
            <View style={{ height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <TouchableOpacity
                        onPress={handleBackAction}
                        style={{ padding: 8, marginRight: 8, borderRadius: 12 }}
                    >
                        {(onBack || showBack) ? (
                            <ChevronLeft size={22} color="#3b82f6" strokeWidth={2.5} />
                        ) : (
                            <Home size={20} color={isHome ? "#3b82f6" : "#64748b"} />
                        )}
                    </TouchableOpacity>

                    <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1 }}>
                        <Text style={{
                            fontSize: isHome ? 10 : 14,
                            fontWeight: isHome ? '900' : 'bold',
                            color: isHome ? '#60a5fa' : '#64748b',
                            textTransform: isHome ? 'uppercase' : 'none',
                            letterSpacing: isHome ? 2 : 0,
                            fontStyle: isHome ? 'italic' : 'normal'
                        }}>
                            Workshop
                        </Text>

                        {breadcrumbs ? (
                            breadcrumbs.map((bc, idx) => (
                                <React.Fragment key={idx}>
                                    <ChevronRight size={12} color="#334155" style={{ marginHorizontal: 4 }} />
                                    <Text
                                        numberOfLines={1}
                                        style={{
                                            fontSize: 14,
                                            fontWeight: '800',
                                            color: idx === breadcrumbs.length - 1 ? '#e2e8f0' : '#3b82f6'
                                        }}
                                    >
                                        {bc.label}
                                    </Text>
                                </React.Fragment>
                            ))
                        ) : (
                            !isHome && (
                                <>
                                    <ChevronRight size={14} color="#334155" style={{ marginHorizontal: 4 }} />
                                    <Text
                                        numberOfLines={1}
                                        style={{ fontSize: 14, fontWeight: '900', color: '#60a5fa' }}
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
                        backgroundColor: isNotifications ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                        borderWidth: isNotifications ? 1 : 0,
                        borderColor: 'rgba(59, 130, 246, 0.2)'
                    }}
                >
                    <Bell size={24} color={isNotifications ? "#3b82f6" : "#64748b"} />
                    {hasUnread && (
                        <View style={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            width: 10,
                            height: 10,
                            backgroundColor: '#ef4444',
                            borderRadius: 5,
                            borderWidth: 2,
                            borderColor: '#0f172a'
                        }} />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};
