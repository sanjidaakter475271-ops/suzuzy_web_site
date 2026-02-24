import React, { useState, useEffect } from 'react';
import { TechnicianAPI } from '../services/api';
import { RequisitionGroup } from '../types';
import { TopBar } from '../components/TopBar';
import {
    Package,
    Clock,
    CheckCircle2,
    XCircle,
    RefreshCw,
    Search,
    Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Requisitions: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
    const [requisitions, setRequisitions] = useState<RequisitionGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchRequisitions = async () => {
        setLoading(true);
        try {
            const res = await TechnicianAPI.getPartsHistory();
            if (res.data.data) {
                setRequisitions(res.data.data);
            }
        } catch (err) {
            console.error("Error fetching requisitions:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequisitions();
    }, []);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <CheckCircle2 className="text-emerald-500" size={18} />;
            case 'rejected': return <XCircle className="text-rose-500" size={18} />;
            case 'issued': return <Package className="text-blue-500" size={18} />;
            default: return <Clock className="text-amber-500" size={18} />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'rejected': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
            case 'issued': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            default: return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
        }
    };

    const filteredRequisitions = requisitions.filter(req =>
        req.items?.some(item => item.part_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        req.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 pb-20">
            <TopBar onMenuClick={onMenuClick} title="Part Requisitions" />

            <div className="p-4 space-y-4">
                {/* Search & Filter */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search requisitions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                    </div>
                    <button className="bg-slate-900 border border-slate-800 p-3 rounded-2xl text-slate-400 hover:text-white transition-colors">
                        <Filter size={18} />
                    </button>
                </div>

                {/* List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                            <RefreshCw className="animate-spin text-blue-500 mb-4" size={32} />
                            <p className="text-slate-500 font-medium">Loading requisitions...</p>
                        </div>
                    ) : filteredRequisitions.length > 0 ? (
                        <AnimatePresence>
                            {filteredRequisitions.map((req, idx) => (
                                <motion.div
                                    key={req.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 hover:border-slate-700 transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center text-slate-500">
                                                <Package size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-100 uppercase text-xs tracking-wider">
                                                    REQ-{req.id.substring(0, 6)}
                                                </h3>
                                                <p className="text-[10px] text-slate-500 mt-0.5">
                                                    {new Date(req.created_at).toLocaleDateString(undefined, {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-tighter ${getStatusColor(req.status)}`}>
                                            {getStatusIcon(req.status)}
                                            {req.status}
                                        </div>
                                    </div>

                                    <div className="space-y-2.5">
                                        {req.items?.map((item, i) => (
                                            <div key={i} className="flex justify-between items-center text-sm py-2 border-t border-slate-800/50 first:border-t-0">
                                                <span className="text-slate-300 font-medium">{item.part_name}</span>
                                                <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[10px] font-bold text-slate-500">
                                                    Qty: {item.quantity}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
                            <Package className="text-slate-700 mb-4" size={48} />
                            <h3 className="text-slate-300 font-bold mb-1">No Requisitions Found</h3>
                            <p className="text-slate-500 text-sm max-w-[200px]">
                                You haven't submitted any part requisitions yet.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Refresh */}
            {!loading && (
                <button
                    onClick={fetchRequisitions}
                    className="fixed bottom-24 right-4 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-900/40 active:scale-95 transition-all text-white"
                >
                    <RefreshCw size={20} />
                </button>
            )}
        </div>
    );
};
