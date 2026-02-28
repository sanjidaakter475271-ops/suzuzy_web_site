const fs = require('fs');
const path = require('path');

const basePath = `d:/suzuky/apps/portal/src/app/service-admin/(dashboard)`;

const pages = [
    { path: 'users/roles', title: 'Roles & Permissions', parent: 'Users' },
    { path: 'users/activity', title: 'Activity Logs', parent: 'Users' },
    { path: 'users/login-history', title: 'Login History', parent: 'Users' },
    { path: 'security', title: 'OTP Dashboard', parent: 'Security & OTP' },
    { path: 'security/delivery-otp', title: 'Delivery OTP', parent: 'Security & OTP' },
    { path: 'security/discount-otp', title: 'Discount OTP', parent: 'Security & OTP' },
    { path: 'security/logs', title: 'Security Logs', parent: 'Security & OTP' },
    { path: 'settings/company', title: 'Company Profile', parent: 'Settings' },
    { path: 'settings/invoice', title: 'Invoice Settings', parent: 'Settings' },
    { path: 'settings/tax', title: 'VAT Settings', parent: 'Settings' },
    { path: 'settings/service-rules', title: 'Service Rules', parent: 'Settings' },
    { path: 'settings/backup', title: 'Backup Settings', parent: 'Settings' },
    { path: 'pos/terminal', title: 'POS Mode', parent: 'POS' },
    { path: 'pos/sales', title: 'Sales Records', parent: 'POS' },
    { path: 'pos/returns', title: 'Returns', parent: 'POS' }
];

pages.forEach(p => {
    const dirPath = path.join(basePath, p.path);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    const compName = (() => {
        const parts = p.path.split('/');
        const last = parts[parts.length - 1];
        return last.split('-').map(x => x.charAt(0).toUpperCase() + x.slice(1)).join('');
    })();

    const filePath = path.join(dirPath, 'page.tsx');
    if (!fs.existsSync(filePath)) {
        const content = `'use client';

import React from 'react';
import Breadcrumb from '@/components/service-admin/Breadcrumb';

const ${compName}Page = () => {
    return (
        <div className="p-6 lg:p-8 space-y-6 animate-fade">
            <Breadcrumb items={[{ label: '${p.parent}' }, { label: '${p.title}' }]} />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-ink-heading dark:text-white uppercase tracking-tight">${p.title}</h1>
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

export default ${compName}Page;
`;
        fs.writeFileSync(filePath, content);
        console.log('Created: ' + filePath);
    } else {
        console.log('Exists: ' + filePath);
    }
});
