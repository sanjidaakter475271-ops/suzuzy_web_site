'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Target, Users, Award, Shield, Zap } from 'lucide-react';
import { GlassCard } from '@/components/ui/premium/GlassCard';
import { MetallicText } from '@/components/ui/premium/MetallicText';

const VALUES = [
    { title: 'INTEGRITY', desc: 'Every dealership on our platform undergoes a rigorous 50-point verification check.', icon: <Shield className="w-8 h-8" /> },
    { title: 'EXCELLENCE', desc: 'We only partner with brands and dealers that share our commitment to quality.', icon: <Award className="w-8 h-8" /> },
    { title: 'VELOCITY', desc: 'From discovery to delivery, we streamline the premium motorcycle acquisition process.', icon: <Zap className="w-8 h-8" /> },
];

export default function AboutPage() {
    return (
        <div className="pt-32 pb-24 bg-[#0D0D0F] min-h-screen">
            {/* Hero Section */}
            <section className="py-20 lg:py-32 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#D4AF37]/5 blur-[120px] rounded-full -mr-48 -mt-48" />
                <div className="max-w-7xl mx-auto px-6 sm:px-10 relative z-10">
                    <div className="max-w-3xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 mb-6"
                        >
                            <div className="h-px w-8 bg-[#D4AF37]" />
                            <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.5em]">Our Legacy</span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-6xl lg:text-8xl font-display font-black text-white italic tracking-tight mb-8"
                        >
                            REDEFINING <span className="text-white/20">PREMIUM</span>
                        </motion.h1>
                        <p className="text-xl text-white/40 leading-relaxed font-medium italic">
                            RoyalConsortium was born from a simple yet ambitious vision: to create the most trusted and sophisticated motorcycle ecosystem in Bangladesh. We bring together elite dealers and discerning riders under one roof.
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission / Vision */}
            <section className="py-24 bg-white/5 border-y border-white/5">
                <div className="max-w-7xl mx-auto px-6 sm:px-10">
                    <div className="grid lg:grid-cols-2 gap-20">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                        >
                            <GlassCard className="p-12 border-white/5 relative overflow-hidden h-full">
                                <div className="p-4 bg-[#D4AF37]/10 w-fit rounded-2xl mb-8 text-[#D4AF37]">
                                    <Target className="w-10 h-10" />
                                </div>
                                <h3 className="text-3xl font-display font-black text-white italic mb-6 tracking-widest uppercase">OUR MISSION</h3>
                                <p className="text-white/40 leading-relaxed font-bold italic">
                                    To empower motorcycle enthusiasts with a transparent, secure, and luxurious marketplace where every transaction is backed by trust and verified expertise.
                                </p>
                            </GlassCard>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            <GlassCard className="p-12 border-white/5 relative overflow-hidden h-full">
                                <div className="p-4 bg-[#D4AF37]/10 w-fit rounded-2xl mb-8 text-[#D4AF37]">
                                    <Users className="w-10 h-10" />
                                </div>
                                <h3 className="text-3xl font-display font-black text-white italic mb-6 tracking-widest uppercase">OUR COMMUNITY</h3>
                                <p className="text-white/40 leading-relaxed font-bold italic">
                                    Building a network of over 500+ verified dealers and 100,000+ riders across Bangladesh, fostering a culture of passion, safety, and excellence.
                                </p>
                            </GlassCard>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-32">
                <div className="max-w-7xl mx-auto px-6 sm:px-10">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl lg:text-5xl font-display font-black text-white italic mb-4 uppercase tracking-widest">
                            THE <span className="text-[#D4AF37]">ROYAL</span> STANDARD
                        </h2>
                        <div className="h-1 w-24 bg-[#D4AF37] mx-auto opacity-50" />
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {VALUES.map((value, i) => (
                            <motion.div
                                key={value.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="text-center group"
                            >
                                <div className="mb-8 p-8 bg-white/5 w-fit mx-auto rounded-[40px] border border-white/5 group-hover:border-[#D4AF37]/30 transition-all duration-500 text-white/20 group-hover:text-[#D4AF37] group-hover:scale-110">
                                    {value.icon}
                                </div>
                                <h3 className="text-xl font-display font-black text-white italic mb-4 tracking-widest uppercase">{value.title}</h3>
                                <p className="text-sm text-white/40 leading-relaxed font-medium italic group-hover:text-white/60 transition-colors">
                                    {value.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
