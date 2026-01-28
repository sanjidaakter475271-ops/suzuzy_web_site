"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthGuard } from "@/components/guards/auth-guards";
import { Shield, Smartphone, Globe, Clock, XCircle, LogOut } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Session {
    id: string;
    device_name: string | null;
    ip_address: string | null;
    last_active: string;
    created_at: string;
    login_method: string;
}

export default function SessionsPage() {
    const queryClient = useQueryClient();

    const { data: sessions, isLoading } = useQuery<{ sessions: Session[] }>({
        queryKey: ["user-sessions"],
        queryFn: async () => {
            const res = await fetch("/api/auth/sessions");
            if (!res.ok) throw new Error("Failed to fetch sessions");
            return res.json();
        },
    });

    const revokeMutation = useMutation({
        mutationFn: async (sessionId: string) => {
            const res = await fetch(`/api/auth/sessions/${sessionId}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to revoke session");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-sessions"] });
            toast.success("Session revoked successfully");
        },
        onError: (err: any) => {
            toast.error(err.message || "Error revoking session");
        },
    });

    const revokeAllMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/auth/logout-all", {
                method: "POST",
            });
            if (!res.ok) throw new Error("Failed to revoke all sessions");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-sessions"] });
            toast.success("All other sessions revoked");
        },
    });

    return (
        <AuthGuard>
            <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-[#F8F8F8] mb-2 tracking-tight">
                            Security Protocol <span className="text-[#D4AF37]">Sessions</span>
                        </h1>
                        <p className="text-white/40 text-sm">
                            Manage authorized devices and access points for your account.
                        </p>
                    </div>
                    <button
                        onClick={() => revokeAllMutation.mutate()}
                        disabled={revokeAllMutation.isPending || !sessions?.sessions || sessions.sessions.length <= 1}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all text-xs font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <LogOut className="w-4 h-4" />
                        Terminate All Other
                    </button>
                </div>

                <div className="grid gap-6">
                    <AnimatePresence mode="popLayout">
                        {isLoading ? (
                            Array(3).fill(0).map((_, i) => (
                                <div key={i} className="h-32 rounded-2xl border border-white/5 bg-white/[0.02] animate-pulse" />
                            ))
                        ) : sessions?.sessions.map((session, index) => (
                            <motion.div
                                key={session.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-[#D4AF37]/20 transition-all p-6"
                            >
                                <div className="flex items-start gap-6">
                                    <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20 group-hover:scale-110 transition-transform">
                                        {session.device_name?.toLowerCase().includes('mobile') ? (
                                            <Smartphone className="w-6 h-6 text-[#D4AF37]" />
                                        ) : (
                                            <Shield className="w-6 h-6 text-[#D4AF37]" />
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-bold text-[#F8F8F8]">
                                                {session.device_name || "Unknown Device"}
                                                {index === 0 && (
                                                    <span className="ml-3 px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] text-[10px] uppercase font-black tracking-widest">
                                                        Current Session
                                                    </span>
                                                )}
                                            </h3>
                                            {index !== 0 && (
                                                <button
                                                    onClick={() => revokeMutation.mutate(session.id)}
                                                    disabled={revokeMutation.isPending}
                                                    className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-500 transition-all"
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                                            <div className="flex items-center gap-2 text-white/40">
                                                <Globe className="w-3.5 h-3.5" />
                                                IP: {session.ip_address || "Unknown"}
                                            </div>
                                            <div className="flex items-center gap-2 text-white/40">
                                                <Clock className="w-3.5 h-3.5" />
                                                Last Active: {formatDistanceToNow(new Date(session.last_active))} ago
                                            </div>
                                            <div className="flex items-center gap-2 text-white/40">
                                                <Shield className="w-3.5 h-3.5" />
                                                Method: {session.login_method.toUpperCase()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {!isLoading && sessions?.sessions.length === 0 && (
                        <div className="text-center py-12 rounded-2xl border border-dashed border-white/10">
                            <p className="text-white/40">No active sessions found.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthGuard>
    );
}
