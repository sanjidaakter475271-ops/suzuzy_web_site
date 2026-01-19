'use client';

import { motion } from 'framer-motion';
import { Clock, ShieldCheck, Mail, ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/premium/GlassCard';
import { MetallicText } from '@/components/ui/premium/MetallicText';
import { GradientButton } from '@/components/ui/premium/GradientButton';
import { Button } from '@/components/ui/button';

export default function DealerPendingPage() {
    return (
        <div className="min-h-screen bg-[#0D0D0F] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#D4AF37]/10 via-transparent to-transparent">
            <div className="max-w-2xl w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <GlassCard className="p-12 text-center border-[#D4AF37]/20 relative overflow-hidden">
                        {/* Background Decoration */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#D4AF37]/5 rounded-full blur-3xl" />

                        <div className="relative z-10">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", damping: 12, delay: 0.4 }}
                                className="w-20 h-20 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-[#D4AF37]/20"
                            >
                                <Clock className="w-10 h-10 text-[#0D0D0F]" />
                            </motion.div>

                            <MetallicText className="text-3xl font-display font-black tracking-widest italic mb-6">
                                APPLICATION UNDER REVIEW
                            </MetallicText>

                            <p className="text-white/60 text-lg mb-10 leading-relaxed font-light">
                                Welcome to the RoyalConsortium network. Your dealer application is currently being verified by our administrative team. This normally takes <span className="text-[#D4AF37] font-bold">24-48 business hours</span>.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 text-left">
                                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-1.5 bg-[#D4AF37]/10 rounded-lg">
                                            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                                        </div>
                                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Next Step</h4>
                                    </div>
                                    <p className="text-[11px] text-white/40">Our team will verify your business documents and showroom location.</p>
                                </div>
                                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-1.5 bg-[#D4AF37]/10 rounded-lg">
                                            <Mail className="w-4 h-4 text-[#D4AF37]" />
                                        </div>
                                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Notification</h4>
                                    </div>
                                    <p className="text-[11px] text-white/40">You will receive an email confirmation once your account is activated.</p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link href="http://localhost:3000" className="w-full sm:w-auto">
                                    <Button variant="outline" className="w-full h-12 rounded-xl border-white/10 text-white hover:border-white/20 px-8 flex items-center gap-2">
                                        <ArrowLeft className="w-4 h-4" /> Return to Marketplace
                                    </Button>
                                </Link>
                                <Link href="/contact" className="w-full sm:w-auto">
                                    <GradientButton className="w-full h-12 rounded-xl px-10 flex items-center gap-2">
                                        Contact Support <ExternalLink className="w-4 h-4" />
                                    </GradientButton>
                                </Link>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </div>
    );
}
