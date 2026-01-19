import { SuperAdminGuard } from "@/components/guards/auth-guards";
import SidebarNav from "./_components/sidebar-nav";

export default function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SuperAdminGuard>
            <div className="flex min-h-screen bg-[#0D0D0F] text-[#F8F8F8]">
                {/* Sidebar */}
                <div className="w-64 border-r border-[#D4AF37]/10 bg-[#0D0D0F]">
                    <SidebarNav />
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <header className="h-16 border-b border-[#D4AF37]/10 flex items-center justify-between px-8 bg-[#0D0D0F]/80 backdrop-blur-md sticky top-0 z-10">
                        <div>
                            <h1 className="font-display text-sm uppercase tracking-widest text-[#D4AF37]">
                                Super Admin Terminal
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-xs font-bold text-[#F8F8F8]">Master Access</p>
                                <p className="text-[10px] text-[#D4AF37]/60">L1 AUTHORITY</p>
                            </div>
                            <div className="w-8 h-8 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 flex items-center justify-center">
                                <span className="text-[10px] text-[#D4AF37]">SA</span>
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 p-8">
                        {children}
                    </main>
                </div>
            </div>
        </SuperAdminGuard>
    );
}
