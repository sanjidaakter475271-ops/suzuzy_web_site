'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="flex min-h-screen bg-surface-page dark:bg-dark-page transition-colors duration-200">
            <div className="print:hidden">
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            </div>

            <div className={cn(
                "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out",
                isSidebarOpen ? "lg:ml-64 print:ml-0" : "print:ml-0"
            )}>
                <div className="print:hidden">
                    <TopNav
                        toggleSidebar={toggleSidebar}
                        onLogout={() => console.log('Logout clicked')}
                    />
                </div>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-surface-page dark:bg-dark-page print:bg-white print:overflow-visible">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
