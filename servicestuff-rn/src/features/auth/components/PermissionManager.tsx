import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Camera, MapPin, CheckCircle, ShieldAlert } from '@/components/icons';
import * as Location from 'expo-location';
import { Camera as ExpoCamera } from 'expo-camera';
import { storage } from '@/lib/storage';
import { MotiView } from 'moti';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '@/constants/theme';

export const PermissionManager: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [showPrompt, setShowPrompt] = useState(false);
    const [permissionsChecked, setPermissionsChecked] = useState(false);

    useEffect(() => {
        const checkInitialPermissions = async () => {
            const requested = storage.getBoolean('permissions_requested');
            if (requested) {
                onComplete();
                return;
            }

            setShowPrompt(true);
            setPermissionsChecked(true);
        };

        checkInitialPermissions();
    }, [onComplete]);

    const requestPermissions = async () => {
        try {
            await Location.requestForegroundPermissionsAsync();
        } catch (e) {
            console.warn("Location permission failed", e);
        }

        try {
            await ExpoCamera.requestCameraPermissionsAsync();
        } catch (e) {
            console.warn("Camera permission failed", e);
        }

        storage.set('permissions_requested', true);
        setShowPrompt(false);
        onComplete();
    };

    if (!permissionsChecked || !showPrompt) return null;

    return (
        <View style={styles.overlay}>
            <MotiView
                from={{ opacity: 0, scale: 0.9, translateY: 30 }}
                animate={{ opacity: 1, scale: 1, translateY: 0 }}
                style={styles.card}
            >
                <View style={styles.iconContainer}>
                    <ShieldAlert color={COLORS.primary} size={32} />
                </View>

                <Text style={styles.title}>App Permissions</Text>
                <Text style={styles.description}>
                    To provide a smooth experience, ServiceStuff needs access to a few device features.
                </Text>

                <View style={styles.permissionList}>
                    <View style={styles.permissionRow}>
                        <View style={[styles.iconBg, { backgroundColor: COLORS.successBg }]}>
                            <Camera size={18} color={COLORS.success} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.permissionName}>Camera Access</Text>
                            <Text style={styles.permissionDesc}>Required for scanning barcodes and QR codes.</Text>
                        </View>
                    </View>

                    <View style={styles.permissionRow}>
                        <View style={[styles.iconBg, { backgroundColor: COLORS.primarySurface }]}>
                            <MapPin size={18} color={COLORS.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.permissionName}>Location Services</Text>
                            <Text style={styles.permissionDesc}>Used for accurate attendance logging.</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={requestPermissions}
                    style={styles.continueBtn}
                    activeOpacity={0.8}
                >
                    <CheckCircle size={18} color="white" />
                    <Text style={styles.continueText}>Continue</Text>
                </TouchableOpacity>
            </MotiView>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.pageBg, zIndex: 200, alignItems: 'center', justifyContent: 'center', padding: 24 },
    card: { backgroundColor: COLORS.cardBg, borderRadius: 40, padding: 32, width: '100%', maxWidth: 400, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', ...SHADOWS.lg },
    iconContainer: { width: 64, height: 64, backgroundColor: COLORS.primarySurface, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    title: { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 12 },
    description: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
    permissionList: { width: '100%', gap: 24, marginBottom: 40 },
    permissionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
    iconBg: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    permissionName: { fontSize: 14, fontWeight: 'bold', color: COLORS.textPrimary },
    permissionDesc: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2, lineHeight: 16 },
    continueBtn: { backgroundColor: COLORS.primary, width: '100%', paddingVertical: 16, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, ...SHADOWS.md },
    continueText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
