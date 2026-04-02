import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { WifiOff, X } from 'lucide-react-native';
import { MotiView, AnimatePresence } from 'moti';
import NetInfo from '@react-native-community/netinfo';
import { COLORS } from '../constants/theme';

export const OfflineBanner: React.FC = () => {
    const [isOffline, setIsOffline] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsOffline(!(state.isConnected && state.isInternetReachable));
            if (state.isConnected) setDismissed(false);
        });

        return () => unsubscribe();
    }, []);

    if (!isOffline || dismissed) return null;

    return (
        <AnimatePresence>
            <MotiView
                from={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={styles.container}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <WifiOff size={16} color="white" />
                    <Text style={styles.text}>Offline mode. Showing cached data.</Text>
                </View>
                <TouchableOpacity
                    onPress={() => setDismissed(true)}
                    style={styles.closeBtn}
                >
                    <X size={14} color="white" />
                </TouchableOpacity>
            </MotiView>
        </AnimatePresence>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.warning,
        paddingHorizontal: 16,
        paddingVertical: 8,
        width: '100%',
        zIndex: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        elevation: 5,
        shadowColor: COLORS.textPrimary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4
    },
    text: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: 'bold'
    },
    closeBtn: {
        padding: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 99
    }
});
