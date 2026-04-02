import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Platform, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { KeyRound, Mail, ArrowRight, ShieldCheck, Zap, Fingerprint, AlertCircle } from 'lucide-react-native';
import { useAuth } from '../../lib/auth';
import { MotiView, AnimatePresence } from 'moti';
import { BiometricService } from '../../services/biometric';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

export default function Login() {
  const router = useRouter();
  const { signIn, signOut, user: authUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [hasBiometrics, setHasBiometrics] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);

  // Memoize signOut to prevent useEffect loop
  const memoizedSignOut = useCallback(() => signOut(), [signOut]);

  useEffect(() => {
    // Check if biometrics was enabled in settings
    BiometricService.isEnabled().then(enabled => {
      setHasBiometrics(enabled);
      if (enabled) {
        // Auto-trigger biometric after a short delay for better UX
        const timer = setTimeout(() => {
          handleBiometricLogin();
        }, 1200);
        return () => clearTimeout(timer);
      }
    });
  }, []);

  useEffect(() => {
    if (authUser) {
      const allowedRoles = ['super_admin', 'service_admin', 'service_technician', 'technician', 'service_stuff'];
      if (!allowedRoles.includes(authUser.role)) {
        memoizedSignOut();
        setError("Access denied: Service Personnel Only.");
        setLoading(false);
      } else {
        // Successful login - navigation is handled by RootLayout redirect logic
        setLoading(false);
      }
    }
  }, [authUser, memoizedSignOut]);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error: authError } = await signIn(email, password);

    if (authError) {
      setError(authError || "Invalid credentials");
      setLoading(false);
      return;
    }

    // If login is successful and biometric is enabled, store credentials
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
      const failCount = await BiometricService.getFailCount();
      const success = await BiometricService.authenticate();

      if (success) {
        const creds = await BiometricService.getStoredCredentials();
        if (creds) {
          const { error: authError } = await signIn(creds.email, creds.pass);
          if (authError) {
            setError("Session expired or credentials changed. Please login manually.");
          }
        } else {
          setError("No biometric credentials found. Please login with password first.");
        }
      } else {
        const currentFails = await BiometricService.getFailCount();
        if (currentFails >= 3) {
          setError("Too many biometric failures. Please use your phone password/PIN or enter credentials below.");
        }
      }
    } catch (err) {
      console.error("Biometric login error:", err);
      setError("Biometric authentication failed.");
    } finally {
      setBiometricLoading(false);
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} style={styles.container}>
      <View style={styles.innerContainer}>
        {/* Biometric Loading Overlay */}
        <AnimatePresence>
          {biometricLoading && (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={styles.biometricOverlay}
            >
              <View style={styles.biometricOverlayContent}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.biometricOverlayText}>Biometric Authentication...</Text>
              </View>
            </MotiView>
          )}
        </AnimatePresence>

        {/* Background Overlay */}
        <View style={styles.overlay} />

        <MotiView
          from={{ opacity: 0, scale: 0.95, translateY: 20 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600 }}
          style={styles.cardWrapper}
        >
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <View style={styles.header}>
                <MotiView
                  from={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 200 }}
                  style={styles.logoContainer}
                >
                  <Zap size={32} color={COLORS.white} fill={COLORS.white} />
                </MotiView>

                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Identify yourself to access the network.</Text>

                <AnimatePresence>
                  {error && (
                    <MotiView
                      from={{ opacity: 0, height: 0, translateY: -10 }}
                      animate={{ opacity: 1, height: 'auto', translateY: 0 }}
                      exit={{ opacity: 0, height: 0, translateY: -10 }}
                      style={styles.errorContainer}
                    >
                      <AlertCircle size={18} color={COLORS.danger} />
                      <Text style={styles.errorText}>{error}</Text>
                    </MotiView>
                  )}
                </AnimatePresence>
              </View>

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  {/* Email Input */}
                  <View>
                    <Text style={styles.inputLabel}>ACCESS ID / EMAIL</Text>
                    <View style={[
                      styles.inputWrapper,
                      focusedField === 'email' ? styles.inputWrapperFocused : null
                    ]}>
                      <Mail size={18} color={focusedField === 'email' ? COLORS.primary : COLORS.slate500} />
                      <TextInput
                        style={styles.input}
                        placeholder="staff@showroom.com"
                        placeholderTextColor={COLORS.slate600}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                      />
                    </View>
                  </View>

                  {/* Password Input */}
                  <View style={styles.mt4}>
                    <View style={styles.passwordHeader}>
                      <Text style={styles.inputLabel}>PASSCODE</Text>
                      <TouchableOpacity>
                        <Text style={styles.forgotText}>FORGOT?</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={[
                      styles.inputWrapper,
                      focusedField === 'password' ? styles.inputWrapperFocused : null
                    ]}>
                      <KeyRound size={18} color={focusedField === 'password' ? COLORS.primary : COLORS.slate500} />
                      <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        placeholderTextColor={COLORS.slate600}
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                      />
                    </View>
                  </View>
                </View>

                {/* Submit Buttons */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={loading}
                    style={styles.primaryButton}
                  >
                    {loading && !hasBiometrics ? (
                      <ActivityIndicator color={COLORS.white} />
                    ) : (
                      <View style={styles.buttonInner}>
                        <Text style={styles.primaryButtonText}>INITIALIZE SESSION</Text>
                        <ArrowRight size={16} color={COLORS.white} />
                      </View>
                    )}
                  </TouchableOpacity>

                  {hasBiometrics && (
                    <TouchableOpacity
                      onPress={handleBiometricLogin}
                      disabled={loading}
                      style={styles.secondaryButton}
                    >
                      {loading ? (
                        <ActivityIndicator color={COLORS.primary} />
                      ) : (
                        <View style={styles.buttonInner}>
                          <Fingerprint size={16} color={COLORS.primary} />
                          <Text style={styles.secondaryButtonText}>BIOMETRIC AUTH</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  )}
                </View>

                {/* Register Link */}
                <View style={styles.registerContainer}>
                  <Text style={styles.registerText}>
                    New staff member?{' '}
                    <Text
                      onPress={() => router.push('/register')}
                      style={styles.registerLink}
                    >
                      Register Access
                    </Text>
                  </Text>
                </View>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <View style={styles.footerProtocol}>
                <ShieldCheck size={14} color={COLORS.primary} />
                <Text style={styles.footerText}>Secure Network</Text>
              </View>
              <Text style={styles.versionText}>v3.0.0 (RN)</Text>
            </View>
          </View>
        </MotiView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.slate950,
  },
  scrollContent: {
    flexGrow: 1,
  },
  innerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.darkPage,
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 500,
  },
  card: {
    backgroundColor: COLORS.darkCard,
    borderRadius: BORDER_RADIUS.xxl,
    ...SHADOWS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
  },
  cardContent: {
    padding: SPACING.xl,
  },
  header: {
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  logoContainer: {
    width: 64,
    height: 64,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontFamily: TYPOGRAPHY.families.bold,
    color: COLORS.white,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontFamily: TYPOGRAPHY.families.medium,
    color: COLORS.slate400,
    textAlign: 'center',
  },
  errorContainer: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.dangerBg,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: BORDER_RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    overflow: 'hidden',
  },
  errorText: {
    color: 'rgba(248, 113, 113, 1)',
    fontFamily: TYPOGRAPHY.families.medium,
    fontSize: TYPOGRAPHY.sizes.sm,
    flex: 1,
  },
  form: {
    gap: SPACING.lg,
  },
  inputGroup: {
    gap: SPACING.md,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.sizes.xxs,
    fontFamily: TYPOGRAPHY.families.bold,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginLeft: SPACING.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    backgroundColor: COLORS.darkInput,
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  inputWrapperFocused: {
    borderColor: COLORS.primary,
  },
  input: {
    flex: 1,
    marginLeft: SPACING.md,
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontFamily: TYPOGRAPHY.families.regular,
  },
  mt4: {
    marginTop: SPACING.md,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    marginHorizontal: SPACING.xs,
  },
  forgotText: {
    fontSize: TYPOGRAPHY.sizes.xxs,
    fontFamily: TYPOGRAPHY.families.bold,
    color: COLORS.slate500,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    gap: SPACING.md,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: COLORS.white,
    fontFamily: TYPOGRAPHY.families.bold,
    letterSpacing: 1.5,
    fontSize: TYPOGRAPHY.sizes.sm,
    textTransform: 'uppercase',
    marginRight: SPACING.sm,
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: COLORS.darkInput,
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: COLORS.white,
    fontFamily: TYPOGRAPHY.families.bold,
    letterSpacing: 1.5,
    fontSize: TYPOGRAPHY.sizes.sm,
    textTransform: 'uppercase',
    marginLeft: SPACING.sm,
  },
  registerContainer: {
    marginTop: SPACING.xl,
    alignItems: 'center',
  },
  registerText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontFamily: TYPOGRAPHY.families.medium,
    color: COLORS.slate500,
  },
  registerLink: {
    color: COLORS.primary,
    fontFamily: TYPOGRAPHY.families.bold,
  },
  footer: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.darkPage,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerProtocol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  footerText: {
    fontSize: TYPOGRAPHY.sizes.xxs,
    fontFamily: TYPOGRAPHY.families.bold,
    color: COLORS.slate500,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: SPACING.sm,
  },
  versionText: {
    fontSize: TYPOGRAPHY.sizes.xxs,
    fontFamily: 'monospace',
    color: COLORS.slate500,
  },
  biometricOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 6, 23, 0.8)',
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  biometricOverlayContent: {
    backgroundColor: COLORS.slate900,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.slate800,
  },
  biometricOverlayText: {
    color: COLORS.white,
    fontFamily: TYPOGRAPHY.families.bold,
    fontSize: TYPOGRAPHY.sizes.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
