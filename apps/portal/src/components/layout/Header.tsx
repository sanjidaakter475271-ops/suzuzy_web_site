'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck,
    Menu,
    X,
    ChevronDown,
    Search,
    LogOut,
    Bike,
    ShoppingBag,
    Settings,
    LayoutDashboard,
} from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { useAuth } from '@/hooks/useAuth';
import { GradientButton } from '@/components/ui/premium/GradientButton';
import { GlassCard } from '@/components/ui/premium/GlassCard';
import { Button } from '@/components/ui/button';

const BIKES_CATEGORIES = [
    { name: 'Sports Bike', slug: 'sports', icon: <Bike className="w-5 h-5" /> },
    { name: 'Commuter', slug: 'commuter', icon: <Bike className="w-5 h-5" /> },
    { name: 'Cruiser', slug: 'cruiser', icon: <Bike className="w-5 h-5" /> },
    { name: 'Scooter', slug: 'scooter', icon: <Bike className="w-5 h-5" /> },
];

const BRANDS = [
    { name: 'Yamaha', slug: 'yamaha' },
    { name: 'Honda', slug: 'honda' },
    { name: 'Suzuki', slug: 'suzuki' },
    { name: 'KTM', slug: 'ktm' },
];

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
    const { profile, loading } = useUser();
    const { signOut } = useAuth();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Bikes', mega: 'bikes', href: '/bikes' },
        { name: 'Brands', mega: 'brands', href: '/brands' },
        { name: 'Dealers', href: '/dealers' },
        { name: 'Contact', href: '/contact' },
    ];

    return (
        <header
            className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'py-4 bg-[#0D0D0F]/80 backdrop-blur-xl border-b border-white/5' : 'py-6 bg-transparent'
                }`}
            onMouseLeave={() => setActiveMegaMenu(null)}
        >
            <div className="max-w-7xl mx-auto px-6 sm:px-10 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 relative z-10">
                    <div className="p-2 bg-white/5 border border-white/10 rounded-xl shadow-lg">
                        <ShieldCheck className="w-6 h-6 text-[#D4AF37]" />
                    </div>
                    <span className="text-xl font-display font-black tracking-[0.2em] text-white hidden sm:block">
                        ROYAL<span className="text-[#D4AF37]">CONSORTIUM</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <div
                            key={link.name}
                            className="relative group"
                            onMouseEnter={() => setActiveMegaMenu(link.mega || null)}
                        >
                            <Link
                                href={link.href}
                                className="text-xs font-bold uppercase tracking-[0.2em] text-white/60 hover:text-[#D4AF37] transition-colors flex items-center gap-1.5 py-2"
                            >
                                {link.name}
                                {link.mega && <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${activeMegaMenu === link.mega ? 'rotate-180 text-[#D4AF37]' : ''}`} />}
                            </Link>

                            {/* Indicator */}
                            <motion.div
                                className="absolute bottom-0 left-0 h-0.5 bg-[#D4AF37] w-0 group-hover:w-full transition-all duration-300"
                                layoutId="nav-underline"
                            />
                        </div>
                    ))}
                </nav>

                {/* Desktop Actions */}
                <div className="hidden lg:flex items-center gap-6">
                    <button className="p-2 text-white/60 hover:text-white transition-colors">
                        <Search className="w-5 h-5" />
                    </button>

                    <div className="h-4 w-px bg-white/10" />

                    {loading ? (
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-4 bg-white/5 animate-pulse rounded" />
                            <div className="w-24 h-10 bg-white/5 animate-pulse rounded-xl" />
                        </div>
                    ) : (
                        profile ? (
                            <div className="relative group">
                                <button className="flex items-center gap-3 p-1.5 pr-4 bg-white/5 border border-white/10 rounded-full hover:border-[#D4AF37]/50 transition-all duration-300">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#DC2626] flex items-center justify-center text-[#0D0D0F] font-bold text-xs">
                                        {profile.full_name?.[0].toUpperCase() || 'U'}
                                    </div>
                                    <span className="text-xs font-bold text-white/80">{profile.full_name?.split(' ')[0]}</span>
                                    <ChevronDown className="w-3 h-3 text-white/40 group-hover:rotate-180 transition-transform duration-300" />
                                </button>

                                {/* User Dropdown */}
                                <div className="absolute right-0 top-full mt-2 w-56 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300">
                                    <GlassCard className="p-2 border-[#D4AF37]/20">
                                        <div className="px-4 py-3 mb-2 border-b border-white/5">
                                            <p className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">Signed in as</p>
                                            <p className="text-xs font-bold text-white truncate">{profile.full_name}</p>
                                        </div>
                                        <div className="space-y-1">
                                            {profile.role !== 'customer' && (
                                                <Link href={`/${profile.role}/dashboard`} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all">
                                                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                                                </Link>
                                            )}
                                            <Link href="/account/orders" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all">
                                                <ShoppingBag className="w-4 h-4" /> My Orders
                                            </Link>
                                            <Link href="/account/settings" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all">
                                                <Settings className="w-4 h-4" /> Settings
                                            </Link>
                                            <button
                                                onClick={signOut}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all"
                                            >
                                                <LogOut className="w-4 h-4" /> Sign Out
                                            </button>
                                        </div>
                                    </GlassCard>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link href="/login" className="text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white transition-colors">
                                    Sign In
                                </Link>
                                <Link href="/register">
                                    <GradientButton className="px-6 py-2.5 rounded-xl text-xs">
                                        Partner With Us
                                    </GradientButton>
                                </Link>
                            </div>
                        )
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="lg:hidden p-2 text-white relative z-10"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mega Menu Overlay */}
            <AnimatePresence>
                {activeMegaMenu && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-full left-0 w-full bg-[#0D0D0F]/95 backdrop-blur-2xl border-b border-white/5 shadow-2xl hidden lg:block overflow-hidden"
                    >
                        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-12">
                            {activeMegaMenu === 'bikes' && (
                                <div className="grid grid-cols-4 gap-12">
                                    <div className="col-span-1 border-r border-white/5 pr-12">
                                        <h3 className="text-xl font-display font-black text-white italic mb-6">EXPLORE BY <span className="text-[#D4AF37]">CATEGORY</span></h3>
                                        <div className="space-y-4">
                                            {BIKES_CATEGORIES.map((cat) => (
                                                <Link
                                                    key={cat.slug}
                                                    href={`/categories/${cat.slug}`}
                                                    className="flex items-center gap-3 text-sm font-bold text-white/60 hover:text-[#D4AF37] transition-all group"
                                                >
                                                    <div className="p-2 bg-white/5 rounded-lg group-hover:bg-[#D4AF37]/10 transition-colors">
                                                        {cat.icon}
                                                    </div>
                                                    {cat.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="col-span-3">
                                        <div className="grid grid-cols-3 gap-8">
                                            {/* Featured Bike Preview */}
                                            <div className="col-span-2 relative h-full min-h-[300px] rounded-3xl overflow-hidden group">
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0F] via-transparent to-transparent z-10" />
                                                <div className="absolute bottom-0 left-0 p-8 z-20">
                                                    <p className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.5em] mb-2">Editor&apos;s Choice</p>
                                                    <h4 className="text-3xl font-display font-black text-white italic mb-4">SUZUKI HAYABUSA 2024</h4>
                                                    <Link href="/bikes/suzuki-hayabusa">
                                                        <GradientButton className="px-6 py-2 text-xs">View Masterpiece</GradientButton>
                                                    </Link>
                                                </div>
                                                <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                                    <Bike className="w-32 h-32 text-white/5 group-hover:scale-110 group-hover:text-[#D4AF37]/10 transition-all duration-700" />
                                                </div>
                                            </div>
                                            <div className="col-span-1 space-y-6">
                                                <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-[0.3em] mb-4">Quick Filters</h3>
                                                <div className="space-y-2">
                                                    <Link href="/bikes?condition=new" className="block text-xs font-bold text-white/40 hover:text-white transition-colors underline-offset-4 hover:underline">Brand New Arrival</Link>
                                                    <Link href="/bikes?condition=used" className="block text-xs font-bold text-white/40 hover:text-white transition-colors underline-offset-4 hover:underline">Certified Pre-owned</Link>
                                                    <Link href="/bikes?sort=price-asc" className="block text-xs font-bold text-white/40 hover:text-white transition-colors underline-offset-4 hover:underline">Most Accessible</Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeMegaMenu === 'brands' && (
                                <div className="grid grid-cols-4 gap-8">
                                    {BRANDS.map((brand) => (
                                        <Link
                                            key={brand.slug}
                                            href={`/brands/${brand.slug}`}
                                            className="group relative h-48 rounded-3xl overflow-hidden bg-white/5 border border-white/5 hover:border-[#D4AF37]/30 transition-all flex flex-col items-center justify-center p-8 text-center"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <span className="text-2xl font-black italic text-white group-hover:text-[#D4AF37] transition-all transform group-hover:scale-110 tracking-widest">{brand.name.toUpperCase()}</span>
                                            <span className="mt-2 text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">Official Partner</span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        className="fixed inset-0 bg-[#0D0D0F] z-40 pt-32 px-6 flex flex-col lg:hidden"
                    >
                        <div className="space-y-8 flex-1 overflow-y-auto pb-20">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block text-3xl font-display font-black text-white italic hover:text-[#D4AF37] transition-colors"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        <div className="py-10 border-t border-white/10 space-y-6">
                            {profile ? (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#DC2626]" />
                                        <div>
                                            <p className="text-sm font-bold text-white">{profile.full_name}</p>
                                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{profile.role}</p>
                                        </div>
                                    </div>
                                    <button onClick={signOut} className="p-3 bg-white/5 rounded-xl text-red-500">
                                        <LogOut className="w-6 h-6" />
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button variant="outline" className="w-full h-14 border-white/10 bg-white/5 text-white rounded-2xl">Sign In</Button>
                                    </Link>
                                    <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                                        <GradientButton className="w-full h-14 text-sm">Partner Now</GradientButton>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
