'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    SlidersHorizontal,
    X,
    ChevronDown,
    Bike as BikeIcon,
    ArrowUpDown
} from 'lucide-react';
import { BikeCard } from '@/components/ui/premium/BikeCard';
import { GlassCard } from '@/components/ui/premium/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Mock Data
const MOCK_BIKES = [
    { id: '1', name: 'Hayabusa 2024', brand: 'Suzuki', price: 2850000, condition: 'new', slug: 'suzuki-hayabusa-2024', isFeatured: true },
    { id: '2', name: 'R1M Special Edition', brand: 'Yamaha', price: 3200000, condition: 'new', slug: 'yamaha-r1m', isFeatured: true },
    { id: '3', name: 'CBR1000RR-R', brand: 'Honda', price: 2950000, condition: 'new', slug: 'honda-cbr1000rr', isFeatured: false },
    { id: '4', name: 'Ninja ZX-10R', brand: 'Kawasaki', price: 2750000, condition: 'new', slug: 'kawasaki-zx10r', isFeatured: false },
    { id: '5', name: 'S1000RR M Package', brand: 'BMW', price: 3500000, condition: 'new', slug: 'bmw-s1000rr', isFeatured: true },
    { id: '6', name: 'MT-09 2023', brand: 'Yamaha', price: 1850000, condition: 'used', slug: 'yamaha-mt09-used', isFeatured: false },
];

const BRANDS = ['Suzuki', 'Yamaha', 'Honda', 'Kawasaki', 'BMW', 'KTM', 'TVS', 'Bajaj'];
const CATEGORIES = ['Sports', 'Cruiser', 'Adventure', 'Commuter', 'Scooter'];

export default function BikesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    return (
        <div className="pt-32 pb-24 bg-[#0D0D0F] min-h-screen">
            {/* Header / Search Section */}
            <div className="max-w-7xl mx-auto px-6 sm:px-10 mb-16">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 mb-4"
                        >
                            <div className="h-px w-8 bg-[#D4AF37]" />
                            <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.5em]">The Marketplace</span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl lg:text-7xl font-display font-black text-white italic tracking-tight"
                        >
                            EXPLORE <span className="text-white/20">MASTERPIECES</span>
                        </motion.h1>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <div className="relative group min-w-[300px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-hover:text-[#D4AF37] transition-colors" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-14 pl-12 bg-white/5 border-white/10 rounded-2xl text-white outline-none focus:border-[#D4AF37]/50 transition-all font-medium"
                                placeholder="Search by model or brand..."
                            />
                        </div>
                        <Button
                            onClick={() => setIsFilterOpen(true)}
                            className="h-14 px-8 bg-white/5 border border-white/10 hover:border-[#D4AF37]/50 text-white rounded-2xl flex items-center gap-3 transition-all"
                        >
                            <SlidersHorizontal className="w-5 h-5 text-[#D4AF37]" />
                            <span className="text-xs font-bold uppercase tracking-widest">Filters</span>
                        </Button>
                    </div>
                </div>

                {/* Active Filters */}
                <div className="flex flex-wrap gap-3">
                    {selectedBrand && (
                        <button
                            onClick={() => setSelectedBrand(null)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest hover:bg-[#D4AF37]/20 transition-all"
                        >
                            Brand: {selectedBrand} <X className="w-3 h-3" />
                        </button>
                    )}
                    {selectedCategory && (
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-white/60 uppercase tracking-widest hover:text-white transition-all"
                        >
                            Category: {selectedCategory} <X className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>

            {/* Results Grid */}
            <div className="max-w-7xl mx-auto px-6 sm:px-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {MOCK_BIKES.map((bike, i) => (
                        <BikeCard
                            key={bike.id}
                            {...bike}
                            condition={bike.condition as 'new' | 'used'}
                        />
                    ))}
                </div>

                {/* Empty State */}
                {MOCK_BIKES.length === 0 && (
                    <div className="py-32 flex flex-col items-center justify-center text-center">
                        <div className="p-8 bg-white/5 border border-white/10 rounded-full mb-8">
                            <BikeIcon className="w-16 h-16 text-white/10" />
                        </div>
                        <h3 className="text-2xl font-display font-black text-white italic mb-2">NO BIKES FOUND</h3>
                        <p className="text-white/40 max-w-xs mx-auto">We couldn't find any bikes matching your current filters. Try refining your search.</p>
                        <Button
                            variant="link"
                            className="mt-6 text-[#D4AF37] hover:text-[#D4AF37]/80"
                            onClick={() => {
                                setSelectedBrand(null);
                                setSelectedCategory(null);
                                setSearchQuery('');
                            }}
                        >
                            Reset All Filters
                        </Button>
                    </div>
                )}

                {/* Pagination Placeholder */}
                <div className="mt-20 flex justify-center">
                    <Button variant="outline" className="h-14 px-12 border-white/5 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em]">
                        View More Arrivals
                    </Button>
                </div>
            </div>

            {/* Filter Drawer */}
            <AnimatePresence>
                {isFilterOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsFilterOpen(false)}
                            className="fixed inset-0 bg-[#0D0D0F]/80 backdrop-blur-sm z-[60]"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0D0D0F] border-l border-white/5 z-[70] p-10 flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-12">
                                <h2 className="text-3xl font-display font-black text-white italic italic tracking-tight">FILTERS</h2>
                                <button onClick={() => setIsFilterOpen(false)} className="p-2 text-white/40 hover:text-white transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-12 pr-4 scrollbar-hide">
                                {/* Brand Filter */}
                                <div>
                                    <h4 className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.5em] mb-6">BRANDS</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        {BRANDS.map((brand) => (
                                            <button
                                                key={brand}
                                                onClick={() => setSelectedBrand(brand === selectedBrand ? null : brand)}
                                                className={`h-12 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${selectedBrand === brand
                                                        ? 'bg-[#D4AF37] border-[#D4AF37] text-[#0D0D0F]'
                                                        : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
                                                    }`}
                                            >
                                                {brand}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Category Filter */}
                                <div>
                                    <h4 className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.5em] mb-6">TYPE</h4>
                                    <div className="space-y-3">
                                        {CATEGORIES.map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                                                className={`w-full h-14 px-6 rounded-2xl flex items-center justify-between border transition-all ${selectedCategory === cat
                                                        ? 'bg-white/10 border-[#D4AF37] text-white'
                                                        : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
                                                    }`}
                                            >
                                                <span className="text-xs font-bold uppercase tracking-widest">{cat}</span>
                                                <div className={`w-2 h-2 rounded-full ${selectedCategory === cat ? 'bg-[#D4AF37]' : 'bg-white/10'}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Price Range Placeholder */}
                                <div>
                                    <h4 className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.5em] mb-6">PRICE RANGE</h4>
                                    <div className="px-2">
                                        <div className="h-1 bg-white/10 rounded-full relative">
                                            <div className="absolute left-0 right-0 h-full bg-[#D4AF37] rounded-full" />
                                            <div className="absolute -top-1.5 left-0 w-4 h-4 rounded-full bg-white border-2 border-[#D4AF37]" />
                                            <div className="absolute -top-1.5 right-0 w-4 h-4 rounded-full bg-white border-2 border-[#D4AF37]" />
                                        </div>
                                        <div className="flex justify-between mt-4">
                                            <span className="text-[10px] font-bold text-white/40">৳ 0</span>
                                            <span className="text-[10px] font-bold text-white/40">৳ 5,000,000+</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-10 border-t border-white/5 mt-auto">
                                <Button
                                    onClick={() => setIsFilterOpen(false)}
                                    className="w-full h-16 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#0D0D0F] rounded-2xl text-xs font-bold uppercase tracking-widest shadow-2xl shadow-[#D4AF37]/20"
                                >
                                    Apply Master Filters
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
