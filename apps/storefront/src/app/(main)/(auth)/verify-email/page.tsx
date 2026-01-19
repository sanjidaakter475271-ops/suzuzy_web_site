'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Mail, CheckCircle2, ShieldCheck, ArrowLeft, RefreshCcw } from 'lucide-react';
import { GlassCard } from '@/components/ui/premium/GlassCard';
import { MetallicText } from '@/components/ui/premium/MetallicText';
import { GradientButton } from '@/components/ui/premium/GradientButton';
import { Button } from '@/components/ui/button';

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen bg-[#0D0D0F] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#D4AF37]/5 blur-[150px] rounded-full -ml-64 -mt-64" />
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
                        <span className="text-xl font-display font-black tracking-[0.2em] text-white uppercase tracking-widest">Royal<span className="text-[#D4AF37]">Consortium</span></span>
                    </Link>
                    <h1 className="text-3xl font-display font-black text-white italic tracking-wider">
                        ACTIVATE <MetallicText>ACCOUNT</MetallicText>
                    </h1>
                </div>

                <GlassCard className="p-8 md:p-12 border-[#D4AF37]/20 text-center">
                    <div className="w-24 h-24 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full flex items-center justify-center mx-auto mb-10 shadow-[0_0_30px_rgba(212,175,55,0.1)]">
                        <Mail className="w-12 h-12 text-[#D4AF37] animate-pulse" />
                    </div>

                    <h2 className="text-3xl font-bold text-white mb-4">Verification Sent</h2>
                    <p className="text-white/40 leading-relaxed font-medium mb-12">
                        A secure activation link has been dispatched to your registered email address. Please click the link to verify your professional dealer account.
                    </p>

                    <div className="space-y-6">
                        <Link href="/login">
                            <GradientButton className="w-full h-14">Return to Login</GradientButton>
                        </Link>

                        <div className="pt-4 border-t border-white/5">
                            <p className="text-sm text-white/20 mb-4">Didn't receive the email?</p>
                            <Button variant="outline" className="h-12 border-white/10 bg-white/5 text-white/60 hover:text-white rounded-xl gap-2 font-bold w-full backdrop-blur-md">
                                <RefreshCcw className="w-4 h-4" /> Resend Verification
                            </Button>
                        </div>
                    </div>

                    <Link href="/" className="mt-10 flex items-center justify-center gap-2 text-xs font-bold text-white/20 hover:text-white transition-colors uppercase tracking-[0.2em] group">
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Back to Website
                    </Link>
                </GlassCard>
            </motion.div>
        </div>
    );
}
