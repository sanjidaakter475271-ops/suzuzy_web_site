'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, ArrowRight, ShieldCheck, ChevronRight } from 'lucide-react';
import { GlassCard } from '@/components/ui/premium/GlassCard';
import { MetallicText } from '@/components/ui/premium/MetallicText';
import { GradientButton } from '@/components/ui/premium/GradientButton';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

import { useEffect } from 'react';

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [existingSession, setExistingSession] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setExistingSession(true);
            }
        };
        checkSession();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setExistingSession(false);
    };

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
        });

        if (error) {
            setError(error.message);
            setIsLoading(false);
        } else {
            router.push('/');
        }
    };

    return (
        <div className="min-h-screen bg-[#0D0D0F] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/10 blur-[150px] rounded-full -mr-64 -mt-64" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#DC2626]/5 blur-[150px] rounded-full -ml-64 -mb-64" />

            {/* Dynamic Grid Overlay */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 relative z-10"
            >
                {/* Brand Side */}
                <div className="hidden lg:flex flex-col justify-center">
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-3 mb-12"
                    >
                        <div className="p-3 bg-white/5 border border-white/10 rounded-2xl shadow-xl">
                            <ShieldCheck className="w-8 h-8 text-[#D4AF37]" />
                        </div>
                        <span className="text-2xl font-display font-black tracking-[0.2em] text-white">ROYAL<span className="text-[#D4AF37]">CONSORTIUM</span></span>
                    </motion.div>

                    <h1 className="text-6xl xl:text-7xl font-display font-black text-white leading-[1.1] mb-8">
                        Experience the <br />
                        <MetallicText>Ultimate Drive</MetallicText>
                    </h1>

                    <div className="space-y-6">
                        <p className="text-xl text-white/60 max-w-md font-medium">
                            Access Bangladesh&apos;s most exclusive network of verified motorcycle dealers and premium listings.
                        </p>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-center gap-4 group cursor-pointer"
                        >
                            <div className="h-px w-12 bg-[#D4AF37] transition-all group-hover:w-20" />
                            <span className="text-[#D4AF37] font-bold tracking-widest text-sm uppercase group-hover:translate-x-2 transition-transform">Explore Marketplace</span>
                        </motion.div>
                    </div>
                </div>

                {/* Form Side */}
                <div className="relative">
                    <GlassCard className="p-8 md:p-12 relative z-10 border-[#D4AF37]/20">
                        <div className="mb-10 text-center">
                            <h2 className="text-3xl font-display font-bold text-white mb-2">Welcome Back</h2>
                            <p className="text-white/40">Secure access to your professional dashboard</p>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium rounded-2xl flex items-center gap-3"
                                >
                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {existingSession && (
                                <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm font-medium rounded-2xl flex flex-col gap-3">
                                    <p>You are already signed in. If you want to use a different account, please sign out first.</p>
                                    <button
                                        type="button"
                                        onClick={handleSignOut}
                                        className="text-amber-500 hover:text-amber-400 underline text-left"
                                    >
                                        Sign out
                                    </button>
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#D4AF37] uppercase tracking-widest ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-[#D4AF37] transition-colors" />
                                    <Input
                                        type="email"
                                        placeholder="Enter your email"
                                        className="pl-12 h-14 bg-white/5 border-white/10 focus:border-[#D4AF37]/50 focus:bg-white/10 transition-all rounded-2xl text-white placeholder:text-white/20"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        disabled={existingSession}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-sm font-bold text-[#D4AF37] uppercase tracking-widest">Password</label>
                                    <Link href="/forgot-password" className="text-xs font-bold text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors">Forgot Password?</Link>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-[#D4AF37] transition-colors" />
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="pl-12 pr-12 h-14 bg-white/5 border-white/10 focus:border-[#D4AF37]/50 focus:bg-white/10 transition-all rounded-2xl text-white placeholder:text-white/20"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        disabled={existingSession}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                                        disabled={existingSession}
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <GradientButton
                                className="w-full h-14 text-lg"
                                disabled={isLoading || existingSession}
                            >
                                {isLoading ? "Authenticating..." : (
                                    <>
                                        Sign In Securely
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </GradientButton>
                        </form>

                        <div className="mt-10 flex flex-col gap-4 items-center">
                            <p className="text-sm text-white/40">
                                Don&apos;t have an account?{' '}
                                <Link href="/register" className="text-[#D4AF37] font-bold hover:underline">Apply as Dealer</Link>
                            </p>

                            <Link href="/" className="flex items-center gap-2 text-xs font-bold text-white/20 hover:text-white transition-colors uppercase tracking-[0.2em] group">
                                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                Back to Website
                            </Link>
                        </div>
                    </GlassCard>

                    {/* Decorative Ring */}
                    <div className="absolute inset-0 -z-0 border-2 border-white/5 rounded-[40px] translate-x-4 translate-y-4 pointer-events-none" />
                </div>
            </motion.div>
        </div>
    );
}
