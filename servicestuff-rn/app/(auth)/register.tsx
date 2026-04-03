import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Mail, Lock, ArrowLeft, Zap, CheckCircle2, AlertCircle, ShieldCheck } from '@/components/icons';
import { useAuthStore } from '@/stores/authStore';
import { MotiView, AnimatePresence } from 'moti';
import { MaterialCircularProgress } from '@/components/ui/Loading';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '@/constants/theme';

export default function Register() {
  const router = useRouter();
  const { signUp } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async () => {
    setError(null);

    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const { error: authError } = await signUp(
      formData.email,
      formData.password,
      formData.name,
    );

    if (authError) {
      setError(authError || "Registration failed");
      setLoading(false);
      return;
    }

    Alert.alert(
      "Success",
      "Registration successful! Please ask an admin to authorize your service role.",
      [{ text: "OK", onPress: () => router.replace('/login') }]
    );
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} style={styles.container}>
      <View style={styles.innerContainer}>
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
              <TouchableOpacity
                onPress={() => router.replace('/login')}
                style={styles.backButton}
              >
                <ArrowLeft size={16} color={COLORS.slate500} />
                <Text style={styles.backButtonText}>Return to Login</Text>
              </TouchableOpacity>

              <View style={styles.header}>
                <Text style={styles.title}>Create Profile</Text>
                <Text style={styles.subtitle}>Join the service network. Admin authorization required.</Text>

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
                {/* Name Input */}
                <View>
                  <Text style={styles.inputLabel}>FULL NAME</Text>
                  <View style={[
                    styles.inputWrapper,
                    focusedField === 'name' ? styles.inputWrapperFocused : null
                  ]}>
                    <User size={18} color={focusedField === 'name' ? COLORS.primary : COLORS.slate500} />
                    <TextInput
                      style={styles.input}
                      placeholder="Technician Name"
                      placeholderTextColor={COLORS.slate600}
                      value={formData.name}
                      onChangeText={(val) => setFormData({ ...formData, name: val })}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </View>

                {/* Email Input */}
                <View style={styles.mt4}>
                  <Text style={styles.inputLabel}>WORK EMAIL</Text>
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
                      value={formData.email}
                      onChangeText={(val) => setFormData({ ...formData, email: val })}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View style={styles.mt4}>
                  <Text style={styles.inputLabel}>SECURE PASSCODE</Text>
                  <View style={[
                    styles.inputWrapper,
                    focusedField === 'password' ? styles.inputWrapperFocused : null
                  ]}>
                    <Lock size={18} color={focusedField === 'password' ? COLORS.primary : COLORS.slate500} />
                    <TextInput
                      style={[styles.input, styles.trackingWidest]}
                      placeholder="••••••••"
                      placeholderTextColor={COLORS.slate600}
                      secureTextEntry
                      value={formData.password}
                      onChangeText={(val) => setFormData({ ...formData, password: val })}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </View>

                {/* Confirm Password Input */}
                <View style={styles.mt4}>
                  <Text style={styles.inputLabel}>CONFIRM PASSCODE</Text>
                  <View style={[
                    styles.inputWrapper,
                    focusedField === 'confirm' ? styles.inputWrapperFocused : null
                  ]}>
                    <Lock size={18} color={focusedField === 'confirm' ? COLORS.primary : COLORS.slate500} />
                    <TextInput
                      style={[styles.input, styles.trackingWidest]}
                      placeholder="••••••••"
                      placeholderTextColor={COLORS.slate600}
                      secureTextEntry
                      value={formData.confirmPassword}
                      onChangeText={(val) => setFormData({ ...formData, confirmPassword: val })}
                      onFocus={() => setFocusedField('confirm')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </View>

                <View style={styles.submitContainer}>
                  <View style={styles.agreementBox}>
                    <CheckCircle2 size={16} color={COLORS.primary} />
                    <Text style={styles.agreementText}>
                      By registering, you agree to the workshop safety protocols and data privacy guidelines. Access will be reviewed by system administrators.
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={loading}
                    style={styles.primaryButton}
                  >
                    {loading ? (
                      <MaterialCircularProgress size={24} color={COLORS.white} />
                    ) : (
                      <View style={styles.buttonInner}>
                        <Text style={styles.primaryButtonText}>COMPLETE REGISTRATION</Text>
                        <Zap size={16} color={COLORS.white} fill={COLORS.white} />
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <View style={styles.footerProtocol}>
                <ShieldCheck size={14} color={COLORS.primary} />
                <Text style={styles.footerText}>Protocol V3 Secure</Text>
              </View>
              <Text style={styles.versionText}>Encrypted Session</Text>
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
    maxWidth: 600,
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  backButtonText: {
    color: COLORS.slate500,
    fontSize: TYPOGRAPHY.sizes.xxs,
    fontFamily: TYPOGRAPHY.families.bold,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginLeft: SPACING.sm,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xxxl,
    fontFamily: TYPOGRAPHY.families.bold,
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontFamily: TYPOGRAPHY.families.medium,
    color: COLORS.slate400,
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
    alignItems: 'center',
    backgroundColor: COLORS.darkInput,
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
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
  trackingWidest: {
    letterSpacing: 4,
  },
  mt4: {
    marginTop: SPACING.md,
  },
  submitContainer: {
    marginTop: SPACING.xl,
    alignItems: 'center',
  },
  agreementBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    backgroundColor: COLORS.darkInput,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: '#1e293b',
    width: '100%',
    marginBottom: SPACING.xl,
  },
  agreementText: {
    flex: 1,
    color: COLORS.slate400,
    fontSize: TYPOGRAPHY.sizes.xxs,
    fontFamily: TYPOGRAPHY.families.medium,
    lineHeight: 18,
    marginLeft: SPACING.sm,
  },
  primaryButton: {
    width: '90%',
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
  },
  primaryButtonText: {
    color: COLORS.white,
    fontFamily: TYPOGRAPHY.families.bold,
    letterSpacing: 1.5,
    fontSize: TYPOGRAPHY.sizes.sm,
    textTransform: 'uppercase',
    marginRight: SPACING.sm,
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
    letterSpacing: 1.5,
    marginLeft: SPACING.sm,
  },
  versionText: {
    fontSize: TYPOGRAPHY.sizes.xxs,
    fontFamily: 'monospace',
    color: COLORS.slate500,
  },
});
