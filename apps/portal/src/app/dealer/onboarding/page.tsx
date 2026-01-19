'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText,
    CreditCard,
    Image as ImageIcon,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    Upload,
    Building2,
    ShieldCheck,
    AlertCircle
} from 'lucide-react';
import { GlassCard } from '@/components/ui/premium/GlassCard';
import { MetallicText } from '@/components/ui/premium/MetallicText';
import { GradientButton } from '@/components/ui/premium/GradientButton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
    const [step, setStep] = useState(1);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const [formData, setFormData] = useState({
        tradeLicense: '',
        tinNumber: '',
        binNumber: '',
        bankName: '',
        accountName: '',
        accountNumber: '',
        routingNumber: '',
        logoUrl: '',
        bannerUrl: '',
    });

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        startTransition(async () => {
            // In a real app, we would upload files to Supabase Storage here
            // and save details to 'dealer_documents' and 'dealer_bank_accounts'
            await new Promise(resolve => setTimeout(resolve, 2000));
            router.push('/dealer/dashboard');
        });
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-6 overflow-hidden selection:bg-[#D4AF37] selection:text-[#0D0D0F]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16"
            >
                <h1 className="text-4xl md:text-5xl font-display font-black text-white italic tracking-tighter mb-4">
                    PARTNER <MetallicText>ONBOARDING</MetallicText>
                </h1>
                <p className="text-white/40 max-w-lg mx-auto font-medium leading-relaxed">
                    Complete your profile to unlock full showroom features and start listing products.
                </p>
            </motion.div>

            {/* Progress Visualization */}
            <div className="flex items-center justify-between mb-16 max-w-2xl mx-auto relative px-4">
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/5 -z-10" />
                {[
                    { id: 1, label: 'Legal docs', icon: FileText },
                    { id: 2, label: 'Financials', icon: CreditCard },
                    { id: 3, label: 'Showroom', icon: ImageIcon },
                ].map((s) => (
                    <div key={s.id} className="flex flex-col items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500 ${step >= s.id ? 'bg-[#D4AF37] border-[#D4AF37] text-[#0D0D0F] shadow-[0_0_20px_rgba(212,175,55,0.3)]' : 'bg-[#1A1A1C]/50 border-white/10 text-white/20'}`}>
                            <s.icon className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] uppercase tracking-[0.2em] font-black ${step >= s.id ? 'text-[#D4AF37]' : 'text-white/20'}`}>
                            {s.label}
                        </span>
                    </div>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <GlassCard className="p-8 md:p-12 border-[#D4AF37]/10 bg-[#1A1A1C]/40">
                            <div className="grid md:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-display font-bold text-white italic flex items-center gap-3">
                                        <Building2 className="w-6 h-6 text-[#D4AF37]" />
                                        Business Documentation
                                    </h2>
                                    <p className="text-white/40 text-sm leading-relaxed">
                                        Upload your legal documents for verification. We require these to ensure the authenticity of all partners in our network.
                                    </p>
                                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                                        <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                                        <span className="text-[10px] uppercase font-bold text-white/60 tracking-wider">Secure AES-256 Storage</span>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-widest">Trade License Number</label>
                                        <Input
                                            placeholder="TR-XXXX-YYYY"
                                            className="h-14 bg-white/[0.03] border-white/10 rounded-xl focus:border-[#D4AF37]/50 transition-all font-mono"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-widest">Trade License (PDF/Image)</label>
                                        <div className="h-32 border-2 border-dashed border-white/10 rounded-xl hover:border-[#D4AF37]/30 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group">
                                            <Upload className="w-6 h-6 text-white/20 group-hover:text-[#D4AF37] transition-colors" />
                                            <span className="text-[10px] uppercase font-black text-white/30 group-hover:text-white/60">Choose File</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-12 flex justify-end">
                                <GradientButton onClick={nextStep} className="px-10 h-14 text-xs font-black uppercase italic tracking-widest">
                                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                                </GradientButton>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <GlassCard className="p-8 md:p-12 border-[#D4AF37]/10 bg-[#1A1A1C]/40">
                            <div className="space-y-8 max-w-2xl mx-auto">
                                <h2 className="text-2xl font-display font-bold text-white italic text-center mb-10">Financial Disbursement Details</h2>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-widest">Bank Name</label>
                                        <Input placeholder="City Bank Ltd." className="bg-white/[0.03] border-white/10 rounded-xl h-14" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-widest">Account Name</label>
                                        <Input placeholder="Business Account Name" className="bg-white/[0.03] border-white/10 rounded-xl h-14" />
                                    </div>
                                    <div className="space-y-3 md:col-span-2">
                                        <label className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-widest">Account Number</label>
                                        <Input placeholder="0000 0000 0000 0000" className="bg-white/[0.03] border-white/10 rounded-xl h-14 font-mono" />
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-8">
                                    <Button variant="ghost" onClick={prevStep} className="text-white/40 hover:text-white uppercase text-[10px] font-black tracking-widest">
                                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                                    </Button>
                                    <GradientButton onClick={nextStep} className="px-10 h-14 text-xs font-black uppercase italic tracking-widest">
                                        Continue <ArrowRight className="w-4 h-4 ml-2" />
                                    </GradientButton>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <GlassCard className="p-8 md:p-12 border-[#D4AF37]/10 bg-[#1A1A1C]/40">
                            <div className="text-center mb-12">
                                <h2 className="text-2xl font-display font-bold text-white italic mb-4">Showroom Personalization</h2>
                                <p className="text-white/40 text-sm">Upload your visual identity to attract high-end customers.</p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-8 mb-12">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-widest block text-center">Brand Logo</label>
                                    <div className="aspect-square rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-3 bg-white/[0.02] hover:border-[#D4AF37]/30 transition-all cursor-pointer">
                                        <ImageIcon className="w-8 h-8 text-white/10" />
                                        <span className="text-[10px] uppercase font-black text-white/20">1x1 Format</span>
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-4">
                                    <label className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-widest block text-center">Showroom Banner</label>
                                    <div className="aspect-[21/9] rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-3 bg-white/[0.02] hover:border-[#D4AF37]/30 transition-all cursor-pointer">
                                        <Upload className="w-8 h-8 text-white/10" />
                                        <span className="text-[10px] uppercase font-black text-white/20">Landscape Focus</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center bg-[#D4AF37]/5 p-6 rounded-2xl border border-[#D4AF37]/10">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                                        <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] uppercase font-black text-white tracking-widest">Ready for Review</p>
                                        <p className="text-[9px] text-white/30 uppercase font-bold tracking-wider italic">Verification takes 24-48 hours</p>
                                    </div>
                                </div>
                                <GradientButton onClick={handleSubmit} disabled={isPending} className="px-12 h-14 text-xs font-black uppercase italic tracking-widest">
                                    {isPending ? 'Submitting...' : 'Complete Profile'}
                                </GradientButton>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
