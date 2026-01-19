'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Bike,
    ShieldCheck,
    Star,
    ArrowLeft,
    Share2,
    MessageCircle,
    Phone,
    ChevronRight,
    Zap,
    Fuel,
    Gauge,
    Weight
} from 'lucide-react';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/premium/GlassCard';
import { GradientButton } from '@/components/ui/premium/GradientButton';
import { Button } from '@/components/ui/button';

// Mock Data for a single bike
const BIKE_DETAILS = {
    id: '1',
    name: 'Hayabusa 2024',
    brand: 'Suzuki',
    price: 2850000,
    condition: 'new',
    description: 'The Suzuki Hayabusa 2024 is the ultimate expression of speed and refinement. Known for its legendary power and aerodynamics, this latest iteration brings advanced electronics and superior handling to the ultimate sportbike category.',
    images: [],
    specs: [
        { label: 'Engine', value: '1340cc, 4-stroke, Liquid-cooled', icon: <Zap className="w-5 h-5" /> },
        { label: 'Top Speed', value: '299 km/h (Limited)', icon: <Gauge className="w-5 h-5" /> },
        { label: 'Fuel Tank', value: '20 Liters', icon: <Fuel className="w-5 h-5" /> },
        { label: 'Weight', value: '264 kg (Kerb)', icon: <Weight className="w-5 h-5" /> },
    ],
    features: [
        'Suzuki Intelligent Ride System (S.I.R.S.)',
        'Brembo Stylema® Brake Calipers',
        'Bi-directional Quick Shift System',
        'Motion Track Brake System',
    ],
    dealer: {
        name: 'Royal Suzuki Dhaka',
        location: 'Gulshan 2, Dhaka',
        rating: 4.9,
        verified: true,
        phone: '+880 1XXX-XXXXXX'
    }
};

export default function BikeDetailPage() {
    const params = useParams();
    const [selectedColor, setSelectedColor] = useState('Sonic Silver');

    const colors = [
        { name: 'Metallic Thunder Gray', class: 'bg-gray-700' },
        { name: 'Sonic Silver', class: 'bg-zinc-400' },
        { name: 'Candy Daring Red', class: 'bg-red-600' }
    ];

    return (
        <div className="pt-32 pb-24 bg-[#0D0D0F] min-h-screen">
            <div className="max-w-7xl mx-auto px-6 sm:px-10">
                {/* Breadcrumbs / Back */}
                <div className="flex items-center justify-between mb-12">
                    <Link href="/bikes" className="flex items-center gap-2 text-xs font-bold text-white/40 hover:text-white transition-colors uppercase tracking-[0.2em]">
                        <ArrowLeft className="w-4 h-4" /> Back to Collection
                    </Link>
                    <button className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-white transition-all">
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>

                <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
                    {/* Left: Product Media */}
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="aspect-[4/3] rounded-[40px] bg-white/5 border border-white/5 relative overflow-hidden flex items-center justify-center p-12 group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <Bike className="w-64 h-64 text-white/5 group-hover:text-[#D4AF37]/20 transition-all duration-700 scale-110" />

                            <div className="absolute bottom-8 right-8 flex gap-3">
                                <span className="px-4 py-2 bg-black/40 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-widest border border-white/10">360° View</span>
                                <span className="px-4 py-2 bg-[#D4AF37]/20 backdrop-blur-md rounded-full text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest border border-[#D4AF37]/50">Official Media</span>
                            </div>
                        </motion.div>

                        {/* Thumbnails Placeholder */}
                        <div className="grid grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="aspect-square rounded-2xl bg-white/5 border border-white/10 hover:border-[#D4AF37]/50 transition-all cursor-pointer flex items-center justify-center">
                                    <Bike className="w-8 h-8 text-white/10" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Product Details */}
                    <div className="space-y-12">
                        <div>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2 mb-6"
                            >
                                <div className="h-px w-8 bg-[#D4AF37]" />
                                <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.5em]">{BIKE_DETAILS.brand} REGIME</span>
                            </motion.div>
                            <h1 className="text-5xl lg:text-7xl font-display font-black text-white italic tracking-tight mb-6">
                                {BIKE_DETAILS.name.split(' ')[0]} <span className="text-white/20">{BIKE_DETAILS.name.split(' ').slice(1).join(' ')}</span>
                            </h1>
                            <div className="flex items-center gap-6">
                                <div className="text-4xl font-bold text-white tracking-tight">৳ {BIKE_DETAILS.price.toLocaleString()}</div>
                                <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-white/40 uppercase tracking-widest">Fixed Price</div>
                            </div>
                        </div>

                        <p className="text-lg text-white/40 leading-relaxed font-medium italic">
                            {BIKE_DETAILS.description}
                        </p>

                        {/* Color Selector */}
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.5em]">COLOR PALETTE: <span className="text-white">{selectedColor}</span></h4>
                            <div className="flex gap-4">
                                {colors.map((color) => (
                                    <button
                                        key={color.name}
                                        onClick={() => setSelectedColor(color.name)}
                                        className={`w-12 h-12 rounded-full border-2 p-1 transition-all ${selectedColor === color.name ? 'border-[#D4AF37] scale-110 shadow-lg shadow-[#D4AF37]/20' : 'border-transparent hover:scale-105'
                                            }`}
                                    >
                                        <div className={`w-full h-full rounded-full ${color.class}`} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Specs Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {BIKE_DETAILS.specs.map((spec) => (
                                <GlassCard key={spec.label} className="p-6 border-white/5">
                                    <div className="p-3 bg-[#D4AF37]/10 w-fit rounded-xl mb-4 text-[#D4AF37]">
                                        {spec.icon}
                                    </div>
                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">{spec.label}</p>
                                    <p className="text-sm font-bold text-white font-display">{spec.value}</p>
                                </GlassCard>
                            ))}
                        </div>

                        {/* Dealer Card */}
                        <GlassCard className="p-8 border-[#D4AF37]/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 blur-[60px] rounded-full -mr-16 -mt-16" />
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-8">
                                <div className="flex gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#D4AF37]">
                                        <ShieldCheck className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest mb-1">Authorized Showroom</p>
                                        <h4 className="text-xl font-display font-black text-white italic mb-2 tracking-wide font-black italic">{BIKE_DETAILS.dealer.name}</h4>
                                        <div className="flex items-center gap-4 text-xs font-bold text-white/40 italic">
                                            <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" /> {BIKE_DETAILS.dealer.rating}</span>
                                            <span className="flex items-center gap-1 italic"><ChevronRight className="w-3 h-3 text-[#D4AF37]" /> {BIKE_DETAILS.dealer.location}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3 w-full sm:w-auto">
                                    <button className="flex-1 sm:flex-none p-4 bg-white/5 border border-white/10 rounded-2xl text-white hover:border-[#D4AF37]/50 transition-all">
                                        <Phone className="w-6 h-6 mx-auto" />
                                    </button>
                                    <GradientButton className="flex-[2] sm:flex-none h-14 px-8 text-xs">
                                        Secure Consultation
                                    </GradientButton>
                                </div>
                            </div>
                        </GlassCard>

                        {/* Key Features */}
                        <div className="space-y-6 pt-8 border-t border-white/5">
                            <h4 className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.5em]">ELITE CHARACTERISTICS</h4>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
                                {BIKE_DETAILS.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-3 text-xs font-bold text-white/60 italic">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
