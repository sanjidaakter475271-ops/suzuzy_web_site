import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Mail, Lock, ArrowLeft, Zap, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react-native';
import { useAuth } from '../../lib/auth';
import { MotiView, AnimatePresence } from 'moti';

export default function Register() {
  const router = useRouter();
  const { signUp } = useAuth();
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
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-slate-950">
      <View className="flex-1 items-center justify-center p-4">
        {/* Background Overlay */}
        <View className="absolute inset-0 bg-[#0a0f1c]" />

        <MotiView
          from={{ opacity: 0, scale: 0.95, translateY: 20 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600 }}
          className="w-full max-w-xl"
        >
          <View className="bg-[#0d1326] rounded-[40px] shadow-2xl overflow-hidden border border-slate-800/50">
            <View className="p-8 md:p-12">
              <TouchableOpacity
                onPress={() => router.replace('/login')}
                className="flex-row items-center mb-8"
              >
                <ArrowLeft size={16} color="#64748b" />
                <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest ml-2">Return to Login</Text>
              </TouchableOpacity>

              <View className="mb-10">
                <Text className="text-3xl font-bold text-white mb-3">Create Profile</Text>
                <Text className="text-slate-400 font-medium text-sm">Join the service network. Admin authorization required.</Text>

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
                {/* Name Input */}
                <View>
                  <Text className="text-[10px] font-bold text-blue-500 mb-2 uppercase tracking-widest ml-1">FULL NAME</Text>
                  <View className={`relative flex-row items-center bg-[#131b2f] border rounded-xl px-4 py-3 ${focusedField === 'name' ? 'border-blue-500' : 'border-[#1e293b]'}`}>
                    <User size={18} color={focusedField === 'name' ? '#3b82f6' : '#64748b'} />
                    <TextInput
                      className="flex-1 ml-3 text-white text-sm"
                      placeholder="Technician Name"
                      placeholderTextColor="#475569"
                      value={formData.name}
                      onChangeText={(val) => setFormData({ ...formData, name: val })}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </View>

                {/* Email Input */}
                <View className="mt-4">
                  <Text className="text-[10px] font-bold text-blue-500 mb-2 uppercase tracking-widest ml-1">WORK EMAIL</Text>
                  <View className={`relative flex-row items-center bg-[#131b2f] border rounded-xl px-4 py-3 ${focusedField === 'email' ? 'border-blue-500' : 'border-[#1e293b]'}`}>
                    <Mail size={18} color={focusedField === 'email' ? '#3b82f6' : '#64748b'} />
                    <TextInput
                      className="flex-1 ml-3 text-white text-sm"
                      placeholder="staff@showroom.com"
                      placeholderTextColor="#475569"
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
                <View className="mt-4">
                  <Text className="text-[10px] font-bold text-blue-500 mb-2 uppercase tracking-widest ml-1">SECURE PASSCODE</Text>
                  <View className={`relative flex-row items-center bg-[#131b2f] border rounded-xl px-4 py-3 ${focusedField === 'password' ? 'border-blue-500' : 'border-[#1e293b]'}`}>
                    <Lock size={18} color={focusedField === 'password' ? '#3b82f6' : '#64748b'} />
                    <TextInput
                      className="flex-1 ml-3 text-white text-sm tracking-widest"
                      placeholder="••••••••"
                      placeholderTextColor="#475569"
                      secureTextEntry
                      value={formData.password}
                      onChangeText={(val) => setFormData({ ...formData, password: val })}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </View>

                {/* Confirm Password Input */}
                <View className="mt-4">
                  <Text className="text-[10px] font-bold text-blue-500 mb-2 uppercase tracking-widest ml-1">CONFIRM PASSCODE</Text>
                  <View className={`relative flex-row items-center bg-[#131b2f] border rounded-xl px-4 py-3 ${focusedField === 'confirm' ? 'border-blue-500' : 'border-[#1e293b]'}`}>
                    <Lock size={18} color={focusedField === 'confirm' ? '#3b82f6' : '#64748b'} />
                    <TextInput
                      className="flex-1 ml-3 text-white text-sm tracking-widest"
                      placeholder="••••••••"
                      placeholderTextColor="#475569"
                      secureTextEntry
                      value={formData.confirmPassword}
                      onChangeText={(val) => setFormData({ ...formData, confirmPassword: val })}
                      onFocus={() => setFocusedField('confirm')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </View>

                <View className="mt-8 items-center">
                  <View className="flex-row items-start space-x-3 bg-[#131b2f] p-4 rounded-2xl border border-[#1e293b] w-full mb-8">
                    <CheckCircle2 size={16} color="#3b82f6" />
                    <Text className="flex-1 text-slate-400 text-[11px] font-medium leading-relaxed ml-2">
                      By registering, you agree to the workshop safety protocols and data privacy guidelines. Access will be reviewed by system administrators.
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={loading}
                    className="w-[90%] bg-blue-500 rounded-2xl py-4 items-center justify-center shadow-lg shadow-blue-500/20 active:opacity-80"
                  >
                    {loading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <View className="flex-row items-center">
                        <Text className="text-white font-bold tracking-widest text-[13px] uppercase mr-2">COMPLETE REGISTRATION</Text>
                        <Zap size={16} color="white" fill="white" />
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Footer */}
            <View className="px-8 py-4 bg-[#0a0f1c] border-t border-[#1e293b] flex-row justify-between items-center">
              <View className="flex-row items-center space-x-2">
                <ShieldCheck size={14} color="#3b82f6" />
                <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2">Protocol V3 Secure</Text>
              </View>
              <Text className="text-[10px] font-mono text-slate-500 uppercase">Encrypted Session</Text>
            </View>
          </View>
        </MotiView>
      </View>
    </ScrollView>
  );
}
