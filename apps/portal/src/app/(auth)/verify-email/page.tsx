"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Mail, ShieldCheck, ArrowLeft, RefreshCcw, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/premium/GlassCard';
import { MetallicText } from '@/components/ui/premium/MetallicText';
import { GradientButton } from '@/components/ui/premium/GradientButton';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Suspense } from 'react';

function VerifyEmailForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const email = searchParams.get('email');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [verified, setVerified] = useState(false);

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) value = value[value.length - 1];
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handleVerify = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const code = otp.join('');
        if (code.length < 6) {
            toast.error("Please enter the full 6-digit code");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/auth/verify-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Verification failed");

            setVerified(true);
            toast.success("Email verified successfully!");
            setTimeout(() => router.push("/login"), 3000);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (verified) {
        return (
            <div className="min-h-screen bg-[#0D0D0F] flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                    <CheckCircle2 className="w-20 h-20 text-[#D4AF37] mx-auto mb-6" />
                    <h1 className="text-3xl font-display font-black text-white mb-2">VERIFIED!</h1>
                    <p className="text-white/40 mb-8">Redirecting you to login...</p>
                    <Link href="/login">
                        <GradientButton>Click here if not redirected</GradientButton>
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0D0D0F] flex items-center justify-center p-6 relative overflow-hidden font-sans">
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#D4AF37]/5 blur-[150px] rounded-full -ml-64 -mt-64" />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg relative z-10">
                <div className="flex flex-col items-center mb-10">
                    <Link href="/" className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-white/5 border border-white/10 rounded-xl">
                            <ShieldCheck className="w-6 h-6 text-[#D4AF37]" />
                        </div>
                        <span className="text-xl font-display font-black tracking-widest text-white uppercase">Royal<span className="text-[#D4AF37]">Consortium</span></span>
                    </Link>
                    <h1 className="text-3xl font-display font-black text-white italic tracking-wider">
                        ACTIVATE <MetallicText>ACCOUNT</MetallicText>
                    </h1>
                </div>

                <GlassCard className="p-8 border-[#D4AF37]/20 text-center">
                    <div className="w-16 h-16 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mail className="w-8 h-8 text-[#D4AF37]" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
                    <p className="text-white/40 text-sm mb-8">
                        We've sent a 6-digit verification code to <span className="text-[#D4AF37]">{email || "your email"}</span>.
                    </p>

                    <div className="flex justify-between gap-2 mb-8">
                        {otp.map((digit, i) => (
                            <input
                                key={i}
                                id={`otp-${i}`}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(i, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(i, e)}
                                className="w-12 h-14 bg-white/5 border border-white/10 rounded-xl text-center text-xl font-bold text-white focus:border-[#D4AF37] focus:bg-[#D4AF37]/5 outline-none transition-all"
                            />
                        ))}
                    </div>

                    <GradientButton
                        onClick={() => handleVerify()}
                        disabled={loading || otp.join('').length < 6}
                        className="w-full h-12 mb-6"
                    >
                        {loading ? "Verifying..." : "Verify Identity"}
                    </GradientButton>

                    <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
                        <p className="text-xs text-white/20">Didn&apos;t receive the code?</p>
                        <Button variant="outline" className="h-10 border-white/10 bg-white/5 text-white/60 hover:text-white rounded-xl gap-2 font-bold text-xs">
                            <RefreshCcw className="w-3.5 h-3.5" /> Resend Protocol
                        </Button>
                    </div>

                    <Link href="/login" className="mt-8 flex items-center justify-center gap-2 text-[10px] font-black text-white/20 hover:text-white transition-colors uppercase tracking-[0.2em] group">
                        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                        Abort and return
                    </Link>
                </GlassCard>
            </motion.div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0D0D0F] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}

function VerifyEmailContent() {
    return <VerifyEmailForm />;
}
