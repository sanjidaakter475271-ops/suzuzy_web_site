"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import SidebarNav from "@/app/super-admin/_components/sidebar-nav";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function MobileNav() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    // Close sheet on route change
    useEffect(() => {
        if (open) {
            // Use setTimeout to avoid synchronous state update in effect warning
            const timer = setTimeout(() => setOpen(false), 0);
            return () => clearTimeout(timer);
        }
    }, [pathname, open]);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    className="mr-2 px-0 text-base hover:bg-transparent hover:text-white md:hidden"
                >
                    <Menu className="h-6 w-6 text-[#D4AF37]" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0 bg-[#0D0D0F] border-r border-[#D4AF37]/10 w-[300px] p-0">
                <div className="h-full overflow-y-auto">
                    <SidebarNav mode="mobile" />
                </div>
            </SheetContent>
        </Sheet>
    );
}
