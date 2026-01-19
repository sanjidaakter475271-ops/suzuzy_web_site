'use client';

import Link from 'next/link';
import {
    ShieldCheck,
    Facebook,
    Instagram,
    Twitter,
    Youtube,
    Mail,
    Phone,
    MapPin,
    ArrowUpRight
} from 'lucide-react';
import { GradientButton } from '@/components/ui/premium/GradientButton';
import { Input } from '@/components/ui/input';

const FOOTER_LINKS = [
    {
        title: 'PLATFORM',
        links: [
            { name: 'Marketplace', href: '/bikes' },
            { name: 'Dealers', href: '/dealers' },
            { name: 'Pricing', href: '/pricing' },
            { name: 'Sell Bike', href: '/register' },
        ]
    },
    {
        title: 'COMPANY',
        links: [
            { name: 'About Us', href: '/about' },
            { name: 'Contact', href: '/contact' },
            { name: 'Careers', href: '/careers' },
            { name: 'Blog', href: '/blog' },
        ]
    },
    {
        title: 'LEGAL',
        links: [
            { name: 'Terms of Service', href: '/terms' },
            { name: 'Privacy Policy', href: '/privacy' },
            { name: 'Cookie Policy', href: '/cookies' },
            { name: 'Refund Policy', href: '/refunds' },
        ]
    }
];

export function Footer() {
    return (
        <footer className="bg-[#0D0D0F] border-t border-white/5 pt-24 pb-12 relative overflow-hidden">
            {/* Background Decorative Element */}
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/5 blur-[150px] rounded-full -mr-64 -mb-64 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 sm:px-10 relative z-10">
                <div className="grid lg:grid-cols-4 gap-16 mb-24">
                    {/* Brand Info */}
                    <div className="col-span-1 lg:col-span-1">
                        <Link href="/" className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-white/5 border border-white/10 rounded-xl">
                                <ShieldCheck className="w-6 h-6 text-[#D4AF37]" />
                            </div>
                            <span className="text-xl font-display font-black tracking-[0.2em] text-white uppercase">
                                Royal<span className="text-[#D4AF37]">Consortium</span>
                            </span>
                        </Link>
                        <p className="text-sm text-white/40 leading-relaxed font-medium mb-10 max-w-xs">
                            Bangladesh's premier multi-dealer motorcycle ecosystem. Redefining the premium riding experience through transparency and technology.
                        </p>
                        <div className="flex gap-4">
                            {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-[#D4AF37] hover:border-[#D4AF37]/50 transition-all duration-300">
                                    <Icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="col-span-1 lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-12">
                        {FOOTER_LINKS.map((section) => (
                            <div key={section.title}>
                                <h4 className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.5em] mb-8">{section.title}</h4>
                                <ul className="space-y-5">
                                    {section.links.map((link) => (
                                        <li key={link.name}>
                                            <Link href={link.href} className="text-sm font-bold text-white/40 hover:text-white transition-colors flex items-center gap-1 group">
                                                {link.name}
                                                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Newsletter */}
                    <div className="col-span-1 lg:col-span-1">
                        <h4 className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.5em] mb-8">ELITE UPDATES</h4>
                        <p className="text-sm text-white/40 mb-6 font-medium">Join our inner circle for exclusive access to high-performance arrivals.</p>
                        <form className="space-y-3">
                            <Input
                                className="h-12 bg-white/5 border-white/10 rounded-xl text-white outline-none focus:border-[#D4AF37]/50"
                                placeholder="Enter your email"
                            />
                            <GradientButton className="w-full h-12 text-xs">
                                Subscribe Now
                            </GradientButton>
                        </form>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-wrap justify-center md:justify-start gap-10 text-[10px] font-bold uppercase tracking-[0.5em] text-white/20">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3" /> Gulshan, Dhaka, Bangladesh
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3" /> +880 1XXX-XXXXXX
                        </div>
                        <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3" /> concierge@royalconsortium.com
                        </div>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/10">
                        © 2026 ROYALCONSORTIUM. DESIGNED FOR EXCELLENCE.
                    </p>
                </div>
            </div>
        </footer>
    );
}
