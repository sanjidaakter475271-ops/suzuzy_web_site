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
                const res = await TechnicianAPI.getJobs();
                // Filter only completed jobs for history
                const completed = res.data.data.filter((j: JobCard) => j.status === JobStatus.COMPLETED);
                setJobs(completed);
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

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 pb-20">
            <TopBar onMenuClick={onMenuClick} title="Work History" />

            <div className="p-4 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search ticket or model..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Performance Summary Banner */}
                <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-900/40">
                            <History size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-emerald-500 font-bold uppercase tracking-wider leading-tight">Total Experience</p>
                            <p className="text-xl font-black text-white">{jobs.length} <span className="text-sm font-normal text-slate-400 font-sans">Jobs Done</span></p>
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="space-y-3 mt-4">
                    {loading ? (
                        <div className="flex justify-center py-20"><History className="animate-spin text-blue-500 opacity-20" size={40} /></div>
                    ) : filteredJobs.length > 0 ? (
                        filteredJobs.map((job, i) => (
                            <motion.div
                                key={job.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => navigate(RoutePath.JOB_CARD.replace(':id', job.id))}
                                className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl hover:border-slate-700 transition-all flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center text-slate-600 group-hover:text-blue-500 transition-colors">
                                        <Briefcase size={20} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-mono font-bold text-slate-500">{job.ticket?.ticket_number}</span>
                                            <span className="w-1 h-1 bg-slate-700 rounded-full" />
                                            <span className="text-[10px] text-slate-500">{new Date().toLocaleDateString()}</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-100 group-hover:text-blue-400 transition-colors">{job.vehicle?.model_name || 'Service Job'}</h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
                                                <CheckCircle2 size={10} /> Completed
                                            </span>
                                            <span className="flex items-center gap-1 text-[10px] text-slate-500">
                                                <Timer size={10} /> 2h 15m
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight size={18} className="text-slate-700 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-20 opacity-30 flex flex-col items-center">
                            <Briefcase size={48} className="mb-2" />
                            <p>No completed jobs found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
