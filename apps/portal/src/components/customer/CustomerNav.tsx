'use client';

import React, { useEffect, useState } from 'react';
import { useCustomerStore } from '@/stores/customerStore';
import { Button } from '@/components/ui';
import { LogOut, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

const CustomerNav = () => {
    const { customer, logout, isAuthenticated } = useCustomerStore();
    const router = useRouter();
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Prevent hydration mismatch
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    if (!isAuthenticated && !pathname.includes('/login') && !pathname.includes('/register')) {
        // Redirect logic should ideally be in middleware or page, but component can hint
        // For now just return null
        return null;
    }

    if (!isAuthenticated) return null; // Don't show nav on login/register pages if not authenticated

    const handleLogout = () => {
        logout();
        router.push('/customer/login');
    };

    const navLinks = [
        { label: 'Dashboard', href: '/customer/dashboard' },
        { label: 'Request Service', href: '/customer/request-service' },
        { label: 'Tracking', href: '/customer/track' },
        { label: 'History', href: '/customer/history' },
    ];

    return (
        <nav className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-surface-border dark:border-dark-border sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo */}
                <Link href="/customer/dashboard" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-brand text-white rounded-xl flex items-center justify-center font-black text-xl group-hover:scale-110 transition-transform">
                        RC
                    </div>
                    <span className="font-black text-xl tracking-tight text-ink-heading dark:text-white uppercase hidden md:block">
                        Auto<span className="text-brand">Core</span>
                    </span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`text-sm font-bold uppercase tracking-wide hover:text-brand transition-colors ${pathname === link.href ? 'text-brand' : 'text-ink-muted'}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* User & Logout */}
                <div className="hidden md:flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-sm font-black text-ink-heading dark:text-white">{customer?.name}</p>
                        <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">{customer?.phone}</p>
                    </div>
                    <Button variant="ghost" onClick={handleLogout} className="w-10 h-10 p-0 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl">
                        <LogOut size={20} />
                    </Button>
                </div>

                {/* Mobile Menu Toggle */}
                <button className="md:hidden p-2 text-ink-heading dark:text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white dark:bg-dark-card border-b border-surface-border dark:border-dark-border p-6 space-y-4 animate-in slide-in-from-top-4">
                    {navLinks.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsMenuOpen(false)}
                            className={`block py-3 text-sm font-bold uppercase tracking-wide border-b border-surface-border dark:border-dark-border last:border-0 ${pathname === link.href ? 'text-brand' : 'text-ink-heading dark:text-white'}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="pt-4 flex justify-between items-center">
                        <div className="text-left">
                            <p className="text-sm font-black text-ink-heading dark:text-white">{customer?.name}</p>
                            <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">{customer?.phone}</p>
                        </div>
                        <Button variant="ghost" onClick={handleLogout} className="h-8 px-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl gap-2 font-bold uppercase text-xs">
                            Logout <LogOut size={16} />
                        </Button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default CustomerNav;
