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
    ReceiptText
} from "lucide-react";
import { motion } from "framer-motion";
import { useUser } from "@/hooks/useUser";
import { ROLE_LEVELS, getRoleLevel } from "@/lib/supabase/roles";
import { supabase } from "@/lib/supabase";

interface NavItem {
    name: string;
    href: string;
    icon: React.ElementType;
    danger?: boolean;
}

const SUPER_ADMIN_NAV: NavItem[] = [
    { name: "Dashboard", href: "/super-admin/dashboard", icon: BarChart3 },
    { name: "Dealers", href: "/super-admin/dealers", icon: Store },
    { name: "Users", href: "/super-admin/users", icon: Users },
    { name: "Products", href: "/super-admin/products", icon: Package },
    { name: "Orders", href: "/super-admin/orders", icon: ShoppingCart },
    { name: "Payments", href: "/super-admin/payments", icon: CreditCard },
    { name: "Subscription Plans", href: "/super-admin/plans", icon: FileText },
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

const DEALER_NAV: NavItem[] = [
    { name: "Dashboard", href: "/dealer/dashboard", icon: BarChart3 },
    { name: "My Products", href: "/dealer/products", icon: Briefcase },
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

export default function SidebarNav() {
    const pathname = usePathname();
    const { profile } = useUser();

    const getNavItems = () => {
        if (!profile) return [];

        const roleLevel = getRoleLevel(profile.role);

        if (roleLevel === ROLE_LEVELS.SUPER_ADMIN) return SUPER_ADMIN_NAV;
        if (roleLevel <= ROLE_LEVELS.VIEWER) return ADMIN_NAV;
        if (roleLevel <= ROLE_LEVELS.DEALER_STAFF) return DEALER_NAV;

        return [];
    };

    const navItems = getNavItems();

    return (
        <div className="py-8 px-4 flex flex-col h-full overflow-y-auto custom-scrollbar">
            <div className="px-4 mb-12">
                <Link href="/" className="group flex flex-col">
                    <span className="font-display text-2xl font-black italic tracking-tighter text-[#F8F8F8] group-hover:text-[#D4AF37] transition-all">
                        ROYAL<span className="text-[#D4AF37] font-light">CONSORTIUM</span>
                    </span>
                    <span className="text-[9px] font-bold text-[#D4AF37]/50 tracking-[0.4em] uppercase -mt-1 ml-1">
                        Terminal v1.0
                    </span>
                </Link>
            </div>

            <nav className="flex-1 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group relative ${isActive
                                ? "bg-[#D4AF37]/10 text-[#D4AF37]"
                                : "text-[#A1A1AA] hover:text-[#F8F8F8] hover:bg-white/5"
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="active-indicator"
                                    className="absolute left-0 w-1 h-6 bg-[#D4AF37] rounded-full"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                />
                            )}
                            <Icon className={`w-4 h-4 ${item.danger ? "text-[#DC2626]" : (isActive ? "text-[#D4AF37]" : "group-hover:text-[#D4AF37]")
                                }`} />
                            <span className={`text-[11px] font-bold uppercase tracking-wider ${item.danger ? "text-[#DC2626]/80" : ""}`}>
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-8 px-4 py-6 border-t border-[#D4AF37]/10 bg-[#1A1A1C]/30 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-[9px] text-[#A1A1AA] uppercase tracking-widest font-black">Operator</p>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#DC2626] flex items-center justify-center text-[#0D0D0F] font-black text-[10px]">
                        {profile?.full_name?.[0]?.toUpperCase() || "O"}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-[11px] font-black text-[#F8F8F8] truncate">{profile?.full_name}</p>
                        <p className="text-[9px] text-[#D4AF37] font-bold uppercase tracking-tighter truncate opacity-70">
                            {profile?.role?.replace('_', ' ')}
                        </p>
                    </div>
                    <button
                        onClick={async () => {
                            await supabase.auth.signOut();
                            window.location.href = '/login';
                        }}
                        className="p-2 hover:bg-white/5 rounded-lg text-[#A1A1AA] hover:text-[#DC2626] transition-colors group"
                        title="Emergency Logout"
                    >
                        <ShieldAlert className="w-4 h-4 transition-transform group-hover:scale-110" />
                    </button>
                </div>
            </div>
        </div>
    );
}
