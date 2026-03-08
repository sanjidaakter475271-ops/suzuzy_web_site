import React, { useState, useEffect } from 'react';
import { TechnicianAPI } from '../services/api';
import { JobCard, JobStatus } from '../types';
import { TopBar } from '../components/TopBar';
import { useNavigate } from 'react-router-dom';
import { RoutePath } from '../types';
import {
    Calendar,
    Search,
    ChevronRight,
    CheckCircle2,
    DollarSign,
    Timer,
    Wrench,
    Briefcase,
    History,
    Filter
} from 'lucide-react';
import { motion } from 'framer-motion';

export const WorkHistory: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
    const [jobs, setJobs] = useState<JobCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // Fetch completed jobs directly
                const res = await TechnicianAPI.getJobs({
                    status: JobStatus.COMPLETED,
                    limit: 50
                });

                if (res.data.success) {
                    setJobs(res.data.data);
                }
            } catch (err) {
                console.error("Error fetching history:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const filteredJobs = jobs.filter(job =>
        job.vehicle?.model_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.ticket?.ticket_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 pb-20">
            <TopBar
                onMenuClick={onMenuClick}
                onBack={() => navigate(RoutePath.PROFILE)}
                breadcrumbs={[
                    { label: 'Profile', path: RoutePath.PROFILE },
                    { label: 'Work History' }
                ]}
            />

            <div className="p-4 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/5 blur-xl rounded-2xl" />
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search ticket or vehicle model..."
                            className="w-full bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-blue-500/50 text-white placeholder:text-slate-600 shadow-inner"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Performance Summary Banner */}
                <div className="bg-gradient-to-br from-indigo-600/20 via-blue-600/10 to-transparent border border-white/5 rounded-[2rem] p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-16 translate-x-16" />
                    <div className="flex items-center gap-5 relative">
                        <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-500 text-white rounded-[1.2rem] flex items-center justify-center shadow-2xl shadow-blue-900/40 border border-white/10 group-hover:scale-110 transition-transform duration-500">
                            <History size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-[10px] text-blue-400 font-extrabold uppercase tracking-[0.2em] leading-tight mb-1">Lifetime Experience</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-black text-white tracking-tighter italic">{jobs.length}</p>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Completed Jobs</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="space-y-4 mt-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Execution Logs</h3>
                        <Filter size={14} className="text-slate-600" />
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse" />
                                <History className="animate-spin text-blue-500 relative z-10" size={40} strokeWidth={2.5} />
                            </div>
                            <p className="text-[10px] font-black text-blue-500/50 uppercase tracking-[0.2em]">Synchronizing Archive...</p>
                        </div>
                    ) : filteredJobs.length > 0 ? (
                        filteredJobs.map((job, i) => (
                            <motion.div
                                key={job.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => navigate(RoutePath.JOB_CARD.replace(':id', job.id))}
                                className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-5 rounded-[1.8rem] hover:border-blue-500/30 transition-all duration-500 flex items-center justify-between group shadow-xl active:scale-[0.98] active:bg-blue-500/5 overflow-hidden relative"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:to-blue-500/5 transition-all duration-700" />

                                <div className="flex items-center gap-5 relative z-10">
                                    <div className="w-14 h-14 bg-slate-950 rounded-[1.2rem] border border-white/5 flex items-center justify-center text-slate-700 group-hover:text-blue-400 group-hover:border-blue-500/20 transition-all duration-500 shadow-inner overflow-hidden relative">
                                        <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors" />
                                        <Briefcase size={22} strokeWidth={2} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-mono font-bold text-blue-500/70 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/10">{job.ticket?.ticket_number}</span>
                                            <span className="w-1 h-1 bg-slate-700 rounded-full" />
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{formatDate(job.service_end_time || job.created_at)}</span>
                                        </div>
                                        <h4 className="text-base font-black text-white tracking-tight group-hover:text-blue-200 transition-colors">{job.vehicle?.model_name || 'General Service'}</h4>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="flex items-center gap-1.5 text-[9px] text-emerald-500 font-black uppercase tracking-widest bg-emerald-500/5 px-2.5 py-1 rounded-full border border-emerald-500/10">
                                                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" /> Verified
                                            </span>
                                            <span className="flex items-center gap-1.5 text-[9px] text-slate-500 font-black uppercase tracking-widest">
                                                <Timer size={12} className="text-slate-700" /> {job.tasks?.length || 0} Tasks
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="relative z-10 flex flex-col items-end gap-2">
                                    <div className="p-2 bg-slate-950 rounded-full border border-white/5 text-slate-700 group-hover:text-blue-400 group-hover:translate-x-1 transition-all">
                                        <ChevronRight size={18} />
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-32 opacity-30 flex flex-col items-center gap-6">
                            <div className="w-24 h-24 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                                <Briefcase size={40} className="text-slate-700" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Records Found</p>
                                <p className="text-xs text-slate-500">Completed jobs will appear here.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
