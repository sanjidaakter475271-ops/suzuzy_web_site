'use client';

import React from 'react';
import { Home, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
    return (
        <nav className="flex items-center text-sm text-ink-muted mb-6">
            <Link href="/dashboard" className="flex items-center gap-1 hover:text-brand transition-colors">
                <Home size={16} />
                <span className="sr-only">Home</span>
            </Link>

            {items.map((item, index) => (
                <React.Fragment key={index}>
                    <ChevronRight size={16} className="mx-2 text-surface-border dark:text-dark-border" />
                    {item.href ? (
                        <Link href={item.href} className="hover:text-brand transition-colors">
                            {item.label}
                        </Link>
                    ) : (
                        <span className="font-medium text-ink-heading dark:text-white">
                            {item.label}
                        </span>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
};

export default Breadcrumb;
