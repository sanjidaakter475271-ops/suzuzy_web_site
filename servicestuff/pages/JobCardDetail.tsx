import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    Plus,
    Trash2,
    CheckCircle2,
    Package,
    Info,
    Clock,
    User as UserIcon,
    Tag,
    Camera,
    FileText,
    ListChecks,
    AlertTriangle,
    PlayCircle,
    PauseCircle,
    CheckSquare,
    Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase'; // Keeping for public/read-only inventory
import { TechnicianAPI } from '../services/api';
import { JobCard, RoutePath, ChecklistItem, ServiceCondition, PartsRequest } from '../types';
import { TopBar } from '../components/TopBar';
import { PartsSelectionModal } from '../components/PartsSelectionModal';
import { OfflineService } from '../services/offline';
import { LocationService } from '../services/location';
import { MediaService } from '../services/media';
import { SocketService } from '../services/socket';
import { WifiOff, Cloud, ImageIcon } from 'lucide-react';
import { DetailSkeleton } from '../components/Skeleton';

type Tab = 'summary' | 'checklist' | 'parts' | 'photos' | 'notes';

export const JobCardDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [job, setJob] = useState<JobCard | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('summary');
    const offlineService = OfflineService.getInstance();
    const [isOnline, setIsOnline] = useState(offlineService.getOnlineStatus());

    // Parts State
    const [showPartsSelector, setShowPartsSelector] = useState(false);
    const [requisitions, setRequisitions] = useState<PartsRequest[]>([]);
    const [adjustingPart, setAdjustingPart] = useState<any>(null); // Requisition object
    const [productForAdjustment, setProductForAdjustment] = useState<any>(null);
    const [updatingPart, setUpdatingPart] = useState(false);

    // Note State
    const [newNote, setNewNote] = useState('');
    const syncTimeout = useRef<any>(null);

    useEffect(() => {
        if (id) {
            fetchJobDetails();
            fetchRequisitions();
        }

        // Listen for realtime updates
        const socket = SocketService.getInstance();
        const handleUpdate = (data: any) => {
            // Only refresh if the update is for THIS job card
            if (data?.jobId === id || data?.id === id || !data?.id) {
                console.log("[REALTIME] Update received for this job, refreshing...");
                fetchJobDetails();
            }
        };

        socket.on('order:update', handleUpdate);
        socket.on('job_cards:changed', handleUpdate);
        socket.on('requisition:created', () => fetchRequisitions());
        socket.on('requisition:approved', () => fetchRequisitions());
        socket.on('requisition:rejected', () => fetchRequisitions());

        return () => {
            socket.off('order:update', handleUpdate);
            socket.off('job_cards:changed', handleUpdate);
            socket.off('requisition:created');
            socket.off('requisition:approved');
            socket.off('requisition:rejected');
        };
    }, [id]);

    const fetchJobDetails = async () => {
        setLoading(true);
        try {
            if (!id) return;

            if (!offlineService.getOnlineStatus()) {
                const cached = await offlineService.getCachedJobDetail(id);
                if (cached) {
                    setJob(cached);
                    setLoading(false);
                    return;
                }
            }

            const res = await TechnicianAPI.getJobDetail(id);
            const jobData = res.data.data;

            // Ensure tasks and checklist are arrays and formatted
            const sanitizedJob = {
                ...jobData,
                tasks: jobData.tasks || [],
                checklist: (jobData.checklist || jobData.service_checklist_items || []).map((i: any) => ({
                    id: i.id,
                    name: i.name,
                    category: i.category,
                    is_completed: i.is_completed || false,
                    condition: i.condition || 'na',
                    photo_url: i.photo_url || i.photoUrl
                })),
                photos: jobData.photos || jobData.job_photos || []
            };

            setJob(sanitizedJob);
            await offlineService.cacheJobDetail(id, sanitizedJob);
        } catch (err) {
            console.error("Error fetching job:", err);
            // Fallback
            if (id) {
                const cached = await offlineService.getCachedJobDetail(id);
                if (cached) setJob(cached);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchRequisitions = async () => {
        if (!id) return;
        try {
            const res = await TechnicianAPI.getPartsHistory();
            if (res.data?.data) {
                // Flatten items from all groups for this job
                const allItems = res.data.data
                    .filter((g: any) => g.job_card_id === id)
                    .flatMap((g: any) => g.items || []);
                setRequisitions(allItems);
            }
        } catch (err) {
            console.error('Error fetching requisitions:', err);
        }
    };

    const handleStatusUpdate = async (newStatus: string) => {
        if (!job) return;
        const prevStatus = job.status;
        let location = null;

        // Optimistic Update
        setJob({ ...job, status: newStatus as any });

        try {
            try {
                location = await LocationService.getInstance().getCurrentLocation();
            } catch (le) {
                console.warn("Location fetch failed, continuing without it");
            }

            if (newStatus === 'completed') {
                if (!isOnline) {
                    await offlineService.queueAction('update_status', { jobId: job.id, status: 'completed' });
                    navigate(RoutePath.DASHBOARD);
                    return;
                }
                await TechnicianAPI.updateJobStatus(job.id, 'completed', location);
                navigate(RoutePath.DASHBOARD);
                return;
            }

            if (!isOnline) {
                await offlineService.queueAction('update_status', { jobId: job.id, status: newStatus });
                return;
            }

            await TechnicianAPI.updateJobStatus(job.id, newStatus, location);
            fetchJobDetails();
        } catch (err) {
            setJob({ ...job, status: prevStatus });
            console.error("Error updating status:", err);
            alert("Failed to update status");
        }
    };

    const handlePartsSuccess = () => {
        fetchJobDetails();
    };

    const handleChecklistUpdate = async (itemId: string, completed: boolean, condition: ServiceCondition, photoUrl?: string) => {
        if (!job) return;

        // Optimistic Update
        const updatedChecklist = job.checklist?.map(c =>
            c.id === itemId ? { ...c, condition, is_completed: completed, photo_url: photoUrl } : c
        );
        setJob({ ...job, checklist: updatedChecklist });

        try {
            if (!isOnline) {
                await offlineService.queueAction('update_checklist', { jobId: job.id, itemId, condition, completed, photoUrl });
                return;
            }

            await TechnicianAPI.updateChecklist(job.id, [{
                id: itemId,
                condition: condition,
                completed: completed,
                photoUrl: photoUrl
            }]);
            fetchJobDetails();
        } catch (error) {
            console.error("Failed to update checklist item:", error);
            fetchJobDetails();
        }
    };

    const handleChecklistToggle = async (item: ChecklistItem) => {
        if (!job) return;
        const newStatus = !item.is_completed;

        // Optimistic Update
        const updatedChecklist = job.checklist?.map(c =>
            c.id === item.id ? { ...c, is_completed: newStatus } : c
        );
        setJob({ ...job, checklist: updatedChecklist });

        try {
            await handleChecklistUpdate(item.id, newStatus, item.condition, (item as any).photo_url);
        } catch (err) {
            console.error("Checklist toggle failed", err);
            fetchJobDetails();
        }
    };

    const handleChecklistPhoto = async (item: ChecklistItem) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e: any) => {
            const file = e.target.files?.[0];
            if (!file) return;

            setLoading(true);
            try {
                const url = await MediaService.uploadImage(file, 'service-docs', `checklist/${job?.id}`);
                await handleChecklistUpdate(item.id, true, item.condition, url);
            } catch (err) {
                console.error("Checklist photo upload failed:", err);
                alert("Photo upload failed");
            } finally {
                setLoading(false);
            }
        };
        input.click();
    };

    const handleAddNote = async () => {
        if (!job || !newNote.trim()) return;
        try {
            if (!isOnline) {
                await offlineService.queueAction('add_note', { jobId: job.id, note: newNote });
                setNewNote('');
                return;
            }
            await TechnicianAPI.addNote(job.id, newNote);
            setNewNote('');
            fetchJobDetails();
        } catch (err) {
            console.error("Error adding note:", err);
        }
    };

    const handleAIAnalysis = async (photoId: string) => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/ai/diagnostics`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ photoId })
            });
            fetchJobDetails();
        } catch (error) {
            console.error(error);
        }
    };

    const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!job || !event.target.files || event.target.files.length === 0) return;
        setLoading(true);
        try {
            const file = event.target.files[0];
            const publicUrl = await MediaService.uploadImage(file, 'service-docs', `jobs/${job.id}`);
            await TechnicianAPI.uploadPhoto(job.id, {
                url: publicUrl,
                tag: 'during',
                caption: `Uploaded from technician app`
            });
            fetchJobDetails();
        } catch (err) {
            console.error("Error uploading photo:", err);
            alert("Failed to upload photo");
        } finally {
            setLoading(false);
        }
    };

    const handleRequestQC = async () => {
        if (!job) return;
        try {
            await TechnicianAPI.requestQC(job.id, "Technician self-requested QC");
            fetchJobDetails();
            setActiveTab('summary');
        } catch (err) {
            console.error("Error requesting QC:", err);
        }
    };

    const handleOpenQuickAdjust = async (req: any) => {
        setAdjustingPart(req);
        setProductForAdjustment(null);
        try {
            const res = await TechnicianAPI.getProductDetail(req.product_id);
            if (res.data?.success) {
                setProductForAdjustment(res.data.data);
            }
        } catch (err) {
            console.error("Error fetching product detail:", err);
        }
    };

    const handleUpdateQuantity = (newQty: number) => {
        if (!adjustingPart) return;

        // 1. Instant UI update for the modal
        const updatedPart = { ...adjustingPart, quantity: Math.max(0, newQty) };
        setAdjustingPart(updatedPart);

        // 2. Optimistic update for the main list
        setRequisitions(prev => prev.map(r => r.id === adjustingPart.id ? { ...r, quantity: Math.max(0, newQty) } : r));

        // 3. Clear existing sync timeout
        if (syncTimeout.current) clearTimeout(syncTimeout.current);

        // 4. Set new sync timeout (500ms) to sync with DB
        syncTimeout.current = setTimeout(async () => {
            try {
                if (newQty <= 0) {
                    await TechnicianAPI.deleteRequisition(adjustingPart.id);
                    setAdjustingPart(null);
                    fetchRequisitions();
                } else {
                    await TechnicianAPI.updateRequisition(adjustingPart.id, newQty);
                }
            } catch (err) {
                console.error("Sync failed:", err);
                // Refresh to correct any inconsistencies
                fetchRequisitions();
            }
        }, 500);
    };

    if (loading && !job) return (
        <div className="min-h-screen bg-slate-950 p-4 pt-20">
            <DetailSkeleton />
        </div>
    );
    if (!job) return <div className="p-8 text-white">Job not found.</div>;

    const tabs = [
        { id: 'summary', icon: Info, label: 'Info' },
        { id: 'checklist', icon: ListChecks, label: 'Tasks' },
        { id: 'parts', icon: Package, label: 'Parts' },
        { id: 'photos', icon: Camera, label: 'Photos' },
        { id: 'notes', icon: FileText, label: 'Notes' },
    ];

    return (
        <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen">
            <TopBar
                title={`Job #${job.service_number || id?.slice(0, 8)}`}
                onMenuClick={() => navigate(-1)}
                showBack
            />

            {!isOnline && (
                <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <WifiOff size={14} className="text-amber-500" />
                        <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Offline Mode</span>
                    </div>
                    <span className="text-[9px] text-amber-500/60 font-medium italic">Changes will sync when online</span>
                </div>
            )}

            {/* Tab Navigation */}
            <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 sticky top-[60px] z-10 backdrop-blur-md">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as Tab)}
                        className={`flex-1 min-w-[80px] py-3 flex flex-col items-center gap-1 text-xs font-bold transition-colors relative ${activeTab === tab.id ? 'text-blue-500' : 'text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-slate-300'
                            }`}
                    >
                        <tab.icon size={20} />
                        {tab.label}
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                            />
                        )}
                    </button>
                ))}
            </div>

            <div className="p-4 max-w-2xl mx-auto space-y-6">

                {activeTab === 'summary' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="glass-card rounded-3xl p-6 mb-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white font-display uppercase tracking-tight">
                                        {job.vehicle?.model_name || 'Generic Bike'}
                                    </h2>
                                    <p className="text-blue-400 font-mono text-sm tracking-widest mt-1">
                                        {job.vehicle?.license_plate || 'WP-8899'}
                                    </p>
                                </div>
                                {(() => {
                                    const status = job.status || 'pending';
                                    const prettyStatus = status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                                    let style = 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
                                    let label = prettyStatus;

                                    if (status === 'completed' || status === 'verified' || status === 'qc_passed') {
                                        style = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.1)]';
                                        label = status === 'completed' ? 'Done' : prettyStatus;
                                    } else if (status === 'in_progress') {
                                        style = 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_12px_rgba(59,130,246,0.1)]';
                                        label = 'Active';
                                    } else if (status === 'paused') {
                                        style = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
                                        label = 'Paused';
                                    } else if (status === 'pending') {
                                        style = 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.1)]';
                                        label = 'Pending';
                                    } else if (status === 'qc_requested') {
                                        style = 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.1)]';
                                        label = 'QC Requested';
                                    } else if (status === 'qc_failed') {
                                        style = 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
                                        label = 'QC Failed';
                                    }

                                    return (
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-500 ${style}`}>
                                            {label}
                                        </div>
                                    );
                                })()}
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <div className="flex items-center gap-3 text-slate-400">
                                    <UserIcon size={16} />
                                    <span className="text-sm">{job.vehicle?.customer_name}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-400">
                                    <Clock size={16} />
                                    <span className="text-sm">{new Date(job.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-slate-100/50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800/50">
                                <div className="flex items-center gap-2 mb-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
                                    <Info size={12} />
                                    Vehicle Details
                                </div>
                                <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Engine</p>
                                        <p className="text-sm text-slate-300 font-mono">{job.vehicle?.engine_number || '---'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Chassis</p>
                                        <p className="text-sm text-slate-300 font-mono">{job.vehicle?.chassis_number || '---'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Mileage</p>
                                        <p className="text-sm text-slate-300 font-mono">{job.vehicle?.mileage ? `${job.vehicle.mileage} KM` : '---'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Color</p>
                                        <p className="text-sm text-slate-300">{job.vehicle?.color || '---'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 p-4 bg-slate-100/50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800/50">
                                <div className="flex items-center gap-2 mb-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
                                    <AlertTriangle size={12} className="text-amber-500" />
                                    Customer Issue
                                </div>
                                <p className="text-sm leading-relaxed text-slate-300">
                                    {job.vehicle?.issue_description || 'General maintenance and checkup.'}
                                </p>
                            </div>

                            {/* Added & Requested Parts Section */}
                            <div className="mt-6">
                                <div className="flex justify-between items-center mb-4 px-2">
                                    <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
                                        <Package size={12} className="text-blue-500" />
                                        Parts & Requisitions
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {/* Issued Parts */}
                                    {job.parts && job.parts.map((part) => (
                                        <div
                                            key={part.id}
                                            className="flex justify-between items-center p-4 bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/50 rounded-2xl transition-all group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500">
                                                    <CheckCircle2 size={16} />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-900 dark:text-slate-200">{part.part_name || 'Generic Part'}</h4>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Quantity: {part.quantity} • Issued</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-black text-gray-700 dark:text-slate-300">৳{part.price?.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Active Requisitions */}
                                    {requisitions && requisitions.map((req: any) => (
                                        <div
                                            key={req.id}
                                            onClick={() => handleOpenQuickAdjust(req)}
                                            className="flex justify-between items-center p-4 bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/50 rounded-2xl active:scale-[0.98] transition-all cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${req.status === 'rejected' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                    <Clock size={16} />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-900 dark:text-slate-200 group-hover:text-blue-500 transition-colors">{req.productName || req.part_name || 'Generic Part'}</h4>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Quantity: {req.quantity} • {req.status}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-black text-gray-700 dark:text-slate-300">৳{req.unit_price?.toLocaleString()}</p>
                                                <div className={`text-[8px] font-black uppercase mt-1 px-2 py-0.5 rounded-full inline-block ${req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : req.status === 'rejected' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                    {req.status}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {(!job.parts?.length && !requisitions?.length) && (
                                        <div
                                            onClick={() => setShowPartsSelector(true)}
                                            className="text-center py-8 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800/50 hover:border-blue-500/30 transition-all cursor-pointer"
                                        >
                                            <Package size={24} className="mx-auto mb-2 text-slate-700" />
                                            <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">No parts requested yet</p>
                                            <p className="text-[10px] text-slate-500 mt-1">Tap to add items</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Time Logs Summary (Optional) */}
                        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
                            <h3 className="font-bold text-slate-200 mb-4">Time Logs</h3>
                            <div className="space-y-2">
                                {job.time_logs && job.time_logs.length > 0 ? job.time_logs.map((log) => (
                                    <div key={log.id} className="flex justify-between text-sm">
                                        <span className="text-slate-400 capitalize">{log.event_type?.replace('_', ' ') || 'event'}</span>
                                        <span className="font-mono text-slate-300">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                )) : (
                                    <p className="text-slate-500 italic text-sm">No activity recorded yet.</p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'checklist' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-10">
                        {job.checklist && job.checklist.length > 0 ? (
                            // Group by category if available
                            Object.entries(
                                job.checklist.reduce((acc, item) => {
                                    const cat = item.category || 'General';
                                    if (!acc[cat]) acc[cat] = [];
                                    acc[cat].push(item);
                                    return acc;
                                }, {} as Record<string, ChecklistItem[]>)
                            ).map(([category, items]) => (
                                <div key={category} className="space-y-3">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">{category}</h3>
                                    {(items as ChecklistItem[]).map(item => (
                                        <div key={item.id} className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl space-y-4 group hover:border-slate-700 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <button
                                                        onClick={() => handleChecklistToggle(item)}
                                                        className={`p-2 rounded-xl transition-all ${item.is_completed
                                                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-inner'
                                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 hover:border-blue-500/30'
                                                            }`}
                                                    >
                                                        <CheckSquare size={20} className={item.is_completed ? 'scale-110' : ''} />
                                                    </button>
                                                    <div>
                                                        <p className={`font-bold transition-colors ${item.is_completed ? 'text-slate-400 dark:text-slate-500 line-through decoration-emerald-500/50' : 'text-gray-900 dark:text-slate-200'}`}>
                                                            {item.name}
                                                        </p>
                                                        {(item as any).photo_url && (
                                                            <div className="mt-2 flex items-center gap-2">
                                                                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-700">
                                                                    <img src={(item as any).photo_url} className="w-full h-full object-cover" />
                                                                </div>
                                                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Evidence Attached</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleChecklistPhoto(item)}
                                                    className={`p-2 rounded-xl transition-all ${(item as any).photo_url ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' : 'bg-slate-800 text-slate-500 border border-slate-700 hover:text-blue-400'}`}
                                                >
                                                    <Camera size={20} />
                                                </button>
                                            </div>

                                            <div className="flex gap-2 p-1 bg-slate-950/50 rounded-xl border border-slate-800/50">
                                                {(['ok', 'fair', 'bad', 'na'] as ServiceCondition[]).map((cond) => (
                                                    <button
                                                        key={cond}
                                                        onClick={() => handleChecklistUpdate(item.id, item.is_completed, cond, (item as any).photo_url)}
                                                        className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all ${item.condition === cond
                                                            ? cond === 'ok' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/40'
                                                                : cond === 'fair' ? 'bg-amber-500 text-white shadow-lg shadow-amber-900/40'
                                                                    : cond === 'bad' ? 'bg-rose-500 text-white shadow-lg shadow-rose-900/40'
                                                                        : 'bg-slate-700 text-white'
                                                            : 'text-slate-500 hover:bg-slate-800'
                                                            }`}
                                                    >
                                                        {cond}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-slate-500">
                                <ListChecks size={40} className="mx-auto mb-2 opacity-50" />
                                No checklist items assigned.
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'parts' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-10">
                        <section className="space-y-4">
                            <div className="flex justify-between items-center px-2">
                                <h3 className="text-sm font-bold flex items-center gap-2 text-slate-500 uppercase tracking-widest">
                                    <Package size={16} className="text-blue-500" />
                                    Used Parts
                                </h3>
                                <button
                                    onClick={() => setShowPartsSelector(true)}
                                    className="flex items-center gap-1 text-xs font-bold bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-full border border-blue-500/20 hover:bg-blue-500/20 transition-all"
                                >
                                    <Plus size={14} />
                                    Add Part
                                </button>
                            </div>

                            <div className="space-y-3">
                                {job.parts && job.parts.length > 0 ? (
                                    job.parts.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center p-4 bg-slate-900/40 border border-slate-800/50 rounded-2xl">
                                            <div>
                                                <h4 className="font-medium text-slate-200">{item.part_name || 'Generic Part'}</h4>
                                                <p className="text-[10px] text-slate-500 font-mono uppercase mt-1">Quantity: {item.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-slate-300">৳{item.price}</p>
                                                <p className="text-[10px] text-slate-500">Issued</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 bg-slate-900/20 rounded-2xl border border-dashed border-slate-800">
                                        <p className="text-slate-600 text-sm">No parts issued yet.</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Requisitions Section */}
                        <section className="space-y-4">
                            <div className="px-2">
                                <h3 className="text-sm font-bold flex items-center gap-2 text-slate-500 uppercase tracking-widest">
                                    <Clock size={16} className="text-amber-500" />
                                    Active Requisitions
                                </h3>
                            </div>

                            <div className="space-y-3">
                                {requisitions && requisitions.length > 0 ? (
                                    requisitions.map((req: any) => (
                                        <div
                                            key={req.id}
                                            onClick={() => handleOpenQuickAdjust(req)}
                                            className="flex justify-between items-center p-4 bg-slate-900/40 border border-slate-800/50 rounded-2xl group active:scale-[0.98] transition-all cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-blue-500 transition-colors">
                                                    <Package size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-slate-200">{req.productName}</h4>
                                                    <p className="text-[10px] text-slate-500 font-mono uppercase mt-1">Qty: {req.quantity}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-tighter ${req.status === 'approved' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10' :
                                                    req.status === 'rejected' ? 'text-rose-500 border-rose-500/20 bg-rose-500/10' :
                                                        'text-amber-500 border-amber-500/20 bg-amber-500/10'
                                                    }`}>
                                                    {req.status}
                                                </div>
                                                <p className="text-[10px] text-slate-600 mt-1">
                                                    {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6 bg-slate-900/20 rounded-2xl border border-dashed border-slate-800">
                                        <p className="text-slate-600 text-[10px] uppercase font-bold tracking-widest">No pending requisitions</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </motion.div>
                )}

                {activeTab === 'photos' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {job.photos && job.photos.map(photo => (
                                <div key={photo.id}>
                                    <div className="relative aspect-square bg-slate-800 rounded-xl overflow-hidden group">
                                        <img src={photo.image_url} alt="Job" className="w-full h-full object-cover" />
                                        <div className="absolute top-2 right-2 flex gap-1">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAIAnalysis(photo.id);
                                                }}
                                                className="p-1.5 bg-blue-600/80 backdrop-blur-sm rounded-lg text-white hover:bg-blue-500 transition-colors"
                                                title="AI Damage Analysis"
                                            >
                                                <Sparkles size={14} />
                                            </button>
                                        </div>
                                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded-md text-[10px] font-bold text-white uppercase tracking-wider">
                                            {photo.tag}
                                        </div>
                                        {photo.metadata && (
                                            <div className="absolute inset-0 bg-blue-600/10 border-2 border-blue-500/50 rounded-xl pointer-events-none" />
                                        )}
                                    </div>
                                    {photo.metadata && (
                                        <div className="mt-2 p-2 bg-blue-900/20 border border-blue-800/50 rounded-lg">
                                            <div className="flex items-center gap-1 mb-1">
                                                <Sparkles size={10} className="text-blue-400" />
                                                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">AI Analysis</span>
                                            </div>
                                            <p className="text-[10px] text-slate-300 leading-tight line-clamp-2 italic">"{photo.metadata.damage_description}"</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <label className="aspect-square bg-slate-900/50 border border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:text-blue-400 hover:border-blue-500/50 transition-colors cursor-pointer">
                                <Camera size={32} className="mb-2" />
                                <span className="text-xs font-medium">Add Photo</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                            </label>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'notes' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <div className="space-y-4">
                            {/* Display existing notes if any (JobCard interface needs checking for notes array, usually it's just 'notes' string or joined) */}
                            {job.notes && (
                                <div className="bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                    <p className="text-gray-700 dark:text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{job.notes}</p>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="Add a note..."
                                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                            />
                            <button
                                onClick={handleAddNote}
                                className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-500 transition-colors"
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                    </motion.div>
                )}

            </div>

            {/* Action Bar */}
            <div className="fixed bottom-6 left-4 right-4 max-w-2xl mx-auto flex gap-3">
                {job.status === 'pending' || job.status === 'paused' ? (
                    <button
                        onClick={() => handleStatusUpdate('in_progress')}
                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transition-all active:scale-95"
                    >
                        <PlayCircle size={20} />
                        {job.status === 'paused' ? 'Resume Job' : 'Start Job'}
                    </button>
                ) : job.status === 'in_progress' ? (
                    <>
                        <button
                            onClick={() => handleStatusUpdate('paused')}
                            className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 border border-amber-500/30 transition-all active:scale-95"
                        >
                            <PauseCircle size={20} />
                        </button>
                        <button
                            onClick={handleRequestQC}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transition-all active:scale-95"
                        >
                            <CheckCircle2 size={20} />
                            Request QC
                        </button>
                    </>
                ) : job.status === 'qc_requested' ? (
                    <div className="flex-1 bg-amber-500/10 text-amber-400 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 border border-amber-500/30">
                        <Clock size={20} />
                        Awaiting QC Review...
                    </div>
                ) : job.status === 'qc_passed' ? (
                    <button
                        onClick={() => handleStatusUpdate('completed')}
                        className="flex-1 bg-green-600 hover:bg-green-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 transition-all active:scale-95"
                    >
                        <CheckCircle2 size={20} />
                        Mark Complete
                    </button>
                ) : job.status === 'qc_failed' ? (
                    <button
                        onClick={() => handleStatusUpdate('in_progress')}
                        className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-900/20 transition-all active:scale-95"
                    >
                        <PlayCircle size={20} />
                        Resume Work (QC Failed)
                    </button>
                ) : null}
            </div>

            {/* Quick Adjust Modal */}
            <AnimatePresence>
                {adjustingPart && (
                    <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-8 sm:pb-0 sm:items-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setAdjustingPart(null)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
                        >
                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl opacity-50" />

                            <div className="flex flex-col items-center text-center relative z-10">
                                <div className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center text-blue-500 mb-4 shadow-inner">
                                    <Package size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1">
                                    {adjustingPart.productName || adjustingPart.part_name || 'Generic Part'}
                                </h3>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-6">
                                    {productForAdjustment?.sku || 'NO SKU'}
                                </p>

                                {/* Quantity Control */}
                                <div className="flex items-center gap-8 mb-8">
                                    <button
                                        onClick={() => handleUpdateQuantity(adjustingPart.quantity - 1)}
                                        className="w-14 h-14 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-400 hover:text-rose-500 active:scale-90 transition-all"
                                    >
                                        <Trash2 size={24} className={adjustingPart.quantity === 1 ? 'text-rose-500' : ''} />
                                    </button>

                                    <div className="flex flex-col items-center">
                                        <span className="text-5xl font-black text-white tabular-nums">
                                            {adjustingPart.quantity}
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-black uppercase mt-1 tracking-widest">Quantity</span>
                                    </div>

                                    <button
                                        onClick={() => handleUpdateQuantity(adjustingPart.quantity + 1)}
                                        disabled={productForAdjustment && adjustingPart.quantity >= productForAdjustment.stock_quantity}
                                        className="w-14 h-14 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-400 hover:text-emerald-500 active:scale-90 transition-all disabled:opacity-50"
                                    >
                                        <Plus size={24} />
                                    </button>
                                </div>

                                {/* Stock & Price Info */}
                                <div className="w-full grid grid-cols-2 gap-3 mb-8">
                                    <div className="bg-slate-950/50 p-4 rounded-3xl border border-slate-800/50">
                                        <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Available</p>
                                        <p className={`text-lg font-black ${productForAdjustment !== null && (productForAdjustment.stock_quantity - adjustingPart.quantity) > 5 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                            {productForAdjustment !== null ? `${productForAdjustment.stock_quantity - adjustingPart.quantity}` : '--'}
                                        </p>
                                    </div>
                                    <div className="bg-slate-950/50 p-4 rounded-3xl border border-slate-800/50">
                                        <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Total</p>
                                        <p className="text-lg font-black text-blue-400">
                                            ৳{((adjustingPart.unit_price || 0) * adjustingPart.quantity).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setAdjustingPart(null)}
                                    className="w-full py-5 bg-slate-950 border border-slate-800 rounded-3xl text-sm font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
                                >
                                    Done
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Parts Selector Modal */}
            <AnimatePresence>
                {showPartsSelector && id && (
                    <PartsSelectionModal
                        jobId={id}
                        onClose={() => setShowPartsSelector(false)}
                        onSuccess={handlePartsSuccess}
                    />
                )}
            </AnimatePresence>

        </div>
    );
};
