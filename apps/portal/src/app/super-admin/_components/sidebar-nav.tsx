"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    BarChart3,
    Store,
    Users,
    Package,
    ShoppingCart,
    CreditCard,
    FileText,
    ShieldAlert,
    Settings,
    History,
    LayoutGrid,
    Tags,
    Compass,
    Briefcase,
    PieChart,
    UserPlus,
    Megaphone,
    Bell,
    ReceiptText,
    ChevronDown,
    ChevronRight,
    LogOut,
    Activity,
    Zap,
    TrendingUp,
    Calendar,
    Calculator,
    ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/hooks/useUser";
import { ROLE_LEVELS, getRoleLevel } from "@/middlewares/checkRole";
import { authClient } from "@/lib/auth/client";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
    name: string;
    href: string;
    icon: React.ElementType;
    danger?: boolean;
    subItems?: { name: string; href: string }[];
}

const SUPER_ADMIN_NAV: NavItem[] = [
    { name: "Dashboard", href: "/super-admin/dashboard", icon: BarChart3 },
    { name: "Dealers", href: "/super-admin/dealers", icon: Store },
    { name: "Users", href: "/super-admin/users", icon: Users },
    { name: "Products", href: "/super-admin/products", icon: Package },
    { name: "Orders", href: "/super-admin/orders", icon: ShoppingCart },
    { name: "Payments", href: "/super-admin/payments", icon: CreditCard },
    { name: "Subscription Plans", href: "/super-admin/plans", icon: FileText },
    { name: "Role & Unit", href: "/super-admin/roles-units", icon: ShieldCheck },
    { name: "Audit Logs", href: "/super-admin/audit-logs", icon: History },
    { name: "Settings", href: "/super-admin/settings", icon: Settings },
    { name: "Emergency", href: "/super-admin/emergency", icon: ShieldAlert, danger: true },
];

const ADMIN_NAV: NavItem[] = [
    { name: "Dashboard", href: "/admin/dashboard", icon: BarChart3 },
    { name: "Dealer Approvals", href: "/admin/dealers", icon: Store },
    { name: "Product Moderation", href: "/admin/products", icon: Package },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Catalog Management", href: "/admin/catalog", icon: LayoutGrid },
    { name: "Categories", href: "/admin/catalog/categories", icon: Tags },
    { name: "Brands", href: "/admin/catalog/brands", icon: Compass },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

const SALES_ADMIN_NAV: NavItem[] = [
    { name: "Sales Dashboard", href: "/sales-admin/dashboard", icon: BarChart3 },
    { name: "Live Monitor", href: "/sales-admin/live", icon: Activity },
    { name: "Quick POS", href: "/sales-admin/pos", icon: Zap },
    { name: "Transactions", href: "/sales-admin/transactions", icon: ReceiptText },
    { name: "Revenue", href: "/sales-admin/revenue", icon: TrendingUp },
    { name: "Daily Reports", href: "/sales-admin/reports/daily", icon: Calendar },
    { name: "Calculator", href: "/sales-admin/calculator", icon: Calculator },
    { name: "Analytics", href: "/sales-admin/analytics", icon: PieChart },
];

const SERVICE_ADMIN_NAV: NavItem[] = [
    { name: "Dashboard", href: "/service-admin", icon: BarChart3 },
    { name: "Workshop", href: "/service-admin/workshop", icon: LayoutGrid },
    { name: "Team Members", href: "/service-admin/members", icon: UserPlus },
    { name: "Settings", href: "/service-admin/settings", icon: Settings },
];

const DEALER_NAV: NavItem[] = [
    { name: "Dashboard", href: "/dealer/dashboard", icon: BarChart3 },
    {
        name: "My Products",
        href: "/dealer/products",
        icon: Briefcase,
        subItems: [
            { name: "All Products", href: "/dealer/products" },
            { name: "Add New Product", href: "/dealer/products/new" },
            { name: "Categories", href: "/dealer/products/categories" },
        ]
    },
    { name: "Inventory Hub", href: "/dealer/stock", icon: Package },
    { name: "Vendors", href: "/dealer/vendors", icon: Store },
    { name: "Purchase Orders", href: "/dealer/purchase", icon: ShoppingCart },
    { name: "POS Terminal", href: "/dealer/pos", icon: LayoutGrid },
    { name: "Sales Registry", href: "/dealer/sales", icon: ReceiptText },
    { name: "Store Orders", href: "/dealer/orders", icon: ShoppingCart },
    { name: "Marketing", href: "/dealer/marketing", icon: Megaphone },
    { name: "Intelligence & Reports", href: "/dealer/reports", icon: BarChart3 },
    { name: "Finance & Payouts", href: "/dealer/finance", icon: CreditCard },
    { name: "Team Members", href: "/dealer/sub-users", icon: UserPlus },
    { name: "Subscription", href: "/dealer/subscription", icon: FileText },
    { name: "Notifications", href: "/dealer/notifications", icon: Bell },
    { name: "Store Settings", href: "/dealer/settings", icon: Settings },
];

interface SidebarNavProps {
    mode?: "desktop" | "mobile";
}

export default function SidebarNav({ mode = "desktop" }: SidebarNavProps) {
    const pathname = usePathname();
    const { profile, signOut } = useUser();
    const [isHovered, setIsHovered] = useState(false);
    const [expandedItem, setExpandedItem] = useState<string | null>(null);

    // Sidebar is expanded if in mobile mode OR if hovered in desktop mode
    const isExpanded = mode === "mobile" || isHovered;

    const getNavItems = () => {
        if (!profile) return [];

        const roleLevel = getRoleLevel(profile.role);

        if (roleLevel === ROLE_LEVELS.super_admin) return SUPER_ADMIN_NAV;

        // Sales Admin (Levels 4 & 5)
        if (roleLevel === ROLE_LEVELS.showroom_sales_admin || roleLevel === ROLE_LEVELS.service_sales_admin) return SALES_ADMIN_NAV;

        // Service Admin (Level 3)
        if (roleLevel === ROLE_LEVELS.service_admin) return SERVICE_ADMIN_NAV;

        // General Admins (Levels 2-7) - excluding super_admin (1)
        // showroom_admin(2), service_admin(3), support(6), accountant(7)
        if (roleLevel <= 7 && roleLevel !== 1) return ADMIN_NAV;

        // Dealers (Levels 10-15)
        // dealer_owner(10) to sub_dealer(15)
        if (roleLevel >= 10 && roleLevel <= 15) return DEALER_NAV;

        // Fallback for custom dealer roles
        if (profile?.role?.includes('dealer')) return DEALER_NAV;

        return [];
    };

    const navItems = getNavItems();

    return (
        <motion.div
            className={cn(
                "flex flex-col h-full bg-[#0D0D0F] border-r border-[#D4AF37]/10 transition-all duration-300 ease-in-out z-50",
                mode === "desktop" ? "sticky top-0 h-screen flex-shrink-0" : "w-full"
            )}
            initial={mode === "desktop" ? { width: 80 } : undefined}
            animate={mode === "desktop" ? { width: isExpanded ? 288 : 80 } : undefined}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            onMouseEnter={() => mode === "desktop" && setIsHovered(true)}
            onMouseLeave={() => {
                if (mode === "desktop") {
                    setIsHovered(false);
                    setExpandedItem(null); // Close submenus when sidebar collapses
                }
            }}
        >
            <div className={cn("py-8 px-4 flex flex-col h-full overflow-y-auto custom-scrollbar", isExpanded ? "items-stretch" : "items-center")}>

                {/* Logo Section */}
                <div className={cn("mb-12 transition-all duration-300", isExpanded ? "px-4" : "px-0")}>
                    <Link href="/" className="group flex flex-col items-center md:items-start">
                        {isExpanded ? (
                            <>
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="font-display text-2xl font-black italic tracking-tighter text-[#F8F8F8] group-hover:text-[#D4AF37] transition-all whitespace-nowrap"
                                >
                                    ROYAL<span className="text-[#D4AF37] font-light">CONSORTIUM</span>
                                </motion.span>
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-[9px] font-bold text-[#D4AF37]/50 tracking-[0.4em] uppercase -mt-1 ml-1"
                                >
                                    Terminal v1.0
                                </motion.span>
                            </>
                        ) : (
                            <span className="font-display text-xl font-black italic tracking-tighter text-[#D4AF37]">
                                RC
                            </span>
                        )}
                    </Link>
                </div>

                <nav className="flex-1 space-y-2 w-full">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                        const Icon = item.icon;
                        const hasSubItems = item.subItems && item.subItems.length > 0;
                        const isSubMenuOpen = expandedItem === item.name;

                        return (
                            <div key={item.name} className="w-full">
                                <div
                                    className="relative"
                                    onMouseEnter={() => hasSubItems && isExpanded && setExpandedItem(item.name)}
                                >
                                    <Link
                                        href={hasSubItems ? "#" : item.href}
                                        onClick={(e) => {
                                            if (hasSubItems) {
                                                e.preventDefault();
                                                if (isExpanded) {
                                                    setExpandedItem(isSubMenuOpen ? null : item.name);
                                                }
                                            }
                                        }}
                                        className={cn(
                                            "flex items-center gap-4 px-3 py-3 rounded-lg transition-all duration-300 group relative w-full",
                                            isActive ? "bg-[#D4AF37]/10 text-[#D4AF37]" : "text-[#A1A1AA] hover:text-[#F8F8F8] hover:bg-white/5",
                                            !isExpanded && "justify-center"
                                        )}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-indicator"
                                                className="absolute left-0 w-1 h-6 bg-[#D4AF37] rounded-full"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                            />
                                        )}

                                        <Icon className={cn("w-5 h-5 flex-shrink-0 transition-colors", item.danger ? "text-[#DC2626]" : (isActive ? "text-[#D4AF37]" : "group-hover:text-[#D4AF37]"))} />

                                        {isExpanded && (
                                            <motion.span
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                className={cn(
                                                    "font-bold uppercase tracking-wider flex-1 truncate",
                                                    mode === "mobile" ? "text-sm" : "text-[11px]",
                                                    item.danger ? "text-[#DC2626]/80" : ""
                                                )}
                                            >
                                                {item.name}
                                            </motion.span>
                                        )}

                                        {isExpanded && hasSubItems && (
                                            <motion.div
                                                animate={{ rotate: isSubMenuOpen ? 180 : 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <ChevronDown className={cn(
                                                    "text-[#A1A1AA] group-hover:text-[#F8F8F8]",
                                                    mode === "mobile" ? "w-5 h-5" : "w-3 h-3"
                                                )} />
                                            </motion.div>
                                        )}
                                    </Link>
                                </div>

                                {/* Legacy Submenu (Inline) */}
                                <AnimatePresence>
                                    {isExpanded && hasSubItems && isSubMenuOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden ml-10 space-y-1 mt-1 border-l border-[#D4AF37]/10 pl-2"
                                        >
                                            {item.subItems!.map((subItem) => {
                                                const isSubActive = pathname === subItem.href;
                                                return (
                                                    <Link
                                                        key={subItem.href}
                                                        href={subItem.href}
                                                        className={cn(
                                                            "block py-2 px-3 font-medium uppercase tracking-wider rounded-md transition-colors",
                                                            mode === "mobile" ? "text-xs" : "text-[10px]",
                                                            isSubActive ? "text-[#D4AF37] bg-[#D4AF37]/5" : "text-[#A1A1AA] hover:text-[#F8F8F8] hover:bg-white/5"
                                                        )}
                                                    >
                                                        {subItem.name}
                                                    </Link>
                                                );
                                            })}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </nav>

                {/* User Profile Section */}
                <div className={cn("mt-auto pt-6 border-t border-[#D4AF37]/10 transition-all", isExpanded ? "w-full" : "w-auto")}>
                    {isExpanded ? (
                        <div className="bg-[#1A1A1C]/30 rounded-2xl p-4">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[9px] text-[#A1A1AA] uppercase tracking-widest font-black">Operator</p>
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#DC2626] flex items-center justify-center text-[#0D0D0F] font-black text-[10px] flex-shrink-0">
                                    {profile?.full_name?.[0]?.toUpperCase() || "O"}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-[11px] font-black text-[#F8F8F8] truncate">{profile?.full_name}</p>
                                    <p className="text-[9px] text-[#D4AF37] font-bold uppercase tracking-tighter truncate opacity-70">
                                        {profile?.role?.replace('_', ' ')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#DC2626] flex items-center justify-center text-[#0D0D0F] font-black text-[10px]">
                                {profile?.full_name?.[0]?.toUpperCase() || "O"}
                            </div>
                        </div>
                    )}
                </div>

                {/* Logout Button */}
                <div className={cn("mt-2 transition-all", isExpanded ? "px-0 pb-4" : "flex justify-center pb-4")}>
                    <button
                        onClick={() => signOut()}
                        className={cn(
                            "flex items-center gap-3 rounded-lg text-[#DC2626]/80 hover:text-[#DC2626] hover:bg-[#DC2626]/10 transition-all group",
                            isExpanded ? "w-full px-4 py-3" : "p-3 justify-center"
                        )}
                        title={!isExpanded ? "Sign Out" : undefined}
                    >
                        <LogOut className="w-4 h-4" />
                        {isExpanded && (
                            <span className="text-[11px] font-bold uppercase tracking-wider">Sign Out</span>
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
