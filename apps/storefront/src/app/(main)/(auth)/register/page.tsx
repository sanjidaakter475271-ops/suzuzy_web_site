'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ShieldCheck, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/premium/GlassCard';
import { MetallicText } from '@/components/ui/premium/MetallicText';
import { GradientButton } from '@/components/ui/premium/GradientButton';
import { Input } from '@/components/ui/input';
import { signUp } from '@/lib/supabase/auth-actions';

export default function RegisterPage() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        const data = new FormData();
        data.append('email', formData.email);
        data.append('password', formData.password);
        data.append('fullName', formData.fullName);
        data.append('phone', formData.phone);
        // We will default to 'customer' role in the backend action if not present,
        // or the action needs to be updated to handle simple customer signup.

        startTransition(async () => {
            const result = await signUp(data);
            if (result?.error) {
                setError(result.error);
            } else {
                setIsSuccess(true);
            }
        });
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-[#0D0D0F] flex items-center justify-center p-6 relative">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-lg text-center"
                >
                    <GlassCard className="p-12 border-[#D4AF37]/20 flex flex-col items-center gap-6">
                        <div className="w-20 h-20 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-10 h-10 text-[#D4AF37]" />
                        </div>
                        <h2 className="text-3xl font-display font-black text-white italic">ACCOUNT <MetallicText>CREATED</MetallicText></h2>
                        <p className="text-white/60 leading-relaxed">
                            Welcome to RoyalConsortium. Your account has been created successfully. Please verify your email to continue.
                        </p>
                        <Link href="/login" className="w-full">
                            <GradientButton className="w-full py-4 mt-4">
                                Sign In Now
                            </GradientButton>
                        </Link>
                    </GlassCard>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0D0D0F] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Elements - Simplified for clarity */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#D4AF37]/5 blur-[150px] rounded-full -ml-64 -mt-64" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#DC2626]/5 blur-[150px] rounded-full -mr-64 -mb-64" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="flex flex-col items-center mb-8">
                    <Link href="/" className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-white/5 border border-white/10 rounded-xl">
                            <ShieldCheck className="w-6 h-6 text-[#D4AF37]" />
                        </div>
                        <span className="text-xl font-display font-black tracking-[0.2em] text-white uppercase">Royal<span className="text-[#D4AF37]">Consortium</span></span>
                    </Link>
                    <h1 className="text-3xl font-display font-black text-white italic tracking-wider text-center">
                        CREATE <MetallicText>ACCOUNT</MetallicText>
                    </h1>
                </div>

                <GlassCard className="p-8 border-[#D4AF37]/20">
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-medium"
                                >
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest ml-1">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#D4AF37]" />
                                    <Input
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="pl-12 h-12 bg-white/5 border-white/10 rounded-xl text-white outline-none text-sm placeholder:text-white/20"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#D4AF37]" />
                                    <Input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="pl-12 h-12 bg-white/5 border-white/10 rounded-xl text-white outline-none text-sm placeholder:text-white/20"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest ml-1">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#D4AF37]" />
                                    <Input
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="pl-12 h-12 bg-white/5 border-white/10 rounded-xl text-white outline-none text-sm placeholder:text-white/20"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest ml-1">Confirm Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#D4AF37]" />
                                    <Input
                                        name="confirmPassword"
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="pl-12 h-12 bg-white/5 border-white/10 rounded-xl text-white outline-none text-sm placeholder:text-white/20"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <GradientButton
                                className="w-full h-12 text-sm font-bold"
                                type="submit"
                                disabled={isPending}
                            >
                                {isPending ? 'Creating Account...' : (
                                    <>Create Account <ArrowRight className="w-4 h-4 ml-2" /></>
                                )}
                            </GradientButton>
                        </div>

                        <p className="text-center text-xs text-white/40 pt-2">
                            Already have an account?{' '}
                            <Link href="/login" className="text-[#D4AF37] font-bold hover:underline">Sign In</Link>
                        </p>
                    </form>
                </GlassCard>
            </motion.div>
        </div>
    );
}
