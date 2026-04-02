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
    Platform,
    Dimensions,
    Image
} from 'react-native';
import { router } from 'expo-router';
import {
    Bell,
    Moon,
    Lock,
    ChevronRight,
    Edit2,
    X,
    Fingerprint,
    Trash2,
    RotateCcw,
    Shield,
    Camera,
    ShieldCheck,
    User as UserIcon,
    ArrowLeft
} from 'lucide-react-native';
import { MotiView } from 'moti';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

import { TechnicianAPI } from '../../services/api';
import { BiometricService } from '../../services/biometric';
import { useAuth } from '../../lib/auth';
import { MaterialCircularProgress } from '../../components/ui/Loading';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import { SettingsSkeleton } from '../../components/Skeleton';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function Settings() {
    const { user } = useAuth();

    // State
    const [isEditing, setIsEditing] = useState(false);
    const [profileLoading, setProfileLoading] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    const [notifications, setNotifications] = useState(true);
    const [biometrics, setBiometrics] = useState(false);
    const [bioLoading, setBioLoading] = useState(false);

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [oldPass, setOldPass] = useState("");
    const [newPass, setNewPass] = useState("");
    const [passLoading, setPassLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const { data } = await TechnicianAPI.getProfile();
            if (data?.success && data?.data) {
                setName(data.data.name || "");
                setEmail(data.data.email || "");
                setAvatarUrl(data.data.avatar_url || null);
            }
            const bioEnabled = await BiometricService.isEnabled();
            setBiometrics(bioEnabled);
        } catch (err) {
            console.error("Settings load error:", err);
        } finally {
            setProfileLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!name || !email) {
            Alert.alert("Error", "Name and email are required");
            return;
        }

        setBioLoading(true);
        try {
            const { data } = await TechnicianAPI.updateProfile({ name, email });
            if (data.success) {
                setIsEditing(false);
                Alert.alert("Success", "Profile updated successfully");
            }
        } catch (err) {
            Alert.alert("Error", "Failed to save profile");
        } finally {
            setBioLoading(false);
        }
    };

    const handleClearCache = () => {
        Alert.alert(
            "Clear Cache", 
            "All offline data will be removed. Logout now?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Logout & Clear", style: "destructive", onPress: async () => {
                    await AsyncStorage.clear();
                    router.replace('/login');
                }}
            ]
        );
    };

    if (profileLoading) return <SettingsSkeleton />;

    return (
        <View style={styles.container}>
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                
                {/* Cover Header */}
                <View style={styles.coverWrapper}>
                    {avatarUrl ? (
                        <Image 
                            source={{ uri: avatarUrl }} 
                            style={styles.coverImage} 
                            blurRadius={Platform.OS === 'ios' ? 40 : 70} 
                        />
                    ) : (
                        <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.coverImage} />
                    )}
                    <LinearGradient colors={['transparent', COLORS.pageBg]} style={styles.coverGradient} />
                </View>

                {/* Identity Card */}
                <View style={styles.headerProfile}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatarCircle}>
                            {avatarUrl ? (
                                <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
                            ) : (
                                <View style={styles.placeholderAvatar}>
                                    <UserIcon color={COLORS.primary} size={40} />
                                </View>
                            )}
                        </View>
                        <TouchableOpacity style={styles.cameraCircle}>
                            <Camera size={14} color="white" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.nameText}>{name || user?.name || "Technician"}</Text>
                    <View style={styles.statusBadge}>
                        <ShieldCheck size={12} color={COLORS.accent} />
                        <Text style={styles.statusText}>VERIFIED STAFF</Text>
                    </View>
                </View>

                <View style={styles.content}>
                    {/* Public Profile Manager */}
                    {isEditing ? (
                        <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} style={styles.editCard}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>FULL NAME</Text>
                                <TextInput value={name} onChangeText={setName} style={styles.input} placeholderTextColor={COLORS.textTertiary} />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>EMAIL ADDRESS</Text>
                                <TextInput value={email} onChangeText={setEmail} keyboardType="email-address" style={styles.input} placeholderTextColor={COLORS.textTertiary} />
                            </View>
                            <View style={styles.row}>
                                <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.btnSecondary}>
                                    <Text style={styles.btnTextSecondary}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleSaveProfile} style={styles.btnPrimary}>
                                    {bioLoading ? <MaterialCircularProgress size={16} color="white" /> : <Text style={styles.btnTextPrimary}>Save</Text>}
                                </TouchableOpacity>
                            </View>
                        </MotiView>
                    ) : (
                        <TouchableOpacity style={styles.actionBtn} onPress={() => setIsEditing(true)}>
                            <Edit2 size={16} color="white" />
                            <Text style={styles.actionBtnText}>Update Public Profile</Text>
                        </TouchableOpacity>
                    )}

                    <Text style={styles.sectionHeader}>Preferences</Text>
                    <View style={styles.card}>
                        <View style={styles.menuItem}>
                            <View style={[styles.iconContainer, { backgroundColor: COLORS.primarySurface }]}>
                                <Bell size={20} color={COLORS.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.menuTitle}>Notifications</Text>
                                <Text style={styles.menuSub}>Job and system alerts</Text>
                            </View>
                            <Switch value={notifications} onValueChange={setNotifications} trackColor={{ false: COLORS.border, true: COLORS.primary }} />
                        </View>
                        <View style={[styles.menuItem, { borderBottomWidth: 0 }]}>
                            <View style={[styles.iconContainer, { backgroundColor: 'rgba(168, 85, 247, 0.1)' }]}>
                                <Moon size={20} color="#a855f7" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.menuTitle}>Dark Mode</Text>
                                <Text style={styles.menuSub}>Enabled by default</Text>
                            </View>
                            <Switch value={true} disabled trackColor={{ false: COLORS.border, true: '#a855f7' }} />
                        </View>
                    </View>

                    <Text style={styles.sectionHeader}>Account & Security</Text>
                    <View style={styles.card}>
                        <View style={styles.menuItem}>
                            <View style={[styles.iconContainer, { backgroundColor: COLORS.successBg }]}>
                                <Fingerprint size={20} color={COLORS.success} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.menuTitle}>Biometric Login</Text>
                                <Text style={styles.menuSub}>Face ID / Fingerprint</Text>
                            </View>
                            <Switch value={biometrics} onValueChange={setBiometrics} />
                        </View>
                        <TouchableOpacity style={styles.menuItem} onPress={() => setShowPasswordModal(true)}>
                            <View style={[styles.iconContainer, { backgroundColor: COLORS.warningBg }]}>
                                <Lock size={20} color={COLORS.warning} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.menuTitle}>Change Password</Text>
                                <Text style={styles.menuSub}>Update your login security</Text>
                            </View>
                            <ChevronRight size={18} color={COLORS.textTertiary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={handleClearCache}>
                            <View style={[styles.iconContainer, { backgroundColor: COLORS.dangerBg }]}>
                                <Trash2 size={20} color={COLORS.danger} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.menuTitle, { color: COLORS.danger }]}>Clear Cache</Text>
                                <Text style={styles.menuSub}>Fix sync and data issues</Text>
                            </View>
                            <RotateCcw size={16} color={COLORS.textTertiary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <Shield size={12} color={COLORS.textTertiary} />
                        <Text style={styles.footerText}>Secure Technician Portal v1.0.4</Text>
                    </View>
                    
                    <View style={{ height: 100 }} />
                </View>
            </ScrollView>

            {/* Password Modal */}
            <Modal visible={showPasswordModal} transparent animationType="slide">
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Update Password</Text>
                            <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                                <X color={COLORS.textPrimary} size={24} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ gap: 16 }}>
                            <TextInput placeholder="Old Password" secureTextEntry style={styles.modalInput} placeholderTextColor={COLORS.textTertiary} value={oldPass} onChangeText={setOldPass} />
                            <TextInput placeholder="New Password" secureTextEntry style={styles.modalInput} placeholderTextColor={COLORS.textTertiary} value={newPass} onChangeText={setNewPass} />
                            <TouchableOpacity style={styles.btnPrimary} onPress={() => setShowPasswordModal(false)}>
                                <Text style={styles.btnTextPrimary}>CONFIRM CHANGE</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.pageBg,
    },
    coverWrapper: {
        height: 160,
    },
    coverImage: {
        width: '100%',
        height: '100%',
    },
    coverGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    headerProfile: {
        alignItems: 'center',
        marginTop: -60,
        paddingHorizontal: 20,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 12,
    },
    avatarCircle: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: COLORS.pageBg,
        padding: 5,
        ...SHADOWS.md,
    },
    avatarImg: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
        borderWidth: 2,
        borderColor: COLORS.primarySurface,
    },
    placeholderAvatar: {
        flex: 1,
        borderRadius: 50,
        backgroundColor: COLORS.cardBg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cameraCircle: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.slate800,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: COLORS.pageBg,
    },
    nameText: {
        fontSize: 24,
        fontFamily: TYPOGRAPHY.families.bold,
        color: COLORS.white,
        marginBottom: 4,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.accentSurface,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 6,
    },
    statusText: {
        fontSize: 10,
        color: COLORS.accent,
        fontFamily: TYPOGRAPHY.families.black,
    },
    content: {
        padding: 20,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        height: 52,
        borderRadius: 16,
        gap: 10,
        marginBottom: 24,
    },
    actionBtnText: {
        color: 'white',
        fontFamily: TYPOGRAPHY.families.bold,
        fontSize: 15,
    },
    card: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
        marginBottom: 24,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.divider,
    },
    iconContainer: {
        width: 42,
        height: 42,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuTitle: {
        fontSize: 15,
        fontFamily: TYPOGRAPHY.families.bold,
        color: COLORS.textPrimary,
    },
    menuSub: {
        fontSize: 11,
        color: COLORS.textTertiary,
        fontFamily: TYPOGRAPHY.families.medium,
    },
    sectionHeader: {
        fontSize: 11,
        color: COLORS.textTertiary,
        fontFamily: TYPOGRAPHY.families.black,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        marginBottom: 12,
        marginLeft: 4,
    },
    editCard: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 10,
        color: COLORS.textSecondary,
        fontFamily: TYPOGRAPHY.families.black,
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: COLORS.cardBgAlt,
        borderRadius: 12,
        padding: 14,
        color: COLORS.textPrimary,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    btnPrimary: {
        flex: 2,
        backgroundColor: COLORS.primary,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnTextPrimary: {
        color: 'white',
        fontFamily: TYPOGRAPHY.families.bold,
    },
    btnSecondary: {
        flex: 1,
        backgroundColor: COLORS.cardBgAlt,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnTextSecondary: {
        color: COLORS.textSecondary,
        fontFamily: TYPOGRAPHY.families.bold,
    },
    footerStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 10,
        opacity: 0.5,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        opacity: 0.5,
    },
    footerText: {
        fontSize: 10,
        color: COLORS.textTertiary,
        fontFamily: TYPOGRAPHY.families.medium,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(2, 6, 23, 0.9)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.cardBg,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: TYPOGRAPHY.families.bold,
        color: COLORS.textPrimary,
    },
    modalInput: {
        backgroundColor: COLORS.cardBgAlt,
        height: 56,
        borderRadius: 16,
        paddingHorizontal: 16,
        color: COLORS.textPrimary,
        borderWidth: 1,
        borderColor: COLORS.border,
    }
});
