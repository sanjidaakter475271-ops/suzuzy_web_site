import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    ScrollView, 
    Platform, 
    StyleSheet, 
    Dimensions,
    KeyboardAvoidingView
} from 'react-native';
import { useRouter } from 'expo-router';
import {
    KeyRound,
    Mail,
    ArrowRight,
    ShieldCheck,
    Zap,
    Fingerprint,
    AlertCircle,
    Lock,
    Settings,
    Bike,
    Activity,
    Wind
} from '@/components/icons';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { Easing } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { useAuthStore } from '@/stores/authStore';
import { BiometricService } from '@/lib/biometric';
import { MaterialCircularProgress } from '@/components/ui/Loading';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Industrial Gear Background (Monochrome)
const AnimatedGear = ({ 
    size = 100, 
    color = '#333333', 
    top,
    bottom,
    left,
    right,
    duration = 4000,
    direction = 1 
}: any) => {
    return (
        <MotiView
            from={{ rotate: '0deg' }}
            animate={{ rotate: direction > 0 ? '360deg' : '-360deg' }}
            transition={{
                loop: true,
                type: 'timing',
                duration: duration,
                easing: Easing.linear,
            }}
            style={{
                position: 'absolute',
                ...(top !== undefined && { top }),
                ...(bottom !== undefined && { bottom }),
                ...(left !== undefined && { left }),
                ...(right !== undefined && { right }),
                width: size,
                height: size,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.8
            }}
        >
            <Settings size={size} color={color} strokeWidth={1.5} />
        </MotiView>
    );
};

const GearsBackground = () => (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000000', overflow: 'hidden' }]}>
        {/* Top Left Edge */}
        <AnimatedGear 
            size={SCREEN_WIDTH * 0.4} 
            color="#1a1a1a" 
            top={-SCREEN_WIDTH * 0.15} 
            left={-SCREEN_WIDTH * 0.15} 
            duration={12000} 
            direction={1} 
        />
        <AnimatedGear 
            size={SCREEN_WIDTH * 0.25} 
            color="#222" 
            top={SCREEN_WIDTH * 0.1} 
            left={-SCREEN_WIDTH * 0.1} 
            duration={8000} 
            direction={-1} 
        />

        {/* Top Right Edge */}
        <AnimatedGear 
            size={SCREEN_WIDTH * 0.45} 
            color="#111" 
            top={-SCREEN_WIDTH * 0.2} 
            right={-SCREEN_WIDTH * 0.2} 
            duration={15000} 
            direction={-1} 
        />

        {/* Bottom Left Edge */}
        <AnimatedGear 
            size={SCREEN_WIDTH * 0.5} 
            color="#0a0a0a" 
            bottom={-SCREEN_WIDTH * 0.2} 
            left={-SCREEN_WIDTH * 0.2} 
            duration={18000} 
            direction={1} 
        />
        
        {/* Bottom Right Edge */}
        <AnimatedGear 
            size={SCREEN_WIDTH * 0.6} 
            color="#151515" 
            bottom={-SCREEN_WIDTH * 0.25} 
            right={-SCREEN_WIDTH * 0.3} 
            duration={20000} 
            direction={-1} 
        />
        <AnimatedGear 
            size={SCREEN_WIDTH * 0.3} 
            color="#1f1f1f" 
            bottom={SCREEN_WIDTH * 0.2} 
            right={-SCREEN_WIDTH * 0.1} 
            duration={10000} 
            direction={1} 
        />
    </View>
);

export default function Login() {
    const router = useRouter();
    const { signIn, signOut, user: authUser } = useAuthStore();

    // States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [hasBiometrics, setHasBiometrics] = useState(false);
    const [biometricLoading, setBiometricLoading] = useState(false);

    // Initial setups
    useEffect(() => {
        BiometricService.isEnabled().then((enabled: boolean) => {
            setHasBiometrics(enabled);
            if (enabled) {
                const timer = setTimeout(() => handleBiometricLogin(), 1000);
                return () => clearTimeout(timer);
            }
        });
    }, []);

    // Role verification
    useEffect(() => {
        if (authUser) {
            const allowedRoles = ['super_admin', 'service_admin', 'service_technician', 'technician', 'service_stuff'];
            if (!allowedRoles.includes(authUser.role)) {
                signOut();
                setError("Authorized Personnel Only.");
                setLoading(false);
            } else {
                setLoading(false);
            }
        }
    }, [authUser]);

    const handleSubmit = async () => {
        if (!email || !password) {
            setError("Identification required.");
            return;
        }

        setLoading(true);
        setError(null);

        const { error: authError } = await signIn(email, password);
        if (authError) {
            setError(authError || "Authentication failed");
            setLoading(false);
            return;
        }

        const enabled = await BiometricService.isEnabled();
        if (enabled) {
            await BiometricService.setEnabled(true, { email, pass: password });
        }
    };

    const handleBiometricLogin = async () => {
        setBiometricLoading(true);
        setLoading(true);
        setError(null);

        try {
            const success = await BiometricService.authenticate();
            if (success) {
                const creds = await BiometricService.getStoredCredentials();
                if (creds) {
                    const { error: authError } = await signIn(creds.email, creds.pass);
                    if (authError) setError("Session expired.");
                }
            }
        } catch (err) {
            setError("Biometric failure.");
        } finally {
            setBiometricLoading(false);
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Core Working Gears Background */}
            <GearsBackground />

            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <MotiView 
                        from={{ opacity: 0, translateY: 40 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'spring', damping: 20 }}
                        style={styles.cardContainer}
                    >
                        {/* Custom Frosted-Glass Overlay */}
                        <View style={styles.cardGlass} />
                        
                        <View style={styles.content}>
                            <View style={styles.header}>
                                <MotiView 
                                    animate={{ rotateY: ['0deg', '180deg', '360deg'] }}
                                    transition={{ loop: true, type: 'timing', duration: 8000 }}
                                    style={styles.logoBadge}
                                >
                                    <Bike size={32} color="white" />
                                </MotiView>
                                <Text style={styles.mainHeader}>SUZUZY STAFF</Text>
                                <Text style={styles.subHeader}>TERMINAL CONNECTION VALIDATION</Text>
                            </View>

                            <AnimatePresence>
                                {error && (
                                    <MotiView 
                                        from={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        style={styles.errorBanner}
                                    >
                                        <AlertCircle size={14} color="#f43f5e" />
                                        <Text style={styles.errorText}>{error}</Text>
                                    </MotiView>
                                )}
                            </AnimatePresence>

                            <View style={styles.formStack}>
                                <View>
                                    <Text style={styles.inputTitle}>CREDENTIAL EMAIL</Text>
                                    <View style={[styles.fieldContainer, focusedField === 'email' && styles.fieldActive]}>
                                        <Mail size={18} color={focusedField === 'email' ? COLORS.primary : COLORS.slate500} />
                                        <TextInput
                                            style={styles.textInput}
                                            placeholder="staff@suzuzy.com"
                                            placeholderTextColor={COLORS.slate600}
                                            value={email}
                                            onChangeText={setEmail}
                                            onFocus={() => setFocusedField('email')}
                                            onBlur={() => setFocusedField(null)}
                                            autoCapitalize="none"
                                            keyboardType="email-address"
                                        />
                                    </View>
                                </View>

                                <View>
                                    <View style={styles.labelRow}>
                                        <Text style={styles.inputTitle}>SECURE PASSCODE</Text>
                                        <TouchableOpacity><Text style={styles.forgot}>HELP?</Text></TouchableOpacity>
                                    </View>
                                    <View style={[styles.fieldContainer, focusedField === 'pass' && styles.fieldActive]}>
                                        <Lock size={18} color={focusedField === 'pass' ? COLORS.primary : COLORS.slate500} />
                                        <TextInput
                                            style={styles.textInput}
                                            placeholder="Enter Passcode"
                                            placeholderTextColor={COLORS.slate600}
                                            secureTextEntry
                                            value={password}
                                            onChangeText={setPassword}
                                            onFocus={() => setFocusedField('pass')}
                                            onBlur={() => setFocusedField(null)}
                                        />
                                    </View>
                                </View>
                            </View>

                            <View style={styles.footerActions}>
                                <TouchableOpacity 
                                    style={styles.executeButton} 
                                    onPress={handleSubmit}
                                    disabled={loading}
                                >
                                    <LinearGradient 
                                        colors={['#2563eb', '#1e40af']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.execGradient}
                                    >
                                        {loading && !biometricLoading ? (
                                            <MaterialCircularProgress size={24} color="white" />
                                        ) : (
                                            <View style={styles.execRow}>
                                                <Text style={styles.execLabel}>EXECUTE HANDSHAKE</Text>
                                                <ArrowRight size={18} color="white" />
                                            </View>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>

                                {hasBiometrics && (
                                    <TouchableOpacity 
                                        style={styles.biometricToggle} 
                                        onPress={handleBiometricLogin}
                                        disabled={loading}
                                    >
                                        <Fingerprint size={22} color="white" />
                                        <Text style={styles.bioLabel}>QUICK BIOMETRIC</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            <TouchableOpacity onPress={() => router.push('/register')} style={styles.registerCTA}>
                                <Text style={styles.ctaText}>No access ID? <Text style={styles.ctaBold}>Request Profile</Text></Text>
                            </TouchableOpacity>
                        </View>
                    </MotiView>

                    <View style={styles.protocolBadge}>
                        <ShieldCheck size={12} color={COLORS.primary} strokeWidth={3} />
                        <Text style={styles.protocolText}>ENCRYPTED PROTOCOL v4.2.0 (STABLE)</Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Immersive Biometric Modal */}
            <AnimatePresence>
                {biometricLoading && (
                    <MotiView 
                        from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={styles.bioOverlay}
                    >
                        <MotiView from={{ scale: 0.8 }} animate={{ scale: 1 }} style={styles.bioCard}>
                            <MotiView animate={{ scale: [1, 1.15, 1] }} transition={{ loop: true, duration: 1200 }}>
                                <Fingerprint size={72} color={COLORS.primary} />
                            </MotiView>
                            <Text style={styles.bioTitle}>IDENTIFYING...</Text>
                            <MaterialCircularProgress size={32} color={COLORS.primary} />
                        </MotiView>
                    </MotiView>
                )}
            </AnimatePresence>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#020617', // Ultimate depth dark
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    bikePath: {
        position: 'absolute',
        zIndex: 0,
    },
    bikeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    speedTail: {
        height: 2,
        borderRadius: 1,
        marginRight: 6,
    },
    ambientGlow: {
        display: 'none',
    },
    cardContainer: {
        borderRadius: 42,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        zIndex: 10,
        ...SHADOWS.lg,
    },
    cardGlass: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 23, 42, 0.96)', // Near solid glass
    },
    content: {
        padding: 32,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoBadge: {
        width: 72,
        height: 72,
        borderRadius: 22,
        backgroundColor: '#1e40af',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        ...SHADOWS.md,
    },
    mainHeader: {
        fontSize: 24,
        fontFamily: TYPOGRAPHY.families.black,
        color: 'white',
        letterSpacing: 2,
    },
    subHeader: {
        fontSize: 8,
        color: COLORS.slate500,
        fontFamily: TYPOGRAPHY.families.bold,
        letterSpacing: 1.5,
        marginTop: 4,
    },
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(244, 63, 94, 0.08)',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 14,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(244, 63, 94, 0.15)',
        gap: 10,
    },
    errorText: {
        color: '#fb7185',
        fontSize: 11,
        fontFamily: TYPOGRAPHY.families.bold,
    },
    formStack: {
        gap: 18,
    },
    inputTitle: {
        fontSize: 9,
        fontFamily: TYPOGRAPHY.families.black,
        color: '#2563eb',
        letterSpacing: 1,
        marginBottom: 8,
        marginLeft: 4,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    forgot: {
        fontSize: 9,
        color: COLORS.slate600,
        fontFamily: TYPOGRAPHY.families.black,
    },
    fieldContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0f172a',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        borderRadius: 18,
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
    },
    fieldActive: {
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.04)',
    },
    textInput: {
        flex: 1,
        color: 'white',
        fontFamily: TYPOGRAPHY.families.medium,
        fontSize: 15,
    },
    footerActions: {
        marginTop: 32,
        gap: 12,
    },
    executeButton: {
        height: 62,
        borderRadius: 20,
        overflow: 'hidden',
        ...SHADOWS.md,
    },
    execGradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    execRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    execLabel: {
        color: 'white',
        fontFamily: TYPOGRAPHY.families.black,
        fontSize: 13,
        letterSpacing: 1,
    },
    biometricToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(255,255,255,0.02)',
        gap: 10,
    },
    bioLabel: {
        color: 'white',
        fontFamily: TYPOGRAPHY.families.bold,
        fontSize: 12,
        letterSpacing: 0.5,
    },
    registerCTA: {
        marginTop: 24,
        alignItems: 'center',
    },
    ctaText: {
        fontSize: 11,
        color: COLORS.slate500,
        fontFamily: TYPOGRAPHY.families.medium,
    },
    ctaBold: {
        color: '#2563eb',
        fontFamily: TYPOGRAPHY.families.black,
    },
    protocolBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 40,
        opacity: 0.5,
    },
    protocolText: {
        fontSize: 8,
        color: COLORS.slate500,
        fontFamily: TYPOGRAPHY.families.black,
        letterSpacing: 1,
    },
    bioOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(2, 6, 23, 0.98)',
        zIndex: 1000,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bioCard: {
        backgroundColor: '#0f172a',
        paddingVertical: 50,
        paddingHorizontal: 60,
        borderRadius: 48,
        alignItems: 'center',
        gap: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    bioTitle: {
        color: 'white',
        fontFamily: TYPOGRAPHY.families.black,
        fontSize: 13,
        letterSpacing: 2,
    }
});
