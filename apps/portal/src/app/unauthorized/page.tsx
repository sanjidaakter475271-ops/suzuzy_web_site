"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { MetallicText } from "@/components/ui/premium/MetallicText";
import { GradientButton } from "@/components/ui/premium/GradientButton";

export default function UnauthorizedPage() {
    const router = useRouter();
    const [countdown, setCountdown] = useState(10);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    router.push('/login');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [router]);

    return (
        <div className="min-h-screen bg-[#0D0D0F] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#DC2626]/10 blur-[150px] rounded-full -mr-64 -mt-64" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#D4AF37]/5 blur-[150px] rounded-full -ml-64 -mb-64" />

            <div className="relative z-10 max-w-lg w-full text-center space-y-8">
                <div className="w-24 h-24 bg-[#DC2626]/10 rounded-full flex items-center justify-center mx-auto border border-[#DC2626]/20">
                    <ShieldAlert className="w-10 h-10 text-[#DC2626]" />
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl font-display font-black text-white italic">
                        ACCESS <MetallicText>DENIED</MetallicText>
                    </h1>
                    <p className="text-[#A1A1AA] text-lg font-medium">
                        Your security clearance does not permit access to this restricted terminal.
                    </p>
                </div>

                <div className="flex flex-col gap-4 pt-4">
                    <Link href="/login">
                        <GradientButton className="w-full h-14 uppercase tracking-widest font-black text-sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Log In Again
                        </GradientButton>
                    </Link>
                    <p className="text-xs text-[#A1A1AA]/50 font-mono">
                        Redirecting to secure login in <span className="text-[#D4AF37] font-bold">{countdown}s</span>...
                    </p>
                </div>

                <div className="pt-8 border-t border-white/5">
                    <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest">
                        Error Code: 403_FORBIDDEN
                    </p>
                </div>
            </div>
        </div>
    );
}
