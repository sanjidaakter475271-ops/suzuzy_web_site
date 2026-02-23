'use client';

import React, { useState, useEffect } from 'react';
import { Bird, ChevronDown, ChevronRight, Circle, UserCircle, Settings, HelpCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { SIDEBAR_MENU } from '@/constants/menu';
import { cn } from '@/lib/utils';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const pathname = usePathname();
    const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

    // Automatically expand the menu that contains the current path on load/navigation
    useEffect(() => {
        const newExpanded: Record<string, boolean> = { ...expandedMenus };
        let hasChanges = false;

        SIDEBAR_MENU.forEach(group => {
            group.items.forEach(item => {
                if (item.subItems) {
                    const isActiveChild = item.subItems.some(sub =>
                        sub.path === pathname || (pathname === '/dashboard' && sub.path === '/dashboard')
                    );
                    if (isActiveChild && !newExpanded[item.title]) {
                        newExpanded[item.title] = true;
                        hasChanges = true;
                    }
                }
            });
        });

        if (hasChanges) {
            setExpandedMenus(newExpanded);
        }
    }, [pathname]);

    const toggleMenu = (title: string) => {
        setExpandedMenus(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                ></div>
            )}

            {/* Sidebar Container */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-50 h-screen w-64 bg-surface-sidebar dark:bg-dark-sidebar border-r border-surface-border dark:border-dark-border transform transition-transform duration-300 ease-in-out flex flex-col",
                    isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* Brand Header */}
                <div className="flex items-center gap-3 h-16 px-6 border-b border-surface-border dark:border-dark-border bg-surface-sidebar dark:bg-dark-sidebar flex-shrink-0">
                    <div className="p-1.5 bg-brand rounded-lg text-white shadow-lg">
                        <Bird size={20} fill="currentColor" strokeWidth={2.5} />
                    </div>
                    <span className="text-xl font-bold text-ink-heading dark:text-white tracking-tight">birdseye</span>
                </div>

                {/* Navigation Items - Scrollable */}
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6 custom-scrollbar">
                    {SIDEBAR_MENU.filter(group => group.groupTitle !== 'ACCOUNT').map((group, groupIndex) => (
                        <div key={groupIndex}>
                            <h3 className="px-3 mb-2 text-[11px] font-bold text-ink-muted uppercase tracking-widest opacity-80">
                                {group.groupTitle}
                            </h3>
                            <ul className="space-y-1">
                                {group.items.map((item, itemIndex) => {
                                    const Icon = item.icon || Bird;
                                    const isActive = !item.subItems && (pathname === item.path || (pathname === '/dashboard' && item.path === '/dashboard'));
                                    const isParentActive = item.subItems?.some(sub => sub.path === pathname);
                                    const isExpanded = expandedMenus[item.title];

                                    if (item.subItems) {
                                        return (
                                            <li key={itemIndex}>
                                                <button
                                                    onClick={() => toggleMenu(item.title)}
                                                    className={cn(
                                                        "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group select-none",
                                                        isParentActive
                                                            ? "text-brand dark:text-brand-light bg-brand-soft/50 dark:bg-brand/10"
                                                            : "text-ink-body dark:text-gray-400 hover:bg-surface-hover dark:hover:bg-white/5 hover:text-ink-heading dark:hover:text-white"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Icon
                                                            size={18}
                                                            className={cn(isParentActive ? "text-brand" : "text-ink-muted group-hover:text-ink-heading dark:group-hover:text-white transition-colors")}
                                                        />
                                                        <span>{item.title}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {item.badge && (
                                                            <span className="bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                                                                {item.badge}
                                                            </span>
                                                        )}
                                                        {isExpanded ?
                                                            <ChevronDown size={14} className={cn("transition-transform duration-200", isParentActive ? "text-brand" : "text-ink-muted")} /> :
                                                            <ChevronRight size={14} className="text-ink-muted" />
                                                        }
                                                    </div>
                                                </button>

                                                <div className={cn(
                                                    "overflow-hidden transition-all duration-300 ease-in-out",
                                                    isExpanded ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"
                                                )}>
                                                    <ul className="pl-4 space-y-1 border-l-2 border-surface-border dark:border-dark-border ml-4 my-1">
                                                        {item.subItems.map((sub, subIndex) => {
                                                            const isSubActive = pathname === sub.path;
                                                            return (
                                                                <li key={subIndex}>
                                                                    <Link
                                                                        href={sub.path || '#'}
                                                                        className={cn(
                                                                            "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                                                                            isSubActive
                                                                                ? "text-brand font-medium bg-white dark:bg-white/5 shadow-sm"
                                                                                : "text-ink-muted hover:text-ink-body dark:hover:text-gray-300 hover:bg-surface-hover dark:hover:bg-white/5"
                                                                        )}
                                                                    >
                                                                        {isSubActive && <Circle size={6} fill="currentColor" />}
                                                                        <span className={isSubActive ? '' : 'pl-3.5'}>{sub.title}</span>
                                                                    </Link>
                                                                </li>
                                                            )
                                                        })}
                                                    </ul>
                                                </div>
                                            </li>
                                        );
                                    }

                                    return (
                                        <li key={itemIndex}>
                                            <Link
                                                href={item.path || '#'}
                                                className={cn(
                                                    "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                                                    isActive
                                                        ? "bg-brand/20 text-brand shadow-sm"
                                                        : "text-ink-body dark:text-gray-400 hover:bg-surface-hover dark:hover:bg-white/5 hover:text-ink-heading dark:hover:text-white"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Icon
                                                        size={18}
                                                        className={cn(isActive ? "text-brand" : "text-ink-muted group-hover:text-ink-heading dark:group-hover:text-white transition-colors")}
                                                    />
                                                    <span>{item.title}</span>
                                                </div>
                                                {item.badge && (
                                                    <span className="bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Fixed Footer: Account & Pro Plan combined */}
                <div className="flex-shrink-0 p-4 border-t border-surface-border dark:border-dark-border bg-surface-sidebar/50 dark:bg-dark-sidebar/50 backdrop-blur-md space-y-4">
                    {/* Account Section */}
                    <div className="space-y-1">
                        {SIDEBAR_MENU.find(g => g.groupTitle === 'ACCOUNT')?.items.map((item, idx) => {
                            const Icon = item.icon || UserCircle;
                            const isActive = pathname === item.path;
                            return (
                                <Link
                                    key={idx}
                                    href={item.path || '#'}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-all group",
                                        isActive
                                            ? "text-brand bg-brand-soft/50 dark:bg-brand/10"
                                            : "text-ink-muted hover:text-ink-heading dark:hover:text-white hover:bg-surface-hover dark:hover:bg-white/5"
                                    )}
                                >
                                    <Icon size={18} className={cn(isActive ? "text-brand" : "opacity-70 group-hover:opacity-100")} />
                                    <span>{item.title}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Minimal Pro Plan Badge */}
                    <div className="px-3 py-2.5 bg-gradient-to-r from-brand/10 to-transparent dark:from-brand/5 dark:to-transparent rounded-xl border border-brand/10 dark:border-brand/5 group hover:border-brand/30 transition-all duration-300">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-black text-ink-heading dark:text-white uppercase tracking-widest">Pro</span>
                            <span className="text-[9px] font-bold text-brand">24 days left</span>
                        </div>
                        <div className="w-full bg-surface-border dark:bg-dark-border h-1 rounded-full overflow-hidden">
                            <div className="bg-brand h-full w-3/4 rounded-full shadow-[0_0_8px_rgba(199,91,18,0.3)]"></div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
