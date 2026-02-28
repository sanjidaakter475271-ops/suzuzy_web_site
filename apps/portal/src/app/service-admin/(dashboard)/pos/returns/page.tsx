'use client';

import React from 'react';
import Breadcrumb from '@/components/service-admin/Breadcrumb';

const ReturnsPage = () => {
    return (
        <div className="p-6 lg:p-8 space-y-6 animate-fade">
            <Breadcrumb items={[{ label: 'POS' }, { label: 'Returns' }]} />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-ink-heading dark:text-white uppercase tracking-tight">Returns</h1>
                    <p className="text-sm text-ink-muted mt-1 font-medium">This feature is currently under construction.</p>
                </div>
            </div>

            <div className="py-24 flex flex-col items-center justify-center text-center space-y-6 bg-white dark:bg-dark-card rounded-[3rem] border-4 border-dashed border-surface-border dark:border-dark-border shadow-inner">
                 <h3 className="text-2xl font-black text-ink-heading dark:text-white uppercase tracking-tight">Coming Soon</h3>
                 <p className="text-ink-muted font-bold mt-2">We are working hard to bring you this feature. Check back later.</p>
            </div>
        </div>
    );
};

export default ReturnsPage;
