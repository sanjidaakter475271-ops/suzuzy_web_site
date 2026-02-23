import React from 'react';
import CustomerNav from '@/components/customer/CustomerNav';

export default function CustomerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-surface-page/50 dark:bg-dark-page text-ink-heading dark:text-white font-sans antialiased">
            <CustomerNav />
            <main className="container mx-auto px-4 py-8 lg:py-12">
                {children}
            </main>
        </div>
    );
}
