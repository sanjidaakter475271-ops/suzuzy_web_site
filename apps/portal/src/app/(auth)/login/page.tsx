'use client';

import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, ShieldCheck, ChevronRight } from 'lucide-react';
// import { login } from '@/lib/auth/auth-actions';
import { authClient } from '@/lib/auth/client';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { ROLE_LEVELS } from '@/middlewares/checkRole';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/premium/GlassCard';
import { MetallicText } from '@/components/ui/premium/MetallicText';
import { GradientButton } from '@/components/ui/premium/GradientButton';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { profile, loading: authLoading } = useUser();

    // Disable form if we're submitting, checking auth, or already authenticated (redirecting)
    const isFormDisabled = isLoading || authLoading || !!profile;

    useEffect(() => {
        if (profile) {
            const level = ROLE_LEVELS[profile.role] || 99;

            if (level === 1) {
                router.push('/super-admin/dashboard');
            } else if (level === 3) {
                router.push('/service-admin/dashboard');
            } else if (level >= 4 && level <= 5) {
                router.push('/sales-admin/dashboard');
            } else if (level <= 7) {
                router.push('/admin/dashboard');
            } else if (level <= 15) {
                router.push('/dealer/dashboard');
            }
        }
    }, [profile, router]);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [mfaRequired, setMfaRequired] = useState(false);
    const [mfaTicket, setMfaTicket] = useState<string | null>(null);
    const [mfaToken, setMfaToken] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (mfaRequired && mfaTicket) {
                const { data, error } = await authClient.signIn.mfa({
                    mfaTicket,
                    token: mfaToken
                });

                if (error) {
                    setError(error.message || "Invalid MFA token");
                    setIsLoading(false);
                    return;
                }
                handleLoginSuccess(data.user);
            } else {
                const { data, error } = await authClient.signIn.email({
                    email: formData.email,
                    password: formData.password,
                    rememberMe: true
                });

                if (error) {
                    setError(error.message || "Failed to sign in");
                    setIsLoading(false);
                    return;
                }

                if (data.mfaRequired) {
                    setMfaRequired(true);
                    setMfaTicket(data.mfaTicket);
                    setIsLoading(false);
                    return;
                }

                if (data.requirePasswordChange) {
                    router.push('/set-initial-password');
                    return;
                }

                handleLoginSuccess(data.user);
            }
        } catch (err: any) {
            console.error("Login error:", err);
            setError("An unexpected error occurred");
            setIsLoading(false);
        }
    };

    const queryClient = useQueryClient();

    const handleLoginSuccess = async (user: any) => {
        // Invalidate auth query to ensure fresh data on next page load
        await queryClient.invalidateQueries({ queryKey: ["auth-user"] });

        const role = user.roles?.name || user.role || "customer";

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

        router.push(redirectPath);
    };

    const handleSignOut = async () => {
        await authClient.signOut();
        router.refresh();
    };

    return (
        <div className="min-h-screen bg-[#0D0D0F] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/10 blur-[150px] rounded-full -mr-64 -mt-64" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#DC2626]/5 blur-[150px] rounded-full -ml-64 -mb-64" />

            {/* Dynamic Grid Overlay */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />

            <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 relative z-10"
            >
                {/* Brand Side */}
                <div className="hidden lg:flex flex-col justify-center">
                    <motion.div
                        initial={{ x: -20 }}
                        animate={{ x: 0 }}
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
                            {mfaRequired ? (
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#D4AF37] uppercase tracking-widest ml-1">MFA Token</label>
                                    <div className="relative group">
                                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-[#D4AF37] transition-colors" />
                                        <Input
                                            type="text"
                                            placeholder="Enter 6-digit code"
                                            className="pl-12 h-14 bg-white/5 border-white/10 focus:border-[#D4AF37]/50 focus:bg-white/10 transition-all rounded-2xl text-white placeholder:text-white/20"
                                            required
                                            value={mfaToken}
                                            onChange={(e) => setMfaToken(e.target.value)}
                                            maxLength={6}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#D4AF37] uppercase tracking-widest ml-1">Email Address</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-[#D4AF37] transition-colors" />
                                            <Input
                                                type="email"
                                                name="email"
                                                placeholder="Enter your email"
                                                className="pl-12 h-14 bg-white/5 border-white/10 focus:border-[#D4AF37]/50 focus:bg-white/10 transition-all rounded-2xl text-white placeholder:text-white/20"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                disabled={isFormDisabled}
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
                                                name="password"
                                                placeholder="••••••••"
                                                className="pl-12 pr-12 h-14 bg-white/5 border-white/10 focus:border-[#D4AF37]/50 focus:bg-white/10 transition-all rounded-2xl text-white placeholder:text-white/20"
                                                required
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                disabled={isFormDisabled}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                                                disabled={isFormDisabled}
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}

                            <GradientButton
                                type="submit"
                                className="w-full h-14 text-lg"
                                disabled={isFormDisabled}
                            >
                                {isLoading ? "Authenticating..." : (
                                    <>
                                        {mfaRequired ? "Verify & Sign In" : "Sign In Securely"}
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </GradientButton>

                            {!mfaRequired && (
                                <div className="relative py-4">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-white/10" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-[#0D0D0F] px-2 text-white/20 font-bold tracking-[0.2em]">Or continue with</span>
                                    </div>
                                </div>
                            )}

                            {!mfaRequired && (
                                <button
                                    type="button"
                                    onClick={() => authClient.signIn.google()}
                                    className="w-full h-14 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl flex items-center justify-center gap-3 transition-all font-bold"
                                    disabled={isFormDisabled}
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Google Account
                                </button>
                            )}
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
