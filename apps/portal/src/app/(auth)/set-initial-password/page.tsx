'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ArrowRight, ShieldCheck, CheckCircle2, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/premium/GlassCard';
import { MetallicText } from '@/components/ui/premium/MetallicText';
import { GradientButton } from '@/components/ui/premium/GradientButton';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useUser } from '@/hooks/useUser';
import { useQueryClient } from '@tanstack/react-query';

export default function SetInitialPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const { profile } = useUser();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to update password");
                setIsLoading(false);
                return;
            }

            setSuccess(true);

            // Invalidate auth query to ensure fresh data
            await queryClient.invalidateQueries({ queryKey: ["auth-user"] });

            const role = profile?.role || "customer";
            let redirectPath = "/dashboard";

            if (role === "super_admin") {
                redirectPath = "/super-admin/dashboard";
            } else if (role === "service_admin") {
                redirectPath = "/service-admin/dashboard";
            } else if (role.includes("sales_admin")) {
                redirectPath = "/sales-admin/dashboard";
            } else if (role.includes("showroom") || role.includes("service") || role === "support" || role === "accountant" || role === "admin") {
                redirectPath = "/admin/dashboard";
            } else if (role.includes("dealer") || role === "sub_dealer") {
                redirectPath = "/dealer/dashboard";
            }

            setTimeout(() => {
                router.push(redirectPath);
            }, 2000);
        } catch (err: any) {
            console.error("Password change error:", err);
            setError("An unexpected error occurred");
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#0D0D0F] flex items-center justify-center p-6">
                <GlassCard className="p-12 max-w-md w-full text-center border-[#D4AF37]/20">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="mb-6 flex justify-center"
                    >
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-full">
                            <CheckCircle2 className="w-12 h-12 text-green-500" />
                        </div>
                    </motion.div>
                    <h2 className="text-3xl font-display font-bold text-white mb-4">Password Secured</h2>
                    <p className="text-white/40 mb-8">Your permanent password has been set. Redirecting to your dashboard...</p>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0D0D0F] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/10 blur-[150px] rounded-full -mr-64 -mt-64" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#DC2626]/5 blur-[150px] rounded-full -ml-64 -mb-64" />

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-xl relative z-10"
            >
                <GlassCard className="p-8 md:p-12 border-[#D4AF37]/20">
                    <div className="mb-10 text-center">
                        <div className="flex justify-center mb-6">
                            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
                                <ShieldCheck className="w-8 h-8 text-[#D4AF37]" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-display font-bold text-white mb-2">Set Your Password</h2>
                        <p className="text-white/40">For security, you must change your temporary password before proceeding.</p>
                    </div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium rounded-2xl flex items-center gap-3"
                            >
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#D4AF37] uppercase tracking-widest ml-1">Temporary Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-[#D4AF37] transition-colors" />
                                <Input
                                    type="password"
                                    placeholder="Enter temporary password"
                                    className="pl-12 h-14 bg-white/5 border-white/10 focus:border-[#D4AF37]/50 focus:bg-white/10 transition-all rounded-2xl text-white"
                                    required
                                    value={formData.currentPassword}
                                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#D4AF37] uppercase tracking-widest ml-1">New Permanent Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-[#D4AF37] transition-colors" />
                                <Input
                                    type="password"
                                    placeholder="Min. 8 characters with caps & numbers"
                                    className="pl-12 h-14 bg-white/5 border-white/10 focus:border-[#D4AF37]/50 focus:bg-white/10 transition-all rounded-2xl text-white"
                                    required
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#D4AF37] uppercase tracking-widest ml-1">Confirm New Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-[#D4AF37] transition-colors" />
                                <Input
                                    type="password"
                                    placeholder="Repeat new password"
                                    className="pl-12 h-14 bg-white/5 border-white/10 focus:border-[#D4AF37]/50 focus:bg-white/10 transition-all rounded-2xl text-white"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />
                            </div>
                        </div>

                        <GradientButton
                            type="submit"
                            className="w-full h-14 text-lg mt-4"
                            disabled={isLoading}
                        >
                            {isLoading ? "Updating Security..." : (
                                <>
                                    Secure Account
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </GradientButton>
                    </form>

                    <div className="mt-8 text-center">
                        <button
                            onClick={() => router.push('/login')}
                            className="flex items-center gap-2 text-xs font-bold text-white/20 hover:text-white transition-colors uppercase tracking-[0.2em] group mx-auto"
                        >
                            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                            Return to Login
                        </button>
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    );
}
