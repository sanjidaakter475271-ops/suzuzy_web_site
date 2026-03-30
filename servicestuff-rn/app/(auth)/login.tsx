import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { KeyRound, Mail, ArrowRight, ShieldCheck, Zap, Fingerprint, AlertCircle } from 'lucide-react-native';
import { useAuth } from '../../lib/auth';
import { MotiView, AnimatePresence } from 'moti';
import { BiometricService } from '../../services/biometric';

export default function Login() {
  const router = useRouter();
  const { signIn, signOut, user: authUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [hasBiometrics, setHasBiometrics] = useState(false);

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
      const allowedRoles = ['super_admin', 'service_admin', 'service_technician'];
      if (!allowedRoles.includes(authUser.role)) {
        signOut();
        setError("Access denied: Service Personnel Only.");
        setLoading(false);
      } else {
        // Successful login - navigation is handled by RootLayout redirect logic
        setLoading(false);
      }
    }
  }, [authUser, signOut]);

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
            setLoading(false);
          }
        } else {
          setError("No biometric credentials found. Please login with password first.");
          setLoading(false);
        }
      } else {
        const currentFails = await BiometricService.getFailCount();
        if (currentFails >= 3) {
          setError("Too many biometric failures. Please use your phone password/PIN or enter credentials below.");
        }
        setLoading(false);
      }
    } catch (err) {
      console.error("Biometric login error:", err);
      setError("Biometric authentication failed.");
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-slate-950">
      <View className="flex-1 items-center justify-center p-4">
        {/* Background Overlay */}
        <View className="absolute inset-0 bg-[#0a0f1c]" />

        <MotiView
          from={{ opacity: 0, scale: 0.95, translateY: 20 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600 }}
          className="w-full max-w-lg"
        >
          <View className="bg-[#0d1326] rounded-[40px] shadow-2xl overflow-hidden border border-slate-800/50">
            <View className="p-8 md:p-12">
              <View className="mb-10 items-center">
                <MotiView
                  from={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 200 }}
                  className="w-16 h-16 bg-blue-500 rounded-2xl items-center justify-center shadow-xl shadow-blue-500/20 mb-6"
                >
                  <Zap size={32} color="white" fill="white" />
                </MotiView>

                <Text className="text-3xl font-bold text-white mb-2 text-center">Welcome Back</Text>
                <Text className="text-slate-400 font-medium text-sm text-center">Identify yourself to access the network.</Text>

                <AnimatePresence>
                  {error && (
                    <MotiView
                      from={{ opacity: 0, height: 0, translateY: -10 }}
                      animate={{ opacity: 1, height: 'auto', translateY: 0 }}
                      exit={{ opacity: 0, height: 0, translateY: -10 }}
                      className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex-row items-center space-x-3 overflow-hidden"
                    >
                      <AlertCircle size={18} color="#f87171" />
                      <Text className="text-red-400 font-medium text-sm flex-1">{error}</Text>
                    </MotiView>
                  )}
                </AnimatePresence>
              </View>

              <View className="space-y-6">
                <View className="space-y-4">
                  {/* Email Input */}
                  <View>
                    <Text className="text-[10px] font-bold text-blue-500 mb-2 uppercase tracking-widest ml-1">ACCESS ID / EMAIL</Text>
                    <View className={`relative flex-row items-center bg-[#131b2f] border rounded-xl px-4 py-3 ${focusedField === 'email' ? 'border-blue-500' : 'border-[#1e293b]'}`}>
                      <Mail size={18} color={focusedField === 'email' ? '#3b82f6' : '#64748b'} />
                      <TextInput
                        className="flex-1 ml-3 text-white text-sm"
                        placeholder="staff@showroom.com"
                        placeholderTextColor="#475569"
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
                  <View className="mt-4">
                    <View className="flex-row justify-between items-center mb-2 mx-1">
                      <Text className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">PASSCODE</Text>
                      <TouchableOpacity>
                        <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">FORGOT?</Text>
                      </TouchableOpacity>
                    </View>
                    <View className={`relative flex-row items-center bg-[#131b2f] border rounded-xl px-4 py-3 ${focusedField === 'password' ? 'border-blue-500' : 'border-[#1e293b]'}`}>
                      <KeyRound size={18} color={focusedField === 'password' ? '#3b82f6' : '#64748b'} />
                      <TextInput
                        className="flex-1 ml-3 text-white text-sm tracking-widest"
                        placeholder="••••••••"
                        placeholderTextColor="#475569"
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
                <View className="items-center mt-8 space-y-4">
                  <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={loading}
                    className="w-full bg-blue-500 rounded-2xl py-4 items-center justify-center shadow-lg shadow-blue-500/20 active:opacity-80"
                  >
                    {loading && !hasBiometrics ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <View className="flex-row items-center justify-center">
                        <Text className="text-white font-bold tracking-widest text-[13px] uppercase mr-2">INITIALIZE SESSION</Text>
                        <ArrowRight size={16} color="white" />
                      </View>
                    )}
                  </TouchableOpacity>

                  {hasBiometrics && (
                    <TouchableOpacity
                      onPress={handleBiometricLogin}
                      disabled={loading}
                      className="w-full bg-[#131b2f] border border-[#1e293b] rounded-2xl py-4 items-center justify-center mt-4 active:opacity-80"
                    >
                      {loading ? (
                        <ActivityIndicator color="#3b82f6" />
                      ) : (
                        <View className="flex-row items-center">
                          <Fingerprint size={16} color="#3b82f6" className="mr-2" />
                          <Text className="text-white font-bold tracking-widest text-[13px] uppercase ml-2">BIOMETRIC AUTH</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  )}
                </View>

                {/* Register Link */}
                <View className="mt-10 items-center">
                  <Text className="text-sm font-medium text-slate-500">
                    New staff member?{' '}
                    <Text
                      onPress={() => router.push('/register')}
                      className="text-blue-500 font-bold"
                    >
                      Register Access
                    </Text>
                  </Text>
                </View>
              </View>
            </View>

            {/* Footer */}
            <View className="px-8 py-4 bg-[#0a0f1c] border-t border-[#1e293b] flex-row justify-between items-center">
              <View className="flex-row items-center space-x-2">
                <ShieldCheck size={14} color="#3b82f6" />
                <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2">Secure Network</Text>
              </View>
              <Text className="text-[10px] font-mono text-slate-500">v3.0.0 (RN)</Text>
            </View>
          </View>
        </MotiView>
      </View>
    </ScrollView>
  );
}
