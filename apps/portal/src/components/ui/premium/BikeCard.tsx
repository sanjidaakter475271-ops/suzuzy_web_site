'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bike, ArrowRight, Star } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface BikeCardProps {
    id: string;
    name: string;
    brand: string;
    price: number;
    image?: string;
    condition: 'new' | 'used';
    slug: string;
    isFeatured?: boolean;
}

export function BikeCard({ name, brand, price, image, condition, slug, isFeatured }: BikeCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -10 }}
            transition={{ duration: 0.5 }}
            className="group"
        >
            <GlassCard className="h-full overflow-hidden border-white/5 hover:border-[#D4AF37]/30 transition-all duration-500">
                <Link href={`/bikes/${slug}`} className="block relative aspect-[4/3] overflow-hidden">
                    {/* Status Badge */}
                    <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md border ${condition === 'new' ? 'bg-[#D4AF37]/20 border-[#D4AF37]/50 text-[#D4AF37]' : 'bg-white/10 border-white/20 text-white'
                            }`}>
                            {condition === 'new' ? 'Brand New' : 'Pre-Owned'}
                        </span>
                        {isFeatured && (
                            <span className="px-3 py-1 rounded-full bg-red-600/20 border border-red-600/50 text-red-500 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
                                Featured
                            </span>
                        )}
                    </div>

                    {/* Image Placeholder/Image */}
                    <div className="w-full h-full bg-[#1A1A1C] flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                        {image ? (
                            <Image src={image} alt={name} fill className="object-cover" />
                        ) : (
                            <Bike className="w-20 h-20 text-white/5 group-hover:text-[#D4AF37]/20 transition-colors" />
                        )}
                    </div>

                    {/* Overlay Glow */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0F] via-transparent to-transparent opacity-60" />
                </Link>

                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.3em] mb-1">{brand}</p>
                            <h3 className="text-xl font-display font-black text-white italic group-hover:text-[#D4AF37] transition-colors">{name}</h3>
                        </div>
                        <div className="flex items-center gap-1 text-[#D4AF37]">
                            <Star className="w-3 h-3 fill-[#D4AF37]" />
                            <span className="text-[10px] font-bold">4.9</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Starting from</span>
                            <span className="text-xl font-bold text-white">৳ {price.toLocaleString()}</span>
                        </div>
                        <Link href={`/bikes/${slug}`}>
                            <div className="p-3 bg-white/5 rounded-xl border border-white/10 group-hover:border-[#D4AF37]/50 group-hover:bg-[#D4AF37]/10 transition-all text-white group-hover:text-[#D4AF37]">
                                <ArrowRight className="w-5 h-5" />
                            </div>
                        </Link>
                    </div>
                </div>
            </GlassCard>
        </motion.div>
    );
}
