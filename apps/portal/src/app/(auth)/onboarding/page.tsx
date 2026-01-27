"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShieldCheck,
    Lock,
    ChevronRight,
    CheckCircle2,
    ShieldAlert,
    LayoutDashboard,
    ArrowRight,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";
import { completeOnboardingAction } from "@/actions/auth";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/premium/GlassCard";

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Better Auth hook
    const { data: session, isPending: authLoading } = authClient.useSession();
    const user = session?.user;

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        }
    }, [user, authLoading, router]);

    const handlePasswordUpdate = async () => {
        if (password !== confirmPassword) {
            toast.error("Passwords do not match the protocol");
            return;
        }

        if (password.length < 8) {
            toast.error("Security breach: Password too weak (min 8 characters)");
            return;
        }

        setLoading(true);
        try {
            const result = await completeOnboardingAction(password);

            setStep(3); // Victory step
            toast.success("Security Credentials Updated Successfully");
        } catch (error: unknown) {
            console.error("Onboarding error:", error);
            const message = error instanceof Error ? error.message : "Credential update failed";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const nextToStep2 = () => {
        if (step === 1) setStep(2);
    };

    const finishOnboarding = () => {
        router.push("/dashboard"); // This will redirect correctly based on role guards
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#060608] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/5 blur-[120px] rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#DC2626]/5 blur-[120px] rounded-full -ml-32 -mb-32" />

            <div className="w-full max-w-xl relative z-10">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            <div className="text-center space-y-4">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-[#D4AF37]/10 border border-[#D4AF37]/20 shadow-[0_0_30px_rgba(212,175,55,0.1)] mb-4">
                                    <ShieldCheck className="w-10 h-10 text-[#D4AF37]" />
                                </div>
                                <h1 className="text-4xl font-display font-black italic tracking-tighter text-[#F8F8F8]">
                                    IDENTITY <span className="text-[#D4AF37]">VERIFIED</span>
                                </h1>
                                <p className="text-[#A1A1AA] text-xs uppercase tracking-[0.4em] font-black max-w-[280px] mx-auto leading-relaxed">
                                    Welcome to the Consortium. Security protocols require a personalized credential update.
                                </p>
                            </div>

                            <GlassCard className="p-10 border-[#D4AF37]/10 text-center">
                                <p className="text-white/60 text-sm leading-relaxed mb-10">
                                    You are currently using a temporary authorization code. To ensure the integrity of your account and the dealer network, you must establish a secure, unique password before accessing the terminal.
                                </p>
                                <Button
                                    onClick={nextToStep2}
                                    className="w-full h-14 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#0D0D0F] font-black uppercase tracking-widest text-[10px] rounded-2xl group transition-all"
                                >
                                    Initialize Security Update
                                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </GlassCard>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="text-center space-y-2">
                                <h2 className="text-3xl font-display font-black italic tracking-tight text-[#F8F8F8]">
                                    CREDENTIAL <span className="text-[#D4AF37]">UPGRADE</span>
                                </h2>
                                <p className="text-[#A1A1AA] text-[10px] uppercase tracking-[0.3em] font-black">
                                    Establishing Encryption Sovereign
                                </p>
                            </div>

                            <GlassCard className="p-10 border-[#D4AF37]/10">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-black tracking-widest text-[#D4AF37] ml-1">New Terminal Password</Label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#D4AF37] transition-colors" />
                                            <Input
                                                type="password"
                                                placeholder="••••••••••••"
                                                className="pl-12 h-14 bg-white/5 border-white/10 focus:border-[#D4AF37]/50 focus:bg-white/10 transition-all rounded-2xl text-white placeholder:text-white/10"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-black tracking-widest text-[#D4AF37] ml-1">Confirm Credentials</Label>
                                        <div className="relative group">
                                            <ShieldAlert className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#D4AF37] transition-colors" />
                                            <Input
                                                type="password"
                                                placeholder="••••••••••••"
                                                className="pl-12 h-14 bg-white/5 border-white/10 focus:border-[#D4AF37]/50 focus:bg-white/10 transition-all rounded-2xl text-white placeholder:text-white/10"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handlePasswordUpdate}
                                        disabled={loading}
                                        className="w-full h-14 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#0D0D0F] font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-[0_0_30px_rgba(212,175,55,0.2)] mt-4"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Authorize Password Update"}
                                    </Button>
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center space-y-8"
                        >
                            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500/10 border border-green-500/20 shadow-[0_0_50px_rgba(34,197,94,0.1)] mb-4">
                                <CheckCircle2 className="w-12 h-12 text-green-500" />
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-4xl font-display font-black italic tracking-tighter text-[#F8F8F8]">
                                    ACCESS <span className="text-[#D4AF37]">GRANTED</span>
                                </h2>
                                <p className="text-[#A1A1AA] text-[10px] uppercase tracking-[0.4em] font-black">
                                    Security Protocols Optimized
                                </p>
                            </div>

                            <GlassCard className="p-10 border-[#D4AF37]/10">
                                <p className="text-white/60 text-sm leading-relaxed mb-8">
                                    Your secure authorization has been established. You are now cleared for entry to the dealer terminal. All activities will be monitored under the new security policy.
                                </p>
                                <Button
                                    onClick={finishOnboarding}
                                    className="w-full h-14 bg-white text-[#0D0D0F] font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-[#F8F8F8] transition-all flex items-center justify-center gap-2"
                                >
                                    Enter Terminal Dashboard
                                    <LayoutDashboard className="w-4 h-4" />
                                </Button>
                            </GlassCard>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
