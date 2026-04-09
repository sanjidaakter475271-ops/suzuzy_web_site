"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AttendanceRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        // Automatically redirect to the unified Staff Hub
        const timer = setTimeout(() => {
            router.replace("/service-admin/workshop/technicians");
        }, 1500);
        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in fade-in duration-700">
            <div className="relative">
                <div className="absolute inset-0 bg-brand blur-[40px] opacity-20 animate-pulse" />
                <div className="w-20 h-20 rounded-3xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand relative z-10">
                    <RefreshCw size={40} className="animate-spin" />
                </div>
            </div>

            <div className="text-center space-y-2 relative z-10">
                <h1 className="text-2xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">
                    Consolidating <span className="text-brand">Workspace</span>
                </h1>
                <p className="text-slate-500 text-sm font-medium max-w-xs mx-auto">
                    We've merged Attendance and Staff management into a single unified Command Center.
                </p>
            </div>

            <Button
                onClick={() => router.push("/service-admin/workshop/technicians")}
                className="rounded-2xl bg-brand hover:bg-brand-dark text-white font-black text-xs uppercase tracking-widest px-8 h-12 shadow-lg shadow-brand/20"
            >
                Enter Staff Hub <ArrowRight size={16} className="ml-2" />
            </Button>

            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">
                Redirecting automatically...
            </p>
        </div>
    );
}
