'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Mail, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { GlassCard } from '@/components/ui/premium/GlassCard';
import { MetallicText } from '@/components/ui/premium/MetallicText';
import { GradientButton } from '@/components/ui/premium/GradientButton';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth/client';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const { error } = await (authClient as any).forgetPassword({
            email,
            redirectTo: "/reset-password",
        });

        if (error) {
            setError(error.message);
            setIsLoading(false);
        } else {
            setIsSent(true);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0D0D0F] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/5 blur-[150px] rounded-full -mr-64 -mt-64" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg relative z-10"
            >
                <div className="flex flex-col items-center mb-12">
                    <Link href="/" className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-white/5 border border-white/10 rounded-xl">
                            <ShieldCheck className="w-6 h-6 text-[#D4AF37]" />
                        </div>
                        <span className="text-xl font-display font-black tracking-[0.2em] text-white uppercase">Royal<span className="text-[#D4AF37]">Consortium</span></span>
                    </Link>
                    <h1 className="text-3xl font-display font-black text-white italic tracking-wider">
                        RECOVER <MetallicText>ACCESS</MetallicText>
                    </h1>
                </div>

                <GlassCard className="p-8 md:p-12 border-[#D4AF37]/20">
                    {!isSent ? (
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="text-center mb-8">
                                <p className="text-white/40 font-medium">Enter your email address and we&apos;ll send you a link to reset your password.</p>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium rounded-2xl">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-[#D4AF37] transition-colors" />
                                    <Input
                                        type="email"
                                        placeholder="Enter your email"
                                        className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl text-white outline-none focus:border-[#D4AF37]/50"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <GradientButton className="w-full h-14" disabled={isLoading}>
                                {isLoading ? "Processing..." : (
                                    <>
                                        Send Recovery Link
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </GradientButton>

                            <div className="text-center pt-4">
                                <Link href="/login" className="text-sm font-bold text-white/40 hover:text-white flex items-center justify-center gap-2 group transition-colors">
                                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                                    Back to Login
                                </Link>
                            </div>
                        </form>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-10 space-y-8"
                        >
                            <div className="w-20 h-20 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Mail className="w-10 h-10 text-[#D4AF37]" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4">Check Your Inbox</h2>
                                <p className="text-white/40 leading-relaxed font-medium">
                                    We&apos;ve sent a recovery link to <br />
                                    <span className="text-white">{email}</span>.
                                </p>
                            </div>
                            <Link href="/login">
                                <GradientButton className="w-full h-14">Return to login</GradientButton>
                            </Link>
                        </motion.div>
                    )}
                </GlassCard>
            </motion.div>
        </div>
    );
}
