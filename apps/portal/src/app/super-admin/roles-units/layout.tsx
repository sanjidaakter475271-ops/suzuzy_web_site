"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, ShieldCheck } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { cn } from "@/lib/utils";

export default function RolesUnitsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { profile } = useUser();

    // Secondary Navigation for this section
    const NAV_ITEMS = [
        {
            name: "Business Units",
            href: "/super-admin/roles-units/business-units",
            icon: Building2,
            description: "Manage specific business divisions"
        },
        {
            name: "Role & Privileges",
            href: "/super-admin/roles-units/roles",
            icon: ShieldCheck,
            description: "Configure role hierarchies"
        },
        {
            name: "System Permissions",
            href: "/super-admin/roles-units/permissions",
            icon: ShieldCheck,
            description: "Manage clearance registry"
        },
    ];

    return (
        <div className="space-y-8 pb-20">
            {/* Section Header */}
            <div>
                <h2 className="text-4xl font-display font-black italic tracking-tight text-[#F8F8F8]">
                    ROLE & <span className="text-[#D4AF37]">UNIT MANAGEMENT</span>
                </h2>
                <p className="text-[#A1A1AA] text-sm font-medium tracking-wide mt-2">
                    System-wide configuration for business units and role-based access control (RBAC).
                </p>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="flex flex-wrap gap-4 border-b border-[#D4AF37]/10 pb-1">
                {NAV_ITEMS.map((item) => {
                    // Check if active (exact match or proper subdirectory)
                    const isActive = pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "group relative px-6 py-4 rounded-t-2xl border-b-2 transition-all flex items-center gap-3 overflow-hidden",
                                isActive
                                    ? "bg-[#D4AF37]/5 border-[#D4AF37] text-[#D4AF37]"
                                    : "border-transparent text-[#A1A1AA] hover:text-[#F8F8F8] hover:bg-white/5"
                            )}
                        >
                            <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                isActive ? "bg-[#D4AF37]/20 text-[#D4AF37]" : "bg-white/5 text-[#A1A1AA] group-hover:text-[#F8F8F8]"
                            )}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-black uppercase tracking-widest leading-tight">
                                    {item.name}
                                </span>
                                <span className={cn("text-[9px] font-medium leading-tight mt-0.5 opacity-60", isActive ? "text-[#D4AF37]" : "text-[#A1A1AA]")}>
                                    {item.description}
                                </span>
                            </div>

                            {/* Active indicator glow */}
                            {isActive && (
                                <div className="absolute inset-0 bg-gradient-to-t from-[#D4AF37]/10 to-transparent pointer-events-none" />
                            )}
                        </Link>
                    );
                })}
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {children}
            </div>
        </div>
    );
}
