'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ShieldCheck, ArrowUpRight, Bike, Globe, Award } from 'lucide-react';
import { GlassCard } from '@/components/ui/premium/GlassCard';
import { MetallicText } from '@/components/ui/premium/MetallicText';

const BRANDS = [
    { name: 'Yamaha', slug: 'yamaha', description: 'Revs Your Heart with cutting-edge performance and reliability.', count: 42, icon: <Bike className="w-8 h-8" /> },
    { name: 'Honda', slug: 'honda', description: 'The Power of Dreams, delivering engineering excellence globally.', count: 35, icon: <Award className="w-8 h-8" /> },
    { name: 'Suzuki', slug: 'suzuki', description: 'Way of Life! Known for high-performance superbikes and commuters.', count: 28, icon: <ShieldCheck className="w-8 h-8" /> },
    { name: 'Kawasaki', slug: 'kawasaki', description: 'Let the Good Times Roll with the legendary Ninja series.', count: 21, icon: <Globe className="w-8 h-8" /> },
    { name: 'BMW', slug: 'bmw', description: 'Make Life a Ride. Premium German engineering for elite riders.', count: 15, icon: <Bike className="w-8 h-8" /> },
    { name: 'KTM', slug: 'ktm', description: 'Ready to Race. Dominating the off-road and street performance.', count: 18, icon: <Award className="w-8 h-8" /> },
];

export default function BrandsPage() {
    return (
        <div className="pt-32 pb-24 bg-[#0D0D0F] min-h-screen">
            <div className="max-w-7xl mx-auto px-6 sm:px-10">
                <div className="mb-20">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 mb-4"
                    >
                        <div className="h-px w-8 bg-[#D4AF37]" />
                        <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.5em]">Global Partners</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl lg:text-7xl font-display font-black text-white italic tracking-tight"
                    >
                        OFFICIAL <span className="text-white/20">MANUFACTURERS</span>
                    </motion.h1>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {BRANDS.map((brand, i) => (
                        <motion.div
                            key={brand.slug}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Link href={`/brands/${brand.slug}`}>
                                <GlassCard className="p-10 h-full border-white/5 hover:border-[#D4AF37]/50 transition-all duration-500 group relative overflow-hidden">
                                    {/* Background Accent */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-[#D4AF37]/10 transition-all" />

                                    <div className="mb-8 p-6 bg-white/5 w-fit rounded-3xl group-hover:scale-110 group-hover:bg-[#D4AF37]/10 transition-all duration-500 border border-white/10 text-white/40 group-hover:text-[#D4AF37]">
                                        {brand.icon}
                                    </div>

                                    <h3 className="text-3xl font-display font-black text-white italic mb-4 tracking-widest uppercase group-hover:text-[#D4AF37] transition-colors">
                                        {brand.name}
                                    </h3>

                                    <p className="text-sm text-white/40 leading-relaxed font-medium italic mb-8">
                                        {brand.description}
                                    </p>

                                    <div className="flex items-center justify-between pt-8 border-t border-white/5">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Available Models</span>
                                            <span className="text-xl font-bold text-white">{brand.count}+ Listings</span>
                                        </div>
                                        <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-white/20 group-hover:text-[#D4AF37] group-hover:border-[#D4AF37]/50 transition-all">
                                            <ArrowUpRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </GlassCard>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
