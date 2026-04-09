'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWorkshopStore } from '@/stores/service-admin/workshopStore';
import Breadcrumb from '@/components/service-admin/Breadcrumb';
import { Button, Card, CardContent } from '@/components/service-admin/ui';
import JobCardTimeline from '@/components/service-admin/workshop/JobCardTimeline';
import { toast } from 'sonner';
import { confirmAction } from '@/lib/confirm';
import {
    User, Car, Phone, MapPin,
    ClipboardList, Wrench, ShieldCheck,
    Printer, Trash2, ArrowLeft, RefreshCcw,
    CheckCircle2, Clock, ClipboardCheck, Truck, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

const JobCardDetailPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const { jobCards, updateJobCardStatus, fetchWorkshopData, fetchJobById, deleteJobCard, addServiceTask, technicians, assignTechnician } = useWorkshopStore();
    const [showDeleteModal, setShowDeleteModal] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);

    const [showTaskModal, setShowTaskModal] = React.useState(false);
    const [taskDescription, setTaskDescription] = React.useState('');
    const [taskCost, setTaskCost] = React.useState(0);
    const [isAddingTask, setIsAddingTask] = React.useState(false);

    const [showAssignTechModal, setShowAssignTechModal] = React.useState(false);
    const [isAssigningTech, setIsAssigningTech] = React.useState(false);
    
    const job = jobCards.find(j => j.id === id);
    const [isFetchingDirect, setIsFetchingDirect] = React.useState(!job);

    React.useEffect(() => {
        if (!job && id) {
            fetchJobById(id as string).finally(() => setIsFetchingDirect(false));
        } else if (job) {
            setIsFetchingDirect(false);
        }
    }, [job, id, fetchJobById]);

    const handleAssignTechnician = async (techId: string) => {
        setIsAssigningTech(true);
        try {
            await assignTechnician(job!.id, techId);
            setShowAssignTechModal(false);
        } catch (error) {
            console.error('Failed to assign technician', error);
            toast.error("Assignment Failed", {
                description: "Could not assign technician to this job."
            });
        } finally {
            setIsAssigningTech(false);
        }
    };

    const [history, setHistory] = React.useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = React.useState(true);

    const fetchHistory = React.useCallback(async () => {
        if (!id) return;
        setIsLoadingHistory(true);
        try {
            const res = await fetch(`/api/v1/workshop/jobs/${id}/history`);
            if (res.ok) {
                const data = await res.json();
                setHistory(data.history || []);
            }
        } catch (error) {
            console.error('Failed to fetch history', error);
        } finally {
            setIsLoadingHistory(false);
        }
    }, [id]);

    React.useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const handleRefresh = async () => {
        await fetchWorkshopData();
        if (id) await fetchJobById(id as string);
    };

    if (isFetchingDirect) return (
        <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
            <RefreshCcw size={32} className="animate-spin text-brand" />
            <h2 className="text-xl font-bold uppercase tracking-widest text-ink-muted">Locating Job Card...</h2>
        </div>
    );

    if (!job) return (
        <div className="p-8 text-center space-y-4">
            <div className="w-20 h-20 bg-surface-card border border-surface-border rounded-full flex items-center justify-center mx-auto text-ink-muted/50 mb-6">
                <ShieldCheck size={40} />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">Job Card Not Found</h2>
            <p className="text-ink-muted">The job you are looking for does not exist or you do not have permission to view it.</p>
            <Button onClick={() => router.push('/service-admin/workshop/job-cards')} className="mt-8 px-8 rounded-full">Return to Directory</Button>
        </div>
    );

    const handleStatusUpdate = async (newStatus: any) => {
        await updateJobCardStatus(job.id, newStatus);
        fetchHistory(); // Refresh history after status update
    };

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAddingTask(true);
        try {
            await addServiceTask(job.id, taskDescription, taskCost);
            setShowTaskModal(false);
            setTaskDescription('');
            setTaskCost(0);
        } catch (error) {
            console.error('Failed to add task', error);
            toast.error("Task Error", {
                description: "Failed to add service item."
            });
        } finally {
            setIsAddingTask(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteJobCard(job.id);
            router.push('/service-admin/workshop/job-cards');
        } catch (error) {
            console.error('Failed to delete job card');
            toast.error("Deletion Failed", {
                description: "Failed to delete job card."
            });
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    return (
        <div className="p-6 lg:p-8 space-y-8 animate-fade">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            // If history is empty (e.g. direct link), go to list page
                            if (window.history.length <= 1) {
                                router.push('/service-admin/workshop/job-cards');
                            } else {
                                router.back();
                            }
                        }}
                        className="p-3 bg-surface-card dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-2xl text-ink-muted hover:text-brand transition-all"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <Breadcrumb items={[{ label: 'Workshop', href: '/service-admin/workshop/job-cards' }, { label: job.jobNo }]} />
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                        className="rounded-xl flex items-center gap-2"
                    >
                        <RefreshCcw size={18} /> Refresh
                    </Button>
                    <Button variant="outline" onClick={() => window.print()} className="rounded-xl flex items-center gap-2 print:hidden">
                        <Printer size={18} /> Print Job Card
                    </Button>
                    <Button variant="danger" onClick={() => setShowDeleteModal(true)} className="rounded-xl p-2.5 print:hidden">
                        <Trash2 size={18} />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Stats & Timeline */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Header Card */}
                    <Card className="rounded-[2.5rem] overflow-hidden">
                        <CardContent className="p-10 space-y-8">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand">Job Sequence</p>
                                        <div className="h-px w-8 bg-brand/30"></div>
                                    </div>
                                    <h1 className="text-4xl font-black text-ink-heading dark:text-white uppercase tracking-tighter">JOB #{job.jobNo}</h1>
                                    <p className="text-ink-muted font-bold mt-2 flex items-center gap-2">
                                        <RefreshCcw size={14} className="text-brand" />
                                        Last Update: {new Date(job.updatedAt).toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-6 bg-brand/5 border-2 border-brand/10 rounded-3xl text-right">
                                    <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-1">Estimated Bill</p>
                                    <p className="text-3xl font-black text-ink-heading dark:text-white">৳{job.total}</p>
                                </div>
                            </div>

                            <JobCardTimeline status={job.status} />

                            {/* Job History Feed */}
                            <div className="mt-8 pt-8 border-t border-surface-border dark:border-dark-border/50">
                                <h3 className="text-[10px] font-black uppercase text-brand tracking-widest mb-6">Status Log</h3>
                                {isLoadingHistory ? (
                                    <div className="flex items-center gap-2 text-ink-muted text-xs font-bold uppercase tracking-widest">
                                        <RefreshCcw size={12} className="animate-spin" /> Fetching Log...
                                    </div>
                                ) : history.length > 0 ? (
                                    <div className="space-y-0 relative before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-surface-border dark:before:bg-dark-border">
                                        {history.map((log, i) => (
                                            <div key={i} className="relative flex gap-4 pb-6 last:pb-0 group">
                                                <div className="w-6 h-6 rounded-full bg-surface-card dark:bg-dark-card border-2 border-brand flex-shrink-0 z-10 group-hover:scale-125 group-hover:bg-brand transition-all duration-300"></div>
                                                <div className="flex-1 -mt-1 -translate-y-1">
                                                    <p className="text-xs font-black text-ink-heading dark:text-white uppercase tracking-tight">
                                                        Changed to <span className="text-brand">{log.to_state.replace(/_/g, ' ')}</span>
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1 text-[10px] text-ink-muted uppercase tracking-widest font-bold">
                                                        <span className="flex items-center gap-1"><User size={10} /> {log.actor_name || 'System'}</span>
                                                        <span>•</span>
                                                        <span>{new Date(log.created_at).toLocaleString()}</span>
                                                    </div>
                                                    {log.notes && (
                                                        <div className="mt-2 p-3 bg-surface-page dark:bg-black/20 rounded-xl border border-surface-border dark:border-white/5 border-l-2 border-l-brand">
                                                            <p className="text-xs text-ink-muted font-bold">{log.notes}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 bg-surface-page/50 dark:bg-black/10 rounded-2xl border border-dashed border-surface-border dark:border-white/5 text-center">
                                        <p className="text-xs text-ink-muted font-bold uppercase tracking-widest">No history recorded.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Task List */}
                    <Card className="rounded-[2.5rem]">
                        <CardContent className="p-10 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black text-ink-heading dark:text-white uppercase flex items-center gap-3 tracking-tight">
                                    <Wrench size={24} className="text-brand" /> Service Items & Tasks
                                </h3>
                                <Button variant="secondary" onClick={() => setShowTaskModal(true)} className="rounded-xl text-xs">Add Task</Button>
                            </div>

                            <div className="space-y-4">
                                {job.items.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="p-5 bg-surface-page dark:bg-black/20 rounded-2xl border-2 border-surface-border dark:border-white/5 flex items-center justify-between group hover:border-brand/30 transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                                item.status === 'completed' ? "bg-emerald-500 border-emerald-500 text-white" : "border-ink-muted/30"
                                            )}>
                                                {item.status === 'completed' && <ShieldCheck size={14} />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-ink-heading dark:text-white">{item.description}</p>
                                                <p className="text-[10px] font-black uppercase text-ink-muted tracking-widest">{item.status}</p>
                                            </div>
                                        </div>
                                        <p className="font-black text-ink-heading dark:text-white">৳{item.cost}</p>
                                    </div>
                                ))}
                                {job.items.length === 0 && <p className="text-center py-6 text-ink-muted font-bold italic">No tasks assigned yet.</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Parts Requisitions */}
                    <Card className="rounded-[2.5rem]">
                        <CardContent className="p-10 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black text-ink-heading dark:text-white uppercase flex items-center gap-3 tracking-tight">
                                    <ClipboardList size={24} className="text-brand" /> Parts Requisitions
                                </h3>
                                <div className="px-3 py-1 bg-brand/10 text-brand rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                    <RefreshCcw size={12} className="animate-spin-slow" /> Pending Sync
                                </div>
                            </div>

                            <div className="space-y-4">
                                {job.requisitions?.map((req: any, idx) => (
                                    <div
                                        key={idx}
                                        className="p-5 bg-surface-page dark:bg-black/20 rounded-2xl border-2 border-surface-border dark:border-white/5 flex items-center justify-between group hover:border-brand/30 transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                                req.status === 'approved' ? "bg-emerald-500/10 text-emerald-600" :
                                                    req.status === 'rejected' ? "bg-red-500/10 text-red-600" :
                                                        "bg-amber-500/10 text-amber-600"
                                            )}>
                                                {req.status === 'approved' ? <ShieldCheck size={20} /> : <ClipboardList size={20} />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-ink-heading dark:text-white uppercase tracking-tight">{req.description}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] font-black uppercase text-ink-muted tracking-widest">Qty: {req.qty}</span>
                                                    <div className="w-1 h-1 rounded-full bg-ink-muted/30"></div>
                                                    <span className={cn(
                                                        "text-[10px] font-black uppercase tracking-widest",
                                                        req.status === 'approved' ? "text-emerald-600" :
                                                            req.status === 'rejected' ? "text-red-600" :
                                                                "text-amber-600"
                                                    )}>{req.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-ink-heading dark:text-white">৳{req.cost}</p>
                                            <p className="text-[9px] font-bold text-ink-muted uppercase mt-1">Total inclusive</p>
                                        </div>
                                    </div>
                                ))}
                                {(!job.requisitions || job.requisitions.length === 0) && (
                                    <div className="py-10 text-center space-y-3 bg-surface-page/50 dark:bg-black/10 rounded-3xl border-2 border-dashed border-surface-border dark:border-white/5">
                                        <div className="w-12 h-12 rounded-full bg-ink-muted/10 flex items-center justify-center mx-auto text-ink-muted">
                                            <ClipboardList size={24} />
                                        </div>
                                        <p className="text-ink-muted font-bold text-sm italic">No parts have been requested for this job.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Information Panes */}
                <div className="space-y-8">
                    {/* Customer Info */}
                    <Card className="rounded-[2.5rem] bg-brand text-white overflow-hidden shadow-xl shadow-brand/20">
                        <CardContent className="p-8 space-y-6 relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <User size={100} />
                            </div>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-80">Customer Profile</h3>
                            <div className="space-y-4 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-xl">
                                        {job.customerName?.charAt(0) || 'C'}
                                    </div>
                                    <div>
                                        <p className="font-black text-lg leading-none">{job.customerName}</p>
                                        <p className="text-[10px] font-bold opacity-70 mt-1 uppercase tracking-widest">LOYALTY MEMBER</p>
                                    </div>
                                </div>
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center gap-3 text-sm font-bold opacity-90 hover:opacity-100 transition-opacity cursor-pointer">
                                        <Phone size={16} /> {job.customerPhone}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-bold opacity-90 hover:opacity-100 transition-opacity cursor-pointer">
                                        <MapPin size={16} /> Dhaka, Bangladesh
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Vehicle Info */}
                    <Card className="rounded-[2.5rem] border-2 border-surface-border dark:border-dark-border">
                        <CardContent className="p-8 space-y-6">
                            <h3 className="text-[10px] font-black text-ink-muted uppercase tracking-[0.2em]">Vehicle Identity</h3>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-surface-page dark:bg-dark-page rounded-2xl text-brand border border-surface-border dark:border-dark-border">
                                        <Car size={32} />
                                    </div>
                                    <div>
                                        <p className="text-xl font-black text-ink-heading dark:text-white tracking-tighter">{job.vehicleModel}</p>
                                        <p className="text-xs font-bold text-ink-muted uppercase tracking-widest">{job.vehicleRegNo}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-surface-page dark:bg-dark-page rounded-2xl border border-dotted border-surface-border dark:border-dark-border">
                                        <p className="text-[10px] font-black text-ink-muted uppercase mb-1">Chassis</p>
                                        <p className="text-sm font-black text-ink-heading dark:text-white">{job.chassisNo || 'N/A'}</p>
                                    </div>
                                    <div className="p-4 bg-surface-page dark:bg-dark-page rounded-2xl border border-dotted border-surface-border dark:border-dark-border">
                                        <p className="text-[10px] font-black text-ink-muted uppercase mb-1">Ramp ID</p>
                                        <p className="text-sm font-black text-brand">{job.assignedRampId || 'WAITING'}</p>
                                    </div>
                                    <div className="col-span-2 p-4 bg-surface-page dark:bg-dark-page rounded-2xl border border-dotted border-surface-border dark:border-dark-border flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black text-ink-muted uppercase mb-1">Technician</p>
                                            <p className="text-sm font-black text-brand">
                                                {job.assignedTechnicianId
                                                    ? technicians.find(t => t.id === job.assignedTechnicianId)?.name || 'Unknown'
                                                    : 'UNASSIGNED'}
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowAssignTechModal(true)}
                                            className="text-xs py-1 h-8 rounded-lg"
                                        >
                                            Assign
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Status Update */}
                    <Card className="rounded-[2.5rem] border-2 border-surface-border dark:border-dark-border bg-white dark:bg-black/20 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                        <CardContent className="p-8 space-y-6 relative z-10">
                            <h3 className="text-[10px] font-black text-ink-muted uppercase tracking-[0.3em] flex items-center gap-3">
                                <Sparkles size={14} className="text-brand" /> Operational Status
                            </h3>
                            <div className="flex flex-col gap-3">
                                {[
                                    { id: 'diagnosed', label: 'Diagnosed', icon: Clock, baseColor: 'text-blue-500', baseBorder: 'border-blue-500/20 hover:border-blue-500/40' },
                                    { id: 'in_progress', label: 'In Progress', icon: Wrench, baseColor: 'text-amber-500', baseBorder: 'border-amber-500/20 hover:border-amber-500/40' },
                                    { id: 'qc_pending', label: 'QC Pending', icon: ClipboardCheck, baseColor: 'text-purple-500', baseBorder: 'border-purple-500/20 hover:border-purple-500/40' },
                                    { id: 'completed', label: 'Completed', icon: CheckCircle2, baseColor: 'text-emerald-500', baseBorder: 'border-emerald-500/20 hover:border-emerald-500/40' }
                                ].map((s) => {
                                    const isActive = job.status === s.id;
                                    const Icon = s.icon;
                                    return (
                                        <button
                                            key={s.id}
                                            onClick={() => handleStatusUpdate(s.id)}
                                            className={cn(
                                                "w-full p-4 rounded-[1.2rem] flex items-center justify-between transition-all duration-500 border-2 outline-none group/status",
                                                isActive 
                                                    ? "bg-surface-page dark:bg-[#0a0a0b] shadow-xl scale-[1.02]" 
                                                    : cn("bg-transparent hover:bg-surface-page dark:hover:bg-white/[0.02]", s.baseBorder)
                                            )}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500",
                                                    isActive ? cn("bg-brand text-white shadow-lg shadow-brand/20", s.id === 'completed' && "bg-emerald-500 shadow-emerald-500/20") : cn("bg-surface-page dark:bg-white/5", s.baseColor)
                                                )}>
                                                    <Icon size={18} strokeWidth={isActive ? 3 : 2} className={cn("transition-transform duration-500", isActive && "scale-110")} />
                                                </div>
                                                <span className={cn(
                                                    "text-[11px] font-black uppercase tracking-[0.2em] transition-colors duration-300",
                                                    isActive ? (s.id === 'completed' ? "text-emerald-500" : "text-brand") : "text-ink-muted group-hover/status:text-ink-heading dark:group-hover/status:text-white"
                                                )}>
                                                    {s.label}
                                                </span>
                                            </div>
                                            {isActive && (
                                                <div className={cn("w-2 h-2 rounded-full shadow-lg", s.id === 'completed' ? "bg-emerald-500 shadow-emerald-500/50" : "bg-brand shadow-brand/50")} />
                                            )}
                                        </button>
                                    );
                                })}

                                {/* Special Delivered Action Button */}
                                <div className="pt-4 mt-2 border-t border-surface-border dark:border-white/5">
                                    <button
                                        onClick={() => handleStatusUpdate('delivered')}
                                        disabled={job.status === 'delivered'}
                                        className={cn(
                                            "relative w-full py-5 rounded-[1.2rem] text-[11px] font-black uppercase tracking-[0.3em] overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-95 group/btn",
                                            job.status === 'delivered' 
                                                ? "bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 border-2 border-emerald-400 cursor-default" 
                                                : "text-white shadow-[0_15px_30px_-5px_rgba(234,179,8,0.4)] hover:shadow-[0_20px_40px_-5px_rgba(234,179,8,0.5)] border border-brand/50"
                                        )}
                                    >
                                        {job.status !== 'delivered' && (
                                            <>
                                                <div className="absolute inset-0 bg-gradient-to-r from-brand via-amber-400 to-brand bg-[length:200%_auto] animate-gradient" />
                                                <div className="absolute inset-0 bg-black/10 group-hover/btn:bg-transparent transition-colors duration-500" />
                                            </>
                                        )}
                                        
                                        <div className="relative z-10 flex items-center justify-center gap-3">
                                            {job.status === 'delivered' ? <CheckCircle2 size={18} strokeWidth={3} /> : <Truck size={18} strokeWidth={2.5} className="group-hover/btn:translate-x-1 transition-transform duration-500" />}
                                            <span>{job.status === 'delivered' ? 'Vehicle Delivered' : 'Mark as Delivered'}</span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm print:hidden">
                    <Card className="w-full max-w-sm rounded-[2rem] border-2 border-surface-border dark:border-dark-border bg-white dark:bg-dark-card shadow-2xl animate-fade-up">
                        <CardContent className="p-8 text-center space-y-6">
                            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-ink-heading dark:text-white uppercase tracking-tight mb-2">Delete Job Card?</h3>
                                <p className="text-sm font-bold text-slate-400">This action cannot be undone. All related data will be removed.</p>
                            </div>
                            <div className="flex flex-col gap-3">
                                <Button
                                    variant="danger"
                                    className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-xs"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-xs border-2"
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Add Task Modal */}
            {showTaskModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm print:hidden">
                    <Card className="w-full max-w-md rounded-[2rem] border-2 border-surface-border dark:border-dark-border bg-white dark:bg-dark-card shadow-2xl animate-fade-up">
                        <CardContent className="p-8 space-y-6">
                            <h3 className="text-xl font-black text-ink-heading dark:text-white uppercase tracking-tight">Add New Task</h3>
                            <form onSubmit={handleAddTask} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-ink-muted mb-2">Description</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-4 bg-surface-page dark:bg-black/20 rounded-2xl border-2 border-surface-border dark:border-white/5 outline-none focus:border-brand/30 transition-all font-bold text-ink-heading dark:text-white"
                                        placeholder="E.g. Brake Pad Replacement..."
                                        value={taskDescription}
                                        onChange={(e) => setTaskDescription(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-ink-muted mb-2">Cost (৳)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        className="w-full p-4 bg-surface-page dark:bg-black/20 rounded-2xl border-2 border-surface-border dark:border-white/5 outline-none focus:border-brand/30 transition-all font-bold text-ink-heading dark:text-white"
                                        placeholder="E.g. 500"
                                        value={taskCost}
                                        onChange={(e) => setTaskCost(Number(e.target.value))}
                                    />
                                </div>
                                <div className="flex flex-col gap-3 pt-4">
                                    <Button
                                        type="submit"
                                        className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-xs"
                                        disabled={isAddingTask}
                                    >
                                        {isAddingTask ? 'Adding...' : 'Add Task'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-xs border-2"
                                        onClick={() => setShowTaskModal(false)}
                                        disabled={isAddingTask}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Assign Tech Modal */}
            {showAssignTechModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm print:hidden">
                    <Card className="w-full max-w-md rounded-[2rem] border-2 border-surface-border dark:border-dark-border bg-white dark:bg-dark-card shadow-2xl animate-fade-up">
                        <CardContent className="p-8 space-y-6">
                            <h3 className="text-xl font-black text-ink-heading dark:text-white uppercase tracking-tight">Assign Technician</h3>
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                                {technicians.filter(t => t.status === 'active').map((tech) => (
                                    <div
                                        key={tech.id}
                                        className="p-4 bg-surface-page dark:bg-black/20 rounded-2xl border border-surface-border dark:border-white/5 flex items-center justify-between group hover:border-brand/40 transition-all cursor-pointer"
                                        onClick={() => handleAssignTechnician(tech.id)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center font-black">
                                                {tech.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-black text-ink-heading dark:text-white">{tech.name}</p>
                                                <p className="text-[10px] font-black uppercase text-ink-muted tracking-widest">{tech.activeJobs} Jobs Active</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {technicians.filter(t => t.status === 'active').length === 0 && (
                                    <div className="py-10 text-center space-y-2">
                                        <p className="text-ink-muted font-bold">No active technicians available.</p>
                                    </div>
                                )}
                            </div>
                            <Button
                                variant="outline"
                                className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-xs border-2 mt-4"
                                onClick={() => setShowAssignTechModal(false)}
                            >
                                Cancel
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default JobCardDetailPage;
