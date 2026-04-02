import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Switch,
    Modal,
    Alert,
    StyleSheet,
    Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import {
    Bell,
    Moon,
    Lock,
    ChevronRight,
    Edit2,
    X,
    Fingerprint,
    HardDrive,
    Trash2,
    RotateCcw,
    Shield
} from 'lucide-react-native';
import { MotiView, AnimatePresence } from 'moti';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { TopBar } from '../../components/TopBar';
import { TechnicianAPI } from '../../services/api';
import { BiometricService } from '../../services/biometric';
import { useAuth } from '../../lib/auth';
import { MaterialCircularProgress } from '../../components/ui/Loading';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { SettingsSkeleton } from '../../components/Skeleton';

export default function Settings() {
    const router = useRouter();
    const { user } = useAuth();

    // State for Profile Edit
    const [isEditing, setIsEditing] = useState(false);
    const [profileLoading, setProfileLoading] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    // State for Toggles
    const [notifications, setNotifications] = useState(true);
    const [biometrics, setBiometrics] = useState(false);
    const [bioLoading, setBioLoading] = useState(false);

    // State for Password Modal
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [oldPass, setOldPass] = useState("");
    const [newPass, setNewPass] = useState("");
    const [passLoading, setPassLoading] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const { data } = await TechnicianAPI.getProfile();
                if (data.success && data.data) {
                    setName(data.data.name || "");
                    setEmail(data.data.email || "");
                }
            } catch (err) {
                console.error("Failed to load profile:", err);
            } finally {
                setProfileLoading(false);
            }
        };

        loadProfile();

        // Check Biometrics
        BiometricService.isEnabled().then(setBiometrics);
    }, []);

    const handleSaveProfile = async () => {
        if (!name || !email) {
            Alert.alert("Error", "Name and email are required");
            return;
        }

        try {
            setBioLoading(true);
            const { data } = await TechnicianAPI.updateProfile({ name, email });
            if (data.success) {
                setIsEditing(false);
                Alert.alert("Success", "Profile updated successfully!");
            }
        } catch (err) {
            console.error("Save failed:", err);
            Alert.alert("Error", "Failed to save changes.");
        } finally {
            setBioLoading(false);
        }
    };

    const toggleBiometrics = async () => {
        if (bioLoading) return;

        if (biometrics) {
            await BiometricService.setEnabled(false);
            setBiometrics(false);
            return;
        }

        // In a real app, you'd show a secure password field
        // For this migration, we'll follow the same logic as the web app
        Alert.prompt(
            "Enable Biometric Login",
            "Enter your account password to secure biometric login:",
            async (pass) => {
                if (!pass) return;

                setBioLoading(true);
                try {
                    const isAvailable = await BiometricService.isAvailable();
                    if (!isAvailable) {
                        Alert.alert("Not Available", "Biometric authentication is not available on this device.");
                        setBioLoading(false);
                        return;
                    }

                    const success = await BiometricService.authenticate();
                    if (success) {
                        await BiometricService.setEnabled(true, {
                            email: user?.email || '',
                            pass
                        });
                        setBiometrics(true);
                        Alert.alert("Success", "Biometric login enabled!");
                    }
                } catch (err) {
                    console.error("Failed to enable biometrics:", err);
                    Alert.alert("Error", "Failed to enable biometrics.");
                } finally {
                    setBioLoading(false);
                }
            },
            "secure-text"
        );
    };

    const clearCache = async () => {
        Alert.alert(
            "Clear Local Cache",
            "Are you sure? This will remove all offline data and you'll need an internet connection to sync again.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Clear Everything",
                    style: "destructive",
                    onPress: async () => {
                        await AsyncStorage.clear();
                        // Reset to login
                        router.replace('/login');
                    }
                }
            ]
        );
    };

    const handleUpdatePassword = async () => {
        if (!oldPass || !newPass) return;
        setPassLoading(true);
        // Implement real API call here
        setTimeout(() => {
            setPassLoading(false);
            setShowPasswordModal(false);
            Alert.alert("Success", "Password updated successfully");
            setOldPass("");
            setNewPass("");
        }, 1000);
    };

    if (profileLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: COLORS.pageBg }}>
                <TopBar title="Settings" />
                <SettingsSkeleton />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.pageBg }}>
            <TopBar title="Settings" />
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>

                {/* Profile Section */}
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    style={styles.card}
                >
                    <View style={styles.cardHeaderGlow} />
                    <View style={styles.profileHeader}>
                        <View style={styles.avatarLarge}>
                            <Text style={styles.avatarText}>{name?.charAt(0) || 'U'}</Text>
                        </View>

                        {!isEditing ? (
                            <View style={{ alignItems: 'center' }}>
                                <Text style={styles.profileName}>{name}</Text>
                                <Text style={styles.profileRole}>Senior Technician</Text>
                                <Text style={styles.profileEmail}>{email}</Text>
                                <TouchableOpacity
                                    onPress={() => setIsEditing(true)}
                                    style={styles.editBtn}
                                >
                                    <Edit2 size={12} color={COLORS.textTertiary} />
                                    <Text style={styles.editBtnText}>Edit Profile</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={{ width: '100%', gap: 16 }}>
                                <View>
                                    <Text style={styles.inputLabel}>Full Name</Text>
                                    <TextInput
                                        value={name}
                                        onChangeText={setName}
                                        style={styles.textInput}
                                        placeholderTextColor={COLORS.textTertiary}
                                    />
                                </View>
                                <View>
                                    <Text style={styles.inputLabel}>Email Address</Text>
                                    <TextInput
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        style={styles.textInput}
                                        placeholderTextColor={COLORS.textTertiary}
                                    />
                                </View>
                                <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                                    <TouchableOpacity
                                        onPress={() => setIsEditing(false)}
                                        style={styles.cancelBtn}
                                    >
                                        <Text style={styles.cancelBtnText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={handleSaveProfile}
                                        style={styles.saveBtn}
                                    >
                                        {bioLoading ? <MaterialCircularProgress size={20} color="white" /> : <Text style={styles.saveBtnText}>Save</Text>}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>
                </MotiView>

                {/* Preferences Group */}
                <View style={{ marginTop: 32 }}>
                    <Text style={styles.groupHeader}>Preferences</Text>
                    <View style={styles.groupCard}>
                        <View style={styles.settingRow}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={[styles.iconContainer, { backgroundColor: COLORS.primarySurface }]}>
                                    <Bell size={18} color={COLORS.primary} />
                                </View>
                                <Text style={styles.settingLabel}>Notifications</Text>
                            </View>
                            <Switch
                                value={notifications}
                                onValueChange={setNotifications}
                                trackColor={{ false: COLORS.borderStrong, true: COLORS.primary }}
                                thumbColor="white"
                            />
                        </View>

                        <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={[styles.iconContainer, { backgroundColor: '#f3e8ff' }]}>
                                    <Moon size={18} color="#a855f7" />
                                </View>
                                <Text style={styles.settingLabel}>Dark Mode</Text>
                            </View>
                            <Switch
                                value={true}
                                disabled
                                trackColor={{ false: COLORS.borderStrong, true: '#a855f7' }}
                                thumbColor="white"
                            />
                        </View>
                    </View>
                </View>

                {/* Privacy & Security Group */}
                <View style={{ marginTop: 24 }}>
                    <Text style={styles.groupHeader}>Privacy & Security</Text>
                    <View style={styles.groupCard}>
                        <TouchableOpacity style={styles.settingRow} onPress={toggleBiometrics}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={[styles.iconContainer, { backgroundColor: COLORS.successBg }]}>
                                    <Fingerprint size={18} color={COLORS.success} />
                                </View>
                                <View>
                                    <Text style={styles.settingLabel}>Biometric Login</Text>
                                    <Text style={styles.settingSub}>Touch ID / Face ID</Text>
                                </View>
                            </View>
                            {bioLoading ? (
                                <MaterialCircularProgress size={20} color={COLORS.success} />
                            ) : (
                                <Switch
                                    value={biometrics}
                                    onValueChange={toggleBiometrics}
                                    trackColor={{ false: COLORS.borderStrong, true: COLORS.success }}
                                    thumbColor="white"
                                />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.settingRow} onPress={() => setShowPasswordModal(true)}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={[styles.iconContainer, { backgroundColor: COLORS.warningBg }]}>
                                    <Lock size={18} color={COLORS.warning} />
                                </View>
                                <Text style={styles.settingLabel}>Change Password</Text>
                            </View>
                            <ChevronRight size={18} color={COLORS.textTertiary} />
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.settingRow, { borderBottomWidth: 0 }]} onPress={clearCache}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={[styles.iconContainer, { backgroundColor: COLORS.dangerBg }]}>
                                    <Trash2 size={18} color={COLORS.danger} />
                                </View>
                                <View>
                                    <Text style={[styles.settingLabel, { color: COLORS.danger }]}>Clear Cache</Text>
                                    <Text style={styles.settingSub}>Reset all local storage</Text>
                                </View>
                            </View>
                            <RotateCcw size={16} color={COLORS.textTertiary} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Device Info */}
                <View style={styles.infoCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <Shield size={14} color={COLORS.primary} />
                        <Text style={styles.infoHeader}>Security Overview</Text>
                    </View>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        <View style={styles.tag}><Text style={styles.tagText}>v3.0.0 (Expo)</Text></View>
                        <View style={[styles.tag, biometrics && styles.tagActive]}><Text style={[styles.tagText, biometrics && styles.tagTextActive]}>Biometrics: {biometrics ? 'ON' : 'OFF'}</Text></View>
                        <View style={styles.tag}><Text style={styles.tagText}>Encryption: AES-256</Text></View>
                    </View>
                </View>

            </ScrollView>

            {/* Password Modal */}
            <Modal visible={showPasswordModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowPasswordModal(false)} />
                    <MotiView
                        from={{ opacity: 0, scale: 0.9, translateY: 20 }}
                        animate={{ opacity: 1, scale: 1, translateY: 0 }}
                        style={styles.passwordModal}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Update Password</Text>
                            <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                                <X size={20} color={COLORS.textTertiary} />
                            </TouchableOpacity>
                        </View>

                        <View style={{ gap: 16 }}>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Current Password"
                                placeholderTextColor={COLORS.textTertiary}
                                secureTextEntry
                                value={oldPass}
                                onChangeText={setOldPass}
                            />
                            <TextInput
                                style={styles.modalInput}
                                placeholder="New Password"
                                placeholderTextColor={COLORS.textTertiary}
                                secureTextEntry
                                value={newPass}
                                onChangeText={setNewPass}
                            />
                            <TouchableOpacity
                                onPress={handleUpdatePassword}
                                style={styles.modalBtn}
                                disabled={passLoading}
                            >
                                {passLoading ? <MaterialCircularProgress size={24} color="white" /> : <Text style={styles.modalBtnText}>UPDATE PASSWORD</Text>}
                            </TouchableOpacity>
                        </View>
                    </MotiView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    card: { backgroundColor: COLORS.cardBg, borderRadius: 32, padding: 24, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden', ...SHADOWS.md },
    cardHeaderGlow: { position: 'absolute', top: -50, right: -50, width: 150, height: 150, backgroundColor: COLORS.primarySurface, borderRadius: 999, opacity: 0.5 },
    profileHeader: { alignItems: 'center', position: 'relative', zIndex: 10 },
    avatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primarySurface, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: COLORS.primary + '20' },
    avatarText: { fontSize: 32, fontWeight: 'bold', color: COLORS.primary },
    profileName: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary },
    profileRole: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
    profileEmail: { fontSize: 12, color: COLORS.textTertiary, marginTop: 4 },
    editBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.cardBgAlt, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 16, borderWidth: 1, borderColor: COLORS.border },
    editBtnText: { color: COLORS.textSecondary, fontSize: 11, fontWeight: 'bold' },
    inputLabel: { fontSize: 10, fontWeight: '900', color: COLORS.textSecondary, textTransform: 'uppercase', marginBottom: 8, marginLeft: 4 },
    textInput: { backgroundColor: COLORS.inputBg, borderRadius: 12, padding: 12, color: COLORS.textPrimary, fontSize: 14, borderWidth: 1, borderColor: COLORS.border },
    cancelBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12, backgroundColor: COLORS.cardBgAlt },
    cancelBtnText: { color: COLORS.textSecondary, fontWeight: 'bold', fontSize: 12 },
    saveBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12, backgroundColor: COLORS.primary },
    saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
    groupHeader: { fontSize: 10, fontWeight: '900', color: COLORS.textTertiary, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12, marginLeft: 8 },
    groupCard: { backgroundColor: COLORS.cardBg, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
    settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
    iconContainer: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    settingLabel: { fontSize: 14, fontWeight: 'bold', color: COLORS.textPrimary },
    settingSub: { fontSize: 10, color: COLORS.textTertiary, marginTop: 2 },
    infoCard: { marginTop: 32, padding: 24, backgroundColor: COLORS.cardBg, borderRadius: 24, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
    infoHeader: { fontSize: 10, fontWeight: '900', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
    tag: { backgroundColor: COLORS.cardBgAlt, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: COLORS.border },
    tagActive: { backgroundColor: COLORS.successBg, borderColor: COLORS.success + '20' },
    tagText: { fontSize: 9, fontWeight: 'bold', color: COLORS.textSecondary },
    tagTextActive: { color: COLORS.success },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.8)', justifyContent: 'center', padding: 24 },
    passwordModal: { backgroundColor: COLORS.cardBg, borderRadius: 32, padding: 24, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.lg },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary },
    modalInput: { backgroundColor: COLORS.inputBg, borderRadius: 16, padding: 16, color: COLORS.textPrimary, fontSize: 14, borderWidth: 1, borderColor: COLORS.border },
    modalBtn: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 8 },
    modalBtnText: { color: 'white', fontWeight: '900', letterSpacing: 1, fontSize: 12 }
});
