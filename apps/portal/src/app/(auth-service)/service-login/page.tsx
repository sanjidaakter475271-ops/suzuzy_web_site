'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API
        setTimeout(() => {
            setIsLoading(false);
            router.push('/dashboard');
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-surface-page dark:bg-dark-page flex items-center justify-center p-4 transition-colors">
            <div className="max-w-4xl w-full bg-white dark:bg-dark-card rounded-2xl shadow-card overflow-hidden flex flex-col md:flex-row">

                {/* Left Side: Form */}
                <div className="flex-1 p-8 lg:p-12">
                    <div className="mb-10 text-center md:text-left">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand text-white mb-6 shadow-lg">
                            <ShieldCheck size={28} />
                        </div>
                        <h1 className="text-3xl font-bold text-ink-heading dark:text-white mb-2">Welcome Back</h1>
                        <p className="text-ink-muted text-sm">Sign in to your Financial Dashboard account</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-ink-body dark:text-gray-300">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-ink-muted">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    defaultValue="demo@gmail.com"
                                    className="block w-full pl-11 pr-4 py-3 border border-surface-border dark:border-dark-border rounded-xl bg-surface-page dark:bg-dark-page text-ink-heading dark:text-white placeholder-ink-muted focus:ring-2 focus:ring-brand focus:border-brand transition-all outline-none"
                                    placeholder="name@company.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-ink-body dark:text-gray-300">Password</label>
                                <a href="#" className="text-xs font-medium text-brand hover:underline">Forgot password?</a>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-ink-muted">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    defaultValue="password"
                                    className="block w-full pl-11 pr-12 py-3 border border-surface-border dark:border-dark-border rounded-xl bg-surface-page dark:bg-dark-page text-ink-heading dark:text-white placeholder-ink-muted focus:ring-2 focus:ring-brand focus:border-brand transition-all outline-none"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-ink-muted hover:text-ink-body dark:hover:text-white cursor-pointer"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-bold rounded-xl shadow-soft text-white bg-brand hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand transition-all disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Sign In <ArrowRight size={18} className="ml-2" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-surface-border dark:border-dark-border"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white dark:bg-dark-card text-ink-muted">OR CONTINUE WITH</span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-3">
                            <button className="w-full flex items-center justify-center py-3 px-4 border border-surface-border dark:border-dark-border rounded-xl shadow-sm bg-white dark:bg-dark-card text-sm font-bold text-ink-body dark:text-white hover:bg-surface-hover dark:hover:bg-dark-border transition-all">
                                <Image src="https://www.google.com/favicon.ico" width={18} height={18} className="mr-3" alt="google" />
                                Sign in with Google
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side: Visual/Branding */}
                <div className="hidden md:flex md:w-5/12 bg-brand-soft/50 dark:bg-brand/10 p-12 flex-col justify-center relative overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-brand-light/20 rounded-full blur-3xl"></div>

                    <div className="relative z-10">
                        <div className="w-16 h-1 w-1 bg-brand mb-8 rounded-full"></div>
                        <h2 className="text-4xl font-black text-ink-heading dark:text-white leading-tight mb-6">
                            Manage your <span className="text-brand">finances</span> with confidence.
                        </h2>
                        <p className="text-ink-body dark:text-gray-300 text-lg mb-10 leading-relaxed">
                            Powerful analytics and insights to help you grow your business faster and smarter.
                        </p>

                        <div className="space-y-6">
                            {[
                                { title: 'Real-time Analytics', desc: 'Track your metrics as they happen' },
                                { title: 'Enterprise Security', desc: 'Bank-grade encryption for your data' }
                            ].map((feature, i) => (
                                <div key={i} className="flex gap-4 items-start">
                                    <div className="w-6 h-6 rounded-full bg-brand/20 flex items-center justify-center flex-shrink-0 mt-1">
                                        <div className="w-2 h-2 rounded-full bg-brand"></div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-ink-heading dark:text-white text-sm">{feature.title}</h4>
                                        <p className="text-ink-muted text-xs">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
