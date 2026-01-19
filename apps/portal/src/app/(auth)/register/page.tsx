'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ShieldCheck, Mail, Lock, User, Building, MapPin, Phone, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Quote } from 'lucide-react';
import { GlassCard } from '@/components/ui/premium/GlassCard';
import { MetallicText } from '@/components/ui/premium/MetallicText';
import { GradientButton } from '@/components/ui/premium/GradientButton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { signUp } from '@/lib/supabase/auth-actions';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const [step, setStep] = useState(1);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        businessName: '',
        ownerName: '',
        email: '',
        phone: '',
        address: '',
        password: '',
        confirmPassword: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError(null);
    };

    const nextStep = () => {
        if (step === 1) {
            if (!formData.businessName || !formData.address || !formData.email) {
                setError('Please fill in all business details');
                return;
            }
        } else if (step === 2) {
            if (!formData.ownerName || !formData.phone) {
                setError('Please fill in all owner details');
                return;
            }
        }
        setStep(s => s + 1);
    };

    const prevStep = () => setStep(s => s - 1);

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
        Object.entries(formData).forEach(([key, value]) => {
            data.append(key, value);
        });

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
            <div className="min-h-screen bg-[#0D0D0F] flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_100%)]" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-lg text-center relative z-10"
                >
                    <GlassCard className="p-12 border-[#D4AF37]/20 flex flex-col items-center gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", damping: 10, stiffness: 100, delay: 0.2 }}
                            className="w-24 h-24 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mb-4 relative"
                        >
                            <div className="absolute inset-0 rounded-full animate-ping bg-[#D4AF37]/10" />
                            <CheckCircle2 className="w-12 h-12 text-[#D4AF37]" />
                        </motion.div>
                        <h2 className="text-3xl font-display font-black text-white italic">APPLICATION <MetallicText>SUBMITTED</MetallicText></h2>
                        <p className="text-white/60 leading-relaxed max-w-sm">
                            Your dealer application for <span className="text-white font-bold">{formData.businessName}</span> has been received. Our team will review your credentials shortly.
                        </p>
                        <div className="w-full space-y-3 pt-4">
                            <Link href="/" className="block">
                                <GradientButton className="w-full py-4 text-xs tracking-widest uppercase font-black italic">
                                    Return to Portal Home
                                </GradientButton>
                            </Link>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0D0D0F] flex overflow-hidden selection:bg-[#D4AF37] selection:text-[#0D0D0F]">
            {/* Left Column: Brand & Visuals (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-16 overflow-hidden">
                {/* Visual Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0D0D0F] via-[#0D0D0F]/90 to-transparent z-10" />
                    <motion.div
                        initial={{ scale: 1.1, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.4 }}
                        transition={{ duration: 2 }}
                        className="h-full w-full bg-[url('https://images.unsplash.com/photo-1558981403-c5f91cbba527?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center grayscale"
                    />
                    <div className="absolute inset-0 bg-[#0D0D0F]/40 z-20 backdrop-blur-[2px]" />
                </div>

                {/* Content */}
                <div className="relative z-30">
                    <Link href="/" className="flex items-center gap-4 group">
                        <div className="p-3 bg-white/5 border border-white/10 rounded-2xl group-hover:border-[#D4AF37]/50 transition-colors">
                            <ShieldCheck className="w-8 h-8 text-[#D4AF37]" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-display font-black tracking-[0.3em] text-white uppercase leading-none">Royal<span className="text-[#D4AF37]">Consortium</span></span>
                            <span className="text-[10px] text-white/40 uppercase tracking-[0.5em] mt-1">Authorized Dealer Network</span>
                        </div>
                    </Link>
                </div>

                <div className="relative z-30 max-w-md">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5, duration: 1 }}
                    >
                        <Quote className="w-12 h-12 text-[#D4AF37]/20 mb-6" />
                        <h2 className="text-5xl font-display font-black text-white italic leading-tight mb-8">
                            WHERE <MetallicText>PRECISION</MetallicText> MEETS PERFORMANCE.
                        </h2>
                        <p className="text-white/50 text-lg leading-relaxed font-light">
                            Join the elite circle of authorized Suzuki partners. Our platform provides the tools you need to accelerate your business and deliver excellence.
                        </p>
                    </motion.div>
                </div>

                <div className="relative z-30 flex items-center gap-8 text-[10px] tracking-[0.2em] uppercase font-bold text-white/30">
                    <span>© 2024 ROYAL CONSORTIUM</span>
                    <div className="w-1 h-1 rounded-full bg-white/20" />
                    <span>ESTABLISHED PARTNERS ONLY</span>
                </div>
            </div>

            {/* Right Column: Registration Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center p-6 md:p-12 xl:p-24 relative overflow-y-auto">
                {/* Background Decorative Elements for Mobile/Tablet */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#D4AF37]/5 blur-[120px] rounded-full -mr-32 -mt-32 lg:hidden" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-red-600/5 blur-[120px] rounded-full -ml-32 -mb-32 lg:hidden" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-xl mx-auto relative z-10"
                >
                    <div className="mb-12">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-[2px] w-12 bg-[#D4AF37]" />
                            <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.4em]">Partner Onboarding</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-display font-black text-white italic tracking-tight mb-4 leading-none">
                            CREATE <MetallicText>ACCOUNT</MetallicText>
                        </h1>
                        <p className="text-white/40 font-medium">Step {step} of 3: {step === 1 ? 'Business Identity' : step === 2 ? 'Owner Credentials' : 'Security Setup'}</p>
                    </div>

                    {/* Form Section */}
                    <GlassCard className="p-1 border-[#D4AF37]/10 bg-[#1A1A1C]/30 backdrop-blur-2xl">
                        <div className="p-8 md:p-10">
                            <form className="space-y-10" onSubmit={handleSubmit}>
                                <AnimatePresence mode="wait">
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold uppercase tracking-wider"
                                        >
                                            <AlertCircle className="w-4 h-4" />
                                            {error}
                                        </motion.div>
                                    )}

                                    {step === 1 && (
                                        <motion.div
                                            key="step1"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-8"
                                        >
                                            <div className="grid gap-8">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-[0.2em] ml-1">Business Registered Name</label>
                                                    <div className="relative group">
                                                        <Building className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#D4AF37] transition-colors" />
                                                        <Input
                                                            name="businessName"
                                                            value={formData.businessName}
                                                            onChange={handleChange}
                                                            className="pl-14 h-16 bg-white/[0.03] border-white/10 rounded-xl text-white outline-none focus:border-[#D4AF37]/50 focus:bg-white/[0.05] transition-all"
                                                            placeholder="e.g. Royal Motors Suzuki"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-[0.2em] ml-1">Showroom Address</label>
                                                    <div className="relative group">
                                                        <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#D4AF37] transition-colors" />
                                                        <Input
                                                            name="address"
                                                            value={formData.address}
                                                            onChange={handleChange}
                                                            className="pl-14 h-16 bg-white/[0.03] border-white/10 rounded-xl text-white outline-none focus:border-[#D4AF37]/50 focus:bg-white/[0.05] transition-all"
                                                            placeholder="Dhaka, Bangladesh"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-[0.2em] ml-1">Official Email Address</label>
                                                    <div className="relative group">
                                                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#D4AF37] transition-colors" />
                                                        <Input
                                                            name="email"
                                                            type="email"
                                                            value={formData.email}
                                                            onChange={handleChange}
                                                            className="pl-14 h-16 bg-white/[0.03] border-white/10 rounded-xl text-white outline-none focus:border-[#D4AF37]/50 focus:bg-white/[0.05] transition-all"
                                                            placeholder="showroom@suzuki.com.bd"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-4">
                                                <GradientButton className="w-full h-16 text-xs uppercase tracking-[0.3em] font-black italic shadow-2xl" onClick={nextStep} type="button">
                                                    Continue Application <ArrowRight className="w-5 h-5 ml-2" />
                                                </GradientButton>
                                            </div>
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
                                            <div className="grid gap-8">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-[0.2em] ml-1">Owner / Manager Full Name</label>
                                                    <div className="relative group">
                                                        <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#D4AF37] transition-colors" />
                                                        <Input
                                                            name="ownerName"
                                                            value={formData.ownerName}
                                                            onChange={handleChange}
                                                            className="pl-14 h-16 bg-white/[0.03] border-white/10 rounded-xl text-white outline-none focus:border-[#D4AF37]/50 focus:bg-white/[0.05] transition-all"
                                                            placeholder="Full legal name"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-[0.2em] ml-1">Primary Contact Number</label>
                                                    <div className="relative group">
                                                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#D4AF37] transition-colors" />
                                                        <Input
                                                            name="phone"
                                                            value={formData.phone}
                                                            onChange={handleChange}
                                                            className="pl-14 h-16 bg-white/[0.03] border-white/10 rounded-xl text-white outline-none focus:border-[#D4AF37]/50 focus:bg-white/[0.05] transition-all"
                                                            placeholder="+880 1XXX-XXXXXX"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 pt-4">
                                                <Button
                                                    variant="outline"
                                                    type="button"
                                                    className="h-16 border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-white rounded-xl gap-2 font-black uppercase text-[10px] tracking-widest transition-all"
                                                    onClick={prevStep}
                                                >
                                                    <ArrowLeft className="w-4 h-4" /> Go Back
                                                </Button>
                                                <GradientButton className="h-16 text-[10px] uppercase tracking-widest font-black italic" onClick={nextStep} type="button">
                                                    Next Step <ArrowRight className="w-4 h-4 ml-1" />
                                                </GradientButton>
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === 3 && (
                                        <motion.div
                                            key="step3"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-8"
                                        >
                                            <div className="grid gap-8">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-[0.2em] ml-1">Account Master Password</label>
                                                    <div className="relative group">
                                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#D4AF37] transition-colors" />
                                                        <Input
                                                            name="password"
                                                            type="password"
                                                            value={formData.password}
                                                            onChange={handleChange}
                                                            className="pl-14 h-16 bg-white/[0.03] border-white/10 rounded-xl text-white outline-none focus:border-[#D4AF37]/50 focus:bg-white/[0.05] transition-all"
                                                            placeholder="Min 6 characters"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-[0.2em] ml-1">Confirm Security Access</label>
                                                    <div className="relative group">
                                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#D4AF37] transition-colors" />
                                                        <Input
                                                            name="confirmPassword"
                                                            type="password"
                                                            value={formData.confirmPassword}
                                                            onChange={handleChange}
                                                            className="pl-14 h-16 bg-white/[0.03] border-white/10 rounded-xl text-white outline-none focus:border-[#D4AF37]/50 focus:bg-white/[0.05] transition-all"
                                                            placeholder="Re-enter password"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-4 p-5 bg-[#D4AF37]/5 rounded-xl border border-[#D4AF37]/20 group hover:border-[#D4AF37]/40 transition-colors cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    required
                                                    id="terms"
                                                    className="mt-1 w-4 h-4 rounded border-white/10 bg-transparent text-[#D4AF37] focus:ring-[#D4AF37]"
                                                />
                                                <label htmlFor="terms" className="text-[10px] text-white/50 font-bold uppercase tracking-wider leading-relaxed pointer-events-none">
                                                    I certify that the information provided is accurate and I agree to the <span className="text-[#D4AF37]">RoyalConsortium Partner Agreement</span>.
                                                </label>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 pt-4">
                                                <Button
                                                    variant="outline"
                                                    type="button"
                                                    className="h-16 border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-white rounded-xl gap-2 font-black uppercase text-[10px] tracking-widest transition-all"
                                                    onClick={prevStep}
                                                >
                                                    <ArrowLeft className="w-4 h-4" /> Go Back
                                                </Button>
                                                <GradientButton
                                                    className="h-16 text-[10px] uppercase tracking-widest font-black italic"
                                                    type="submit"
                                                    disabled={isPending}
                                                >
                                                    {isPending ? 'Validating...' : (
                                                        <>Finalize Registration <ShieldCheck className="w-4 h-4 ml-2" /></>
                                                    )}
                                                </GradientButton>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </form>
                        </div>
                    </GlassCard>

                    <div className="mt-12 text-center">
                        <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em]">
                            Already an established partner?{' '}
                            <Link href="/login" className="text-[#D4AF37] hover:brightness-125 transition-all underline ml-2 decoration-[#D4AF37]/30 decoration-2 underline-offset-4">Sign In</Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
