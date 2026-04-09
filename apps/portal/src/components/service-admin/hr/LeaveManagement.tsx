'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FileText, UserCheck, UserX, 
    Calendar, AlertCircle, RefreshCw,
    Search, Filter, ChevronRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface LeaveRequest {
    id: string;
    staffId: string;
    technicianName: string;
    technicianEmail: string;
    technicianAvatar: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    hometown?: string;
    emergencyPhone?: string;
}

export const LeaveManagement: React.FC = () => {
    const { data: leaves, isLoading, refetch, isFetching } = useQuery({
        queryKey: ["workshop-leaves"],
        queryFn: async () => {
            const res = await axios.get("/api/v1/workshop/leave");
            return res.data.data as LeaveRequest[];
        }
    });

    const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
        try {
            const res = await axios.patch("/api/v1/workshop/leave", { id, status });
            if (res.data.success) {
                toast.success(`Leave request ${status} successfully`);
                refetch();
            }
        } catch (error) {
            toast.error("Failed to update leave status");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white dark:bg-[#0D0D0F] rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand/20 to-transparent" />
                
                <div className="p-8 border-b border-slate-50 dark:border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand border border-brand/20">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">
                                Leave <span className="text-brand">Applications</span>
                            </h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Technician absence request stream</p>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => refetch()}
                        className="rounded-xl border-slate-200 dark:border-slate-800 hover:border-brand/50"
                        disabled={isFetching}
                    >
                        <RefreshCw size={18} className={cn(isFetching && "animate-spin")} />
                    </Button>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/30 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Technician</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Leave Details</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Duration</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="py-32 text-center text-slate-500 italic">
                                        <RefreshCw size={40} className="animate-spin mx-auto mb-6 text-brand/20" />
                                        <p className="text-xs font-black uppercase tracking-[0.2em] opacity-40">Synchronizing Data Stream...</p>
                                    </td>
                                </tr>
                            ) : !leaves || leaves.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-32 text-center text-slate-500">
                                        <AlertCircle size={40} className="mx-auto mb-6 text-slate-200 dark:text-slate-800" />
                                        <p className="text-xs font-black uppercase tracking-[0.2em] opacity-40">No leave applications found</p>
                                    </td>
                                </tr>
                            ) : (
                                <AnimatePresence mode="popLayout">
                                    {leaves.map((leave, i) => (
                                        <motion.tr
                                            key={leave.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="border-b border-slate-50/50 dark:border-white/[0.02] hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-all duration-500 group"
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 overflow-hidden flex items-center justify-center font-black text-slate-400 border border-slate-200 dark:border-white/10 shadow-inner shrink-0">
                                                        {leave.technicianAvatar ? (
                                                            <img src={leave.technicianAvatar} alt={leave.technicianName} className="w-full h-full object-cover" />
                                                        ) : (
                                                            leave.technicianName.substring(0, 2).toUpperCase()
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="font-black text-slate-900 dark:text-white italic uppercase tracking-tight group-hover:text-brand transition-colors duration-500 truncate">{leave.technicianName}</h4>
                                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate">{leave.hometown || 'NO HOMETOWN DATA'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="space-y-1">
                                                    <span className="inline-flex px-2 py-0.5 rounded-md bg-brand/10 text-brand text-[10px] font-black uppercase tracking-widest border border-brand/20">
                                                        {leave.leaveType}
                                                    </span>
                                                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium line-clamp-1 group-hover:line-clamp-none transition-all duration-500 max-w-xs italic">{leave.reason}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-1 tabular-nums font-bold text-xs text-slate-700 dark:text-slate-300">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] uppercase tracking-tighter text-slate-400">Start</span>
                                                        <span>{format(new Date(leave.startDate), "MMM dd")}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] uppercase tracking-tighter text-slate-400">End</span>
                                                        <span>{format(new Date(leave.endDate), "MMM dd, yyyy")}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <Badge className={cn(
                                                    "text-[9px] font-black uppercase tracking-widest rounded-md border-0 py-1 px-3",
                                                    leave.status === 'approved' && "bg-emerald-500/10 text-emerald-500",
                                                    leave.status === 'rejected' && "bg-rose-500/10 text-rose-500",
                                                    leave.status === 'pending' && "bg-amber-500/10 text-amber-500",
                                                )}>
                                                    {leave.status}
                                                </Badge>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                {leave.status === 'pending' ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleUpdateStatus(leave.id, 'rejected')}
                                                            className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all duration-300 shadow-sm"
                                                        >
                                                            <UserX size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStatus(leave.id, 'approved')}
                                                            className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all duration-300 shadow-sm"
                                                        >
                                                            <UserCheck size={18} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-[0.2em] italic">Processed</span>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
