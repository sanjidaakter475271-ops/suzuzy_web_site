import React, { useState, useEffect } from 'react';
import { TechnicianAPI } from '../services/api';
import { JobCard, JobStatus } from '../types';
import { TopBar } from '../components/TopBar';
import { useNavigate } from 'react-router-dom';
import { RoutePath } from '../types';
import {
    Search,
    Filter,
    Clock,
    CheckCircle,
    AlertCircle,
    PauseCircle,
    ChevronRight,
    Loader2,
    Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { OfflineService } from '../services/offline';
import { SocketService } from '../services/socket';
import { WifiOff } from 'lucide-react';

export const MyJobs: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
    const [jobs, setJobs] = useState<JobCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const offlineService = OfflineService.getInstance();
    const [isOnline, setIsOnline] = useState(offlineService.getOnlineStatus());

    useEffect(() => {
        fetchJobs();

        // Setup network listener
        const interval = setInterval(() => {
            setIsOnline(offlineService.getOnlineStatus());
        }, 3000);

        // Listen for realtime updates
        const socket = SocketService.getInstance();
        const handleUpdate = () => {
            console.log("[REALTIME] Update received, refreshing job list...");
            fetchJobs();
        };

        socket.on('order:update', handleUpdate);

        return () => {
            clearInterval(interval);
            socket.off('order:update', handleUpdate);
        };
    }, []);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            if (!offlineService.getOnlineStatus()) {
                const cached = await offlineService.getCachedJobs();
                if (cached.length > 0) {
                    setJobs(cached);
                    setLoading(false);
                    return;
                }
            }

            const res = await TechnicianAPI.getJobs();
            setJobs(res.data.data);
            // Update cache
            await offlineService.cacheJobs(res.data.data);
        } catch (err) {
            console.error("Error fetching jobs:", err);
            // Fallback to cache on error
            const cached = await offlineService.getCachedJobs();
            if (cached.length > 0) setJobs(cached);
        } finally {
            setLoading(false);
        }
    };

    const filteredJobs = jobs.filter(job => {
        const matchesSearch =
            job.vehicle?.model_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.vehicle?.license_plate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.ticket?.ticket_number?.toLowerCase().includes(searchQuery.toLowerCase());

        if (activeTab === 'all') return matchesSearch;
        return matchesSearch && job.status === activeTab;
    });

    const getStatusInfo = (status: string) => {
        switch (status) {
            case JobStatus.COMPLETED:
                return { color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', icon: <CheckCircle size={14} /> };
            case JobStatus.IN_PROGRESS:
                return { color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', icon: <Clock size={14} /> };
            case JobStatus.PAUSED:
                return { color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', icon: <PauseCircle size={14} /> };
            default:
                return { color: 'text-slate-500 bg-slate-500/10 border-slate-500/20', icon: <AlertCircle size={14} /> };
        }
    };

    const tabs = [
        { id: 'all', label: 'All' },
        { id: JobStatus.PENDING, label: 'Pending' },
        { id: JobStatus.IN_PROGRESS, label: 'Active' },
        { id: JobStatus.COMPLETED, label: 'Done' }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 pb-20">
            <TopBar onMenuClick={onMenuClick} title="My Jobs" />

            {!isOnline && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center gap-2 justify-center"
                >
                    <WifiOff size={14} className="text-amber-500" />
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Offline Mode - Showing Cached Data</span>
                </motion.div>
            )}

            <div className="p-4 space-y-4">
                {/* Search & Filter */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search by model, plate, or ticket..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Tabs */}
                <div className="flex gap-2 p-1 bg-slate-900/50 rounded-xl border border-slate-800/50">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === tab.id
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                                : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="space-y-4 mt-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="animate-spin text-blue-500" size={32} />
                            <p className="text-slate-500 text-sm">Fetching your assignments...</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {filteredJobs.length > 0 ? (
                                filteredJobs.map((job, idx) => {
                                    const { color, icon } = getStatusInfo(job.status);
                                    return (
                                        <motion.div
                                            key={job.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: idx * 0.05 }}
                                            onClick={() => navigate(RoutePath.JOB_CARD.replace(':id', job.id))}
                                            className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl hover:border-slate-700 transition-all active:scale-[0.98] group"
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                                                        {job.ticket?.ticket_number || 'ST-0000'}
                                                    </span>
                                                    <h3 className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                                                        {job.vehicle?.model_name || 'Vehicle'}
                                                    </h3>
                                                </div>
                                                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase border ${color}`}>
                                                    {icon}
                                                    {job.status === 'in_progress' ? 'Active' : job.status}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="bg-slate-800 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-700">
                                                    {job.vehicle?.license_plate || 'N/A'}
                                                </span>
                                                <span className="text-[10px] text-slate-500">
                                                    {job.vehicle?.color || 'N/A'}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                                                        <span className="text-[10px] font-bold text-slate-400">
                                                            {job.vehicle?.customer_name?.charAt(0) || '?'}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-slate-400">
                                                        {job.vehicle?.customer_name || 'Anonymous'}
                                                    </span>
                                                </div>
                                                <ChevronRight size={16} className="text-slate-700 group-hover:text-slate-400 transition-colors" />
                                            </div>
                                        </motion.div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-20 space-y-4">
                                    <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto border border-slate-800">
                                        <Briefcase className="text-slate-700" size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-slate-300 font-bold">No Jobs Found</h3>
                                        <p className="text-slate-500 text-sm px-10">
                                            {searchQuery ? "No jobs match your search criteria." : "You don't have any jobs assigned to you yet."}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => { setSearchQuery(''); setActiveTab('all'); }}
                                        className="text-blue-500 text-sm font-bold"
                                    >
                                        Clear filters
                                    </button>
                                </div>
                            )}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
};
