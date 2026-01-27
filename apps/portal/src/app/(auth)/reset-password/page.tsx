'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { GlassCard } from '@/components/ui/premium/GlassCard';
import { MetallicText } from '@/components/ui/premium/MetallicText';
import { GradientButton } from '@/components/ui/premium/GradientButton';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth/client';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);
        setError(null);

        const { error } = await authClient.resetPassword({
            newPassword: password,
        });

        if (error) {
            setError(error.message || "Failed to update security credentials");
            setIsLoading(false);
        } else {
            setSuccess(true);
            setIsLoading(false);
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        }
    };

    return (
        <div className="min-h-screen bg-[#0D0D0F] flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/10 blur-[150px] rounded-full -mr-64 -mt-64" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg relative z-10"
            >
                <div className="flex flex-col items-center mb-12">
                    <div className="p-2 bg-white/5 border border-white/10 rounded-xl mb-8">
                        <ShieldCheck className="w-6 h-6 text-[#D4AF37]" />
                    </div>
                    <h1 className="text-3xl font-display font-black text-white italic tracking-wider uppercase">
                        UPDATE <MetallicText>PASSWORD</MetallicText>
                    </h1>
                </div>

                <GlassCard className="p-8 md:p-12 border-[#D4AF37]/20">
                    {!success ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <p className="text-white/40 text-center mb-8 font-medium">Create a new secure password for your account.</p>

                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium rounded-2xl">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest ml-1">New Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-[#D4AF37] transition-colors" />
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl text-white focus:border-[#D4AF37]/50"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest ml-1">Confirm Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-[#D4AF37] transition-colors" />
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl text-white focus:border-[#D4AF37]/50"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <GradientButton className="w-full h-14" disabled={isLoading}>
                                {isLoading ? "Updating..." : (
                                    <>
                                        Reset Password
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </GradientButton>
                        </form>
                    ) : (
                        <div className="text-center py-10 space-y-6">
                            <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShieldCheck className="w-10 h-10 text-green-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Password Updated</h2>
                            <p className="text-white/40 leading-relaxed font-medium">
                                Your password has been successfully reset. <br />
                                Redirecting to login...
                            </p>
                        </div>
                    )}
                </GlassCard>
            </motion.div>
        </div>
    );
}
