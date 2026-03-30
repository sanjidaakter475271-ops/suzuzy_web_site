import React, { useState, useEffect } from 'react';
import { TechnicianAPI } from '../services/api';
import { JobCard, JobStatus, RoutePath } from '../types';
import { TopBar } from '../components/TopBar';
import { useNavigate, useLocation } from 'react-router-dom';
import { WifiOff, Search, Clock, CheckCircle, AlertCircle, PauseCircle, ChevronRight, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { OfflineService } from '../services/offline';
import { SocketService } from '../services/socket';
import { JobCardSkeleton } from '../components/Skeleton';
import { Network } from '@capacitor/network';

const MyJobCard = React.memo(({ job, onClick, color, icon, label, isInitialMount }: {
    job: JobCard;
    onClick: (id: string) => void;
    color: string;
    icon: React.ReactNode;
    label: string;
    isInitialMount: boolean;
}) => (
    <motion.div
        layout
        initial={isInitialMount ? { opacity: 0, y: 20 } : false}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        onClick={() => onClick(job.id)}
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
                {label}
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
), (prev, next) => prev.job.id === next.job.id && prev.job.status === next.job.status && prev.job.vehicle?.model_name === next.job.vehicle?.model_name);
MyJobCard.displayName = 'MyJobCard';

export const MyJobs: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
    const [jobs, setJobs] = useState<JobCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const offlineService = OfflineService.getInstance();
    const [isOnline, setIsOnline] = useState(offlineService.getOnlineStatus());
    const fetchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    const isInitialMount = React.useRef(true);

    useEffect(() => {
        if (location.state?.status) {
            setActiveTab(location.state.status);
            // Clear state after reading to prevent sticky filter
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location]);

    const fetchJobs = React.useCallback(async () => {
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
            isInitialMount.current = false;
        }
    }, []);

    useEffect(() => {
        fetchJobs();

        // Setup network listener (event-based)
        const setupNetwork = async () => {
            const listener = await Network.addListener('networkStatusChange', (status) => {
                setIsOnline(status.connected);
            });
            return listener;
        };
        const networkListener = setupNetwork();

        // Listen for realtime updates
        const socket = SocketService.getInstance();
        const handleUpdate = () => {
            console.log("[REALTIME] Update received, refreshing job list...");
            if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
            fetchTimeoutRef.current = setTimeout(() => {
                fetchJobs();
            }, 300);
        };

        socket.on('order:update', handleUpdate);
        socket.on('job_cards:changed', handleUpdate);
        socket.on('inventory:changed', handleUpdate);

        return () => {
            networkListener.then(l => l.remove());
            if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
            socket.off('order:update', handleUpdate);
            socket.off('job_cards:changed', handleUpdate);
            socket.off('inventory:changed', handleUpdate);
        };
    }, [fetchJobs]);

    // Search Debouncing
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const filteredJobs = React.useMemo(() => {
        return jobs.filter(job => {
            const matchesSearch =
                job.vehicle?.model_name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                job.vehicle?.license_plate?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                job.ticket?.ticket_number?.toLowerCase().includes(debouncedSearchQuery.toLowerCase());

            if (activeTab === 'all') return matchesSearch;
            return matchesSearch && job.status === activeTab;
        });
    }, [jobs, debouncedSearchQuery, activeTab]);

    const getStatusInfo = React.useCallback((status: string) => {
        const prettyStatus = status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

        switch (status) {
            case JobStatus.COMPLETED:
            case JobStatus.VERIFIED:
            case JobStatus.QC_PASSED:
                return {
                    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.05)]',
                    icon: <CheckCircle size={14} />,
                    label: status === JobStatus.COMPLETED ? 'Done' : prettyStatus
                };
            case JobStatus.IN_PROGRESS:
                return {
                    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-[0_0_12px_rgba(59,130,246,0.1)]',
                    icon: <Clock size={14} />,
                    label: 'Active'
                };
            case JobStatus.PAUSED:
                return {
                    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                    icon: <PauseCircle size={14} />,
                    label: 'Paused'
                };
            case JobStatus.PENDING:
                return {
                    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.1)]',
                    icon: <AlertCircle size={14} className="animate-pulse text-amber-500" />,
                    label: 'Pending'
                };
            case JobStatus.QC_PENDING:
                return {
                    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.1)]',
                    icon: <AlertCircle size={14} className="animate-pulse text-amber-500" />,
                    label: 'QC Pending'
                };
            case JobStatus.QC_FAILED:
                return {
                    color: 'text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-[0_0_12px_rgba(244,63,94,0.1)]',
                    icon: <AlertCircle size={14} />,
                    label: 'QC Failed'
                };
            default:
                return {
                    color: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
                    icon: <AlertCircle size={14} />,
                    label: prettyStatus
                };
        }
    }, []);

    const tabs = [
        { id: 'all', label: 'All' },
        { id: JobStatus.PENDING, label: 'Pending' },
        { id: JobStatus.IN_PROGRESS, label: 'Active' },
        { id: JobStatus.COMPLETED, label: 'Done' }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 pb-20">
            <TopBar
                onMenuClick={onMenuClick}
                onBack={() => navigate(RoutePath.DASHBOARD)}
                breadcrumbs={[{ label: 'My Jobs' }]}
            />

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
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map(i => <JobCardSkeleton key={i} />)}
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {filteredJobs.length > 0 ? (
                                filteredJobs.map((job, idx) => {
                                    const { color, icon, label } = getStatusInfo(job.status);
                                    return (
                                        <MyJobCard
                                            key={job.id}
                                            job={job}
                                            color={color}
                                            icon={icon}
                                            label={label}
                                            isInitialMount={isInitialMount.current}
                                            onClick={(id) => navigate(RoutePath.JOB_CARD.replace(':id', id))}
                                        />
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
