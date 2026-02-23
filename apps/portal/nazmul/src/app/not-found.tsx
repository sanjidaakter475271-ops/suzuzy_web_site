'use client';

import Link from 'next/link';
import { Button } from '@/components/ui';
import { Bird, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-surface-page dark:bg-dark-page flex flex-col items-center justify-center p-6 text-center animate-fade">
            <div className="relative mb-8">
                <div className="w-32 h-32 bg-brand-soft rounded-full flex items-center justify-center animate-pulse">
                    <Bird size={64} className="text-brand opacity-20" />
                </div>
                <h1 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl font-black text-ink-heading dark:text-white opacity-10">
                    404
                </h1>
            </div>

            <h2 className="text-3xl font-bold text-ink-heading dark:text-white mb-4">
                Page Not Found
            </h2>
            <p className="text-ink-muted max-w-md mb-10 text-lg">
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <Link
                    href="/dashboard"
                    className="bg-brand text-white hover:bg-brand-hover px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-brand/20 transition-all"
                >
                    <Home size={18} /> Back to Dashboard
                </Link>
                <Link
                    href="/dashboard"
                    onClick={() => window.history.back()}
                    className="border-2 border-surface-border dark:border-dark-border text-ink-muted hover:border-brand hover:text-brand px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all"
                >
                    <ArrowLeft size={18} /> Go Back
                </Link>
            </div>

            <div className="mt-20 pt-10 border-t border-surface-border dark:border-dark-border w-full max-w-lg">
                <p className="text-xs text-ink-muted">
                    If you believe this is a technical error, please contact support or
                    <a href="mailto:support@birdseye.com" className="text-brand font-bold ml-1 hover:underline">report an issue</a>.
                </p>
            </div>
        </div>
    );
}
