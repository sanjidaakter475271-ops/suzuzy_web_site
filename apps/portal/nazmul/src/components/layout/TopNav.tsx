'use client';

import React, { useState, useEffect } from 'react';
import { Search, Bell, Menu, Sun, Moon, LogOut, User, HelpCircle, Settings, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface TopNavProps {
    toggleSidebar: () => void;
    onLogout: () => void;
}

const TopNav: React.FC<TopNavProps> = ({ toggleSidebar, onLogout }) => {
    const [profileOpen, setProfileOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);

    // Sync with HTML class
    useEffect(() => {
        const isDarkMode = document.documentElement.classList.contains('dark');
        setIsDark(isDarkMode);
    }, []);

    const toggleTheme = () => {
        const newDark = !isDark;
        setIsDark(newDark);
        if (newDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    return (
        <header className="sticky top-0 z-30 w-full bg-white dark:bg-dark-card border-b border-surface-border dark:border-dark-border shadow-soft h-16 transition-colors">
            <div className="flex items-center justify-between px-4 h-full">

                {/* Left: Mobile Menu & Search */}
                <div className="flex items-center gap-4 flex-1">
                    <button onClick={toggleSidebar} className="lg:hidden p-2 text-ink-muted hover:text-ink-heading hover:bg-surface-hover rounded-lg">
                        <Menu size={20} />
                    </button>

                    <div className="lg:hidden font-bold text-xl text-ink-heading dark:text-white">Birdseye</div>

                    {/* Search Bar (Desktop) */}
                    <div className="hidden md:flex relative w-full max-w-md ml-4">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={16} className="text-ink-muted" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search products, orders, or customers..."
                            className="block w-full pl-10 pr-3 py-2 border border-surface-border dark:border-dark-border rounded-lg bg-surface-page dark:bg-dark-page text-sm placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-brand dark:text-gray-200 transition-colors"
                        />
                    </div>
                </div>

                {/* Center: Top Menu (Desktop) */}
                <nav className="hidden lg:flex items-center gap-6 mr-8">
                    {[
                        { label: 'Home', path: '/dashboard' },
                        { label: 'Products', path: '/products' },
                        { label: 'Team', path: '/team' }
                    ].map((item) => (
                        <Link key={item.label} href={item.path} className="text-sm font-medium text-ink-body dark:text-gray-300 hover:text-brand transition-colors">
                            {item.label}
                        </Link>
                    ))}
                    <div className="relative group cursor-pointer">
                        <span className="text-sm font-medium text-ink-body dark:text-gray-300 group-hover:text-brand flex items-center gap-1">
                            More <ChevronDown size={14} />
                        </span>
                        <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-dark-card rounded-lg shadow-hover border border-surface-border dark:border-dark-border hidden group-hover:block p-2">
                            <Link href="/reports" className="block px-4 py-2 text-sm text-ink-body dark:text-gray-300 hover:bg-surface-hover dark:hover:bg-dark-border rounded-md">Reports</Link>
                            <Link href="/integrations" className="block px-4 py-2 text-sm text-ink-body dark:text-gray-300 hover:bg-surface-hover dark:hover:bg-dark-border rounded-md">Integrations</Link>
                        </div>
                    </div>
                </nav>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">

                    {/* Notification */}
                    <button className="relative p-2 text-ink-muted hover:text-brand hover:bg-surface-hover dark:hover:bg-dark-border rounded-full transition-colors">
                        <Bell size={20} />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border border-white dark:border-dark-card"></span>
                    </button>

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setProfileOpen(!profileOpen)}
                            className="flex items-center gap-2 p-1 pl-2 rounded-full border border-surface-border dark:border-dark-border hover:bg-surface-hover dark:hover:bg-dark-border transition-all"
                        >
                            <Image
                                src="https://picsum.photos/100/100"
                                alt="User"
                                width={32}
                                height={32}
                                className="w-8 h-8 rounded-full object-cover border border-white shadow-sm"
                            />
                            <span className="hidden md:block text-xs font-semibold text-ink-heading dark:text-gray-200 mr-1">Demo John</span>
                            <ChevronDown size={14} className="text-ink-muted" />
                        </button>

                        {profileOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)}></div>
                                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-dark-card rounded-xl shadow-hover border border-surface-border dark:border-dark-border z-20 overflow-hidden animate-fade">
                                    {/* User Info Header */}
                                    <div className="p-4 border-b border-surface-border dark:border-dark-border bg-surface-page/50 dark:bg-dark-page/50">
                                        <div className="flex items-center gap-3">
                                            <Image src="https://picsum.photos/100/100" width={40} height={40} className="w-10 h-10 rounded-full" alt="User" />
                                            <div>
                                                <p className="text-sm font-bold text-ink-heading dark:text-white">Demo John</p>
                                                <p className="text-xs text-ink-muted">demo@gmail.com</p>
                                            </div>
                                            <span className="ml-auto text-[10px] font-bold bg-brand-soft text-brand px-2 py-0.5 rounded-full">PRO</span>
                                        </div>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="p-2">
                                        <Link href="/profile" className="w-full flex items-center gap-3 px-3 py-2 text-sm text-ink-body dark:text-gray-300 hover:bg-surface-hover dark:hover:bg-dark-border rounded-lg transition-colors text-left" onClick={() => setProfileOpen(false)}>
                                            <User size={16} /> My Profile
                                        </Link>
                                        <Link href="/settings" className="w-full flex items-center gap-3 px-3 py-2 text-sm text-ink-body dark:text-gray-300 hover:bg-surface-hover dark:hover:bg-dark-border rounded-lg transition-colors text-left" onClick={() => setProfileOpen(false)}>
                                            <Settings size={16} /> My Account
                                        </Link>
                                        <Link href="/help" className="w-full flex items-center gap-3 px-3 py-2 text-sm text-ink-body dark:text-gray-300 hover:bg-surface-hover dark:hover:bg-dark-border rounded-lg transition-colors text-left" onClick={() => setProfileOpen(false)}>
                                            <HelpCircle size={16} /> Help & Support
                                        </Link>

                                        <div className="my-1 border-t border-surface-border dark:border-dark-border"></div>

                                        {/* Dark Mode Toggle */}
                                        <div className="flex items-center justify-between px-3 py-2 text-sm text-ink-body dark:text-gray-300 hover:bg-surface-hover dark:hover:bg-dark-border rounded-lg cursor-pointer" onClick={toggleTheme}>
                                            <div className="flex items-center gap-3">
                                                {isDark ? <Moon size={16} /> : <Sun size={16} />}
                                                <span>Dark Mode</span>
                                            </div>
                                            <div className={cn(
                                                "w-9 h-5 rounded-full relative transition-colors",
                                                isDark ? "bg-brand" : "bg-gray-300"
                                            )}>
                                                <div className={cn(
                                                    "absolute top-1 w-3 h-3 bg-white rounded-full transition-all shadow-sm",
                                                    isDark ? "left-5" : "left-1"
                                                )}></div>
                                            </div>
                                        </div>

                                        <div className="my-1 border-t border-surface-border dark:border-dark-border"></div>

                                        <button
                                            onClick={onLogout}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-danger hover:bg-danger-bg rounded-lg transition-colors text-left"
                                        >
                                            <LogOut size={16} /> Log out
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TopNav;
