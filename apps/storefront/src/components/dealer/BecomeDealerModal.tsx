'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Building, MapPin, Phone, FileText, X, CheckCircle2, ArrowRight } from 'lucide-react';
import { GlassCard } from '@/components/ui/premium/GlassCard';
import { MetallicText } from '@/components/ui/premium/MetallicText';
import { GradientButton } from '@/components/ui/premium/GradientButton';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface BecomeDealerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function BecomeDealerModal({ isOpen, onClose }: BecomeDealerModalProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const [formData, setFormData] = useState({
        businessName: '',
        phone: '',
        address: '',
        tradeLicense: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        startTransition(async () => {
            try {
                const { error: rpcError } = await supabase.rpc('apply_for_dealership', {
                    p_business_name: formData.businessName,
                    p_phone: formData.phone,
                    p_address: formData.address,
                    p_trade_license_no: formData.tradeLicense
                });

                if (rpcError) throw rpcError;

                // Success - Redirect to Portal Pending Page
                // The portal runs on a separate app, but for now assuming same domain or mapped route
                // Actually, Portal is likely localhost:3001 or similar in dev, but in prod it's subpath or subdomain.
                // For now, we'll assume we can navigate to the portal URL.
                // If monorepo shares auth, we can just point to the pending page.
                // Assuming portal is mapped to /portal or similar, OR we just show success state.

                // Since this is the Storefront App, we might not have the "Pending Page" here.
                // We will close the modal and maybe redirect to an "Application Sent" page in Storefront?
                // Or try redirecting to the Portal URL.

                // Let's redirect to a local success page for now or refresh.
                router.refresh();
                onClose();
                // Optionally redirect to external portal: window.location.href = 'http://localhost:3001/dealer-pending';
                window.location.href = 'http://localhost:3001/dealer-pending'; // TODO: Make this dynamic based on env

            } catch (err: any) {
                setError(err.message || 'Failed to submit application');
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative z-10 w-full max-w-2xl"
            >
                <GlassCard className="p-8 md:p-12 border-[#D4AF37]/20 relative overflow-hidden">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 bg-white/5 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="text-center mb-10">
                        <div className="inline-flex p-3 bg-[#D4AF37]/10 rounded-2xl mb-6 ring-1 ring-[#D4AF37]/20">
                            <ShieldCheck className="w-8 h-8 text-[#D4AF37]" />
                        </div>
                        <h2 className="text-3xl font-display font-black text-white italic mb-2">
                            BECOME A <MetallicText>PARTNER</MetallicText>
                        </h2>
                        <p className="text-white/40">Join the elite network of verified dealers</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest ml-1">Business Name</label>
                                <div className="relative group">
                                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#D4AF37]" />
                                    <Input
                                        name="businessName"
                                        value={formData.businessName}
                                        onChange={handleChange}
                                        className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl text-white outline-none"
                                        placeholder="Royal Motors"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest ml-1">Business Phone</label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#D4AF37]" />
                                    <Input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl text-white outline-none"
                                        placeholder="+880 1..."
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest ml-1">Showroom Address</label>
                            <div className="relative group">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#D4AF37]" />
                                <Input
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl text-white outline-none"
                                    placeholder="Full Address"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest ml-1">Trade License No.</label>
                            <div className="relative group">
                                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#D4AF37]" />
                                <Input
                                    name="tradeLicense"
                                    value={formData.tradeLicense}
                                    onChange={handleChange}
                                    className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl text-white outline-none"
                                    placeholder="License Number (Optional)"
                                />
                            </div>
                        </div>

                        <GradientButton
                            className="w-full h-14 text-sm font-bold mt-4"
                            type="submit"
                            disabled={isPending}
                        >
                            {isPending ? 'Submitting Application...' : (
                                <>Submit Application <ArrowRight className="w-5 h-5 ml-2" /></>
                            )}
                        </GradientButton>

                        <p className="text-center text-xs text-white/30">
                            By submitting, you agree to our Dealer Terms & Conditions.
                        </p>
                    </form>
                </GlassCard>
            </motion.div>
        </div>
    );
}
