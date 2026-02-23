import React, { useState, useEffect } from 'react';
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
import { JobCard, Category, Part, PartVariant, RoutePath, ChecklistItem, JobPhoto, ServiceCondition } from '../types';
import { TopBar } from '../components/TopBar';
import { OfflineService } from '../services/offline';
import { LocationService } from '../services/location';
import { MediaService } from '../services/media';
import { SocketService } from '../services/socket';
import { WifiOff, Cloud, ImageIcon } from 'lucide-react';

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
    const [categories, setCategories] = useState<Category[]>([]);
    const [showPartsSelector, setShowPartsSelector] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [availableParts, setAvailableParts] = useState<Part[]>([]);
    const [selectedPart, setSelectedPart] = useState<Part | null>(null);
    const [availableVariants, setAvailableVariants] = useState<PartVariant[]>([]);

    // Note State
    const [newNote, setNewNote] = useState('');

    useEffect(() => {
        if (id) {
            fetchJobDetails();
            fetchCategories();
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
        socket.on('inventory:changed', fetchCategories); // Refresh parts if inventory changed

        return () => {
            socket.off('order:update', handleUpdate);
            socket.off('job_cards:changed', handleUpdate);
            socket.off('inventory:changed', fetchCategories);
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
            setJob(res.data);
            await offlineService.cacheJobDetail(id, res.data);
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

    const fetchCategories = async () => {
        // Read-only public data
        const { data } = await supabase.from('categories').select('*');
        if (data) setCategories(data);
    };

    const fetchPartsByCategory = async (catId: string) => {
        const { data } = await supabase.from('parts').select('*').eq('category_id', catId);
        if (data) setAvailableParts(data);
    };

    const fetchVariantsByPart = async (partId: string) => {
        const { data } = await supabase.from('part_variants').select('*').eq('part_id', partId);
        if (data) setAvailableVariants(data);
    };

    const handleStatusUpdate = async (newStatus: string) => {
        if (!job) return;
        try {
            const location = await LocationService.getInstance().getCurrentLocation();

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
                setJob({ ...job, status: newStatus as any });
                return;
            }

            await TechnicianAPI.updateJobStatus(job.id, newStatus, location);
            fetchJobDetails();
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Failed to update status");
        }
    };

    const handleAddPart = async (variant: PartVariant) => {
        if (!job) return;
        try {
            await TechnicianAPI.addPartUsage(job.id, variant.id, 1, variant.price);
            setShowPartsSelector(false);
            setSelectedCategory(null);
            setSelectedPart(null);
            fetchJobDetails();
        } catch (err) {
            console.error("Error adding part:", err);
            alert("Failed to add part");
        }
    };

    const handleChecklistToggle = async (item: ChecklistItem) => {
        if (!job) return;
        try {
            const newStatus = !item.is_completed;
            if (!isOnline) {
                await offlineService.queueAction('update_checklist', {
                    jobId: job.id,
                    itemId: item.id,
                    condition: item.condition,
                    completed: newStatus
                });
                const updatedChecklist = job.checklist?.map(c => c.id === item.id ? { ...c, is_completed: newStatus } : c);
                setJob({ ...job, checklist: updatedChecklist });
                return;
            }

            await TechnicianAPI.updateChecklist(job.id, [{
                id: item.id,
                condition: item.condition,
            }]);
            fetchJobDetails();
        } catch (err) {
            console.error("Error updating checklist:", err);
        }
    };

    const handleChecklistUpdate = async (itemId: string, completed: boolean, condition: ServiceCondition) => {
        if (!job) return;
        try {
            if (!isOnline) {
                await offlineService.queueAction('update_checklist', { jobId: job.id, itemId, condition, completed });
                const updatedChecklist = job.checklist?.map(c => c.id === itemId ? { ...c, condition, is_completed: completed } : c);
                setJob({ ...job, checklist: updatedChecklist });
                return;
            }

            await TechnicianAPI.updateChecklist(job.id, [{
                id: itemId,
                condition: condition,
                completed: completed
            }]);
            fetchJobDetails();
        } catch (error) {
            console.error("Failed to update checklist item:", error);
        }
    };


    const handleAddNote = async () => {
        if (!job || !newNote.trim()) return;
        try {
            if (!isOnline) {
                await offlineService.queueAction('add_note', { jobId: job.id, note: newNote });
                setNewNote('');
                // Optionally add to local state if notes are displayed
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
            // toast.loading('AI is analyzing the photo...', { id: 'ai-analysis' }); // Assuming toast is available
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/ai/diagnostics`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ photoId })
            });

            if (!response.ok) throw new Error('AI analysis failed');
            const result = await response.json();

            // toast.success('AI Analysis Completed', { id: 'ai-analysis' }); // Assuming toast is available
            // Re-fetch job details to show updated metadata
            fetchJobDetails();
        } catch (error) {
            console.error(error);
            // toast.error('AI Analysis failed', { id: 'ai-analysis' }); // Assuming toast is available
        }
    };

    const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!job || !event.target.files || event.target.files.length === 0) return;
        setLoading(true);
        try {
            const file = event.target.files[0];

            // 1. Compress Image
            console.log(`[MEDIA] Original size: ${MediaService.formatBytes(file.size)}`);
            const compressedBlob = await MediaService.compressImage(file);
            console.log(`[MEDIA] Compressed size: ${MediaService.formatBytes(compressedBlob.size)}`);

            const fileExt = 'jpg'; // We compress to jpeg
            const fileName = `${job.id}/${Date.now()}.${fileExt}`;
            const filePath = `job-photos/${fileName}`;

            // 2. Upload to Supabase
            const { data, error } = await supabase.storage
                .from('service-docs')
                .upload(filePath, compressedBlob, {
                    contentType: 'image/jpeg'
                });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('service-docs')
                .getPublicUrl(filePath);

            // 3. Save to Central API
            await TechnicianAPI.uploadPhoto(job.id, {
                url: publicUrl,
                tag: 'during', // Default to during, can be enhanced later
                caption: `Uploaded from mobile - ${MediaService.formatBytes(compressedBlob.size)}`
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

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>;
    if (!job) return <div className="p-8 text-white">Job not found.</div>;

    const tabs = [
        { id: 'summary', icon: Info, label: 'Info' },
        { id: 'checklist', icon: ListChecks, label: 'Tasks' },
        { id: 'parts', icon: Package, label: 'Parts' },
        { id: 'photos', icon: Camera, label: 'Photos' },
        { id: 'notes', icon: FileText, label: 'Notes' },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 pb-20">
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
            <div className="flex overflow-x-auto border-b border-slate-800 bg-slate-900/50 sticky top-[60px] z-10 backdrop-blur-md">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as Tab)}
                        className={`flex-1 min-w-[80px] py-3 flex flex-col items-center gap-1 text-xs font-medium transition-colors relative ${activeTab === tab.id ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
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
                        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl mb-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                                        {job.vehicle?.model_name || 'Generic Bike'}
                                    </h2>
                                    <p className="text-blue-400 font-mono text-sm tracking-widest mt-1">
                                        {job.vehicle?.license_plate || 'WP-8899'}
                                    </p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-tighter ${job.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    }`}>
                                    {job.status.replace('_', ' ')}
                                </div>
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

                            <div className="mt-6 p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50">
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

                            <div className="mt-4 p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                                <div className="flex items-center gap-2 mb-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
                                    <AlertTriangle size={12} className="text-amber-500" />
                                    Customer Issue
                                </div>
                                <p className="text-sm leading-relaxed text-slate-300">
                                    {job.vehicle?.issue_description || 'General maintenance and checkup.'}
                                </p>
                            </div>
                        </div>

                        {/* Time Logs Summary (Optional) */}
                        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
                            <h3 className="font-bold text-slate-200 mb-4">Time Logs</h3>
                            <div className="space-y-2">
                                {job.time_logs && job.time_logs.length > 0 ? job.time_logs.map((log) => (
                                    <div key={log.id} className="flex justify-between text-sm">
                                        <span className="text-slate-400 capitalize">{log.event_type.replace('_', ' ')}</span>
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
                                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                                                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                                                            }`}
                                                    >
                                                        <CheckSquare size={20} className={item.is_completed ? 'scale-110' : ''} />
                                                    </button>
                                                    <p className={`font-medium transition-colors ${item.is_completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                                                        {item.name}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 p-1 bg-slate-950/50 rounded-xl border border-slate-800/50">
                                                {(['ok', 'fair', 'bad', 'na'] as ServiceCondition[]).map((cond) => (
                                                    <button
                                                        key={cond}
                                                        onClick={() => handleChecklistUpdate(item.id, item.is_completed, cond)}
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
                                    Requisitions
                                </h3>
                            </div>

                            <div className="space-y-3">
                                {/* We would need to fetch requisitions separately or include in job card detail backend */}
                                <p className="text-center py-4 bg-slate-900/20 rounded-2xl text-slate-600 text-xs italic">
                                    Requisitions are managed by the store staff.
                                </p>
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
                                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                                    <p className="text-slate-300 text-sm whitespace-pre-wrap">{job.notes}</p>
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
                            className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 border border-blue-500/30 transition-all active:scale-95"
                        >
                            QC
                        </button>
                        <button
                            onClick={() => handleStatusUpdate('completed')}
                            className="flex-1 bg-green-600 hover:bg-green-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 transition-all active:scale-95"
                        >
                            <CheckCircle2 size={20} />
                            Complete
                        </button>
                    </>
                ) : null}
            </div>

            {/* Parts Selector Overlay (Reused Logic) */}
            <AnimatePresence>
                {showPartsSelector && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-slate-950 flex flex-col pt-safe"
                    >
                        <div className="flex items-center gap-4 p-6 border-b border-slate-900 bg-slate-950/50 backdrop-blur-xl sticky top-0">
                            <button
                                onClick={() => {
                                    if (selectedPart) setSelectedPart(null);
                                    else if (selectedCategory) setSelectedCategory(null);
                                    else setShowPartsSelector(false);
                                }}
                                className="p-3 bg-slate-900 rounded-2xl text-slate-400"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <div>
                                <h2 className="text-xl font-bold">
                                    {!selectedCategory ? 'Select Category' : (selectedPart ? 'Select Variant' : 'Select Part')}
                                </h2>
                                <div className="flex gap-2 text-xs text-slate-500 font-medium">
                                    {selectedCategory && <span>{selectedCategory.name}</span>}
                                    {selectedPart && (
                                        <>
                                            <span className="text-slate-800">/</span>
                                            <span className="text-blue-500">{selectedPart.name}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {/* Categories */}
                            {!selectedCategory && categories.map((cat) => (
                                <motion.button
                                    key={cat.id}
                                    onClick={() => {
                                        setSelectedCategory(cat);
                                        fetchPartsByCategory(cat.id);
                                    }}
                                    className="w-full bg-slate-900/50 border border-slate-800 p-6 rounded-3xl flex items-center justify-between hover:border-blue-500/30 active:scale-95 transition-all text-left"
                                >
                                    <span className="font-bold text-lg">{cat.name}</span>
                                    <ChevronLeft className="rotate-180 text-slate-700" size={20} />
                                </motion.button>
                            ))}

                            {/* Parts */}
                            {selectedCategory && !selectedPart && availableParts.map((p) => (
                                <motion.button
                                    key={p.id}
                                    onClick={() => {
                                        setSelectedPart(p);
                                        fetchVariantsByPart(p.id);
                                    }}
                                    className="w-full bg-slate-900/50 border border-slate-800 p-5 rounded-3xl flex items-center justify-between active:scale-95 transition-all"
                                >
                                    <span className="font-semibold">{p.name}</span>
                                    <ChevronLeft className="rotate-180 text-slate-700" size={20} />
                                </motion.button>
                            ))}

                            {/* Variants */}
                            {selectedPart && availableVariants.map((v) => (
                                <motion.button
                                    key={v.id}
                                    onClick={() => handleAddPart(v)}
                                    className="w-full bg-slate-900/80 border border-blue-500/20 p-5 rounded-3xl flex items-center justify-between active:scale-95 transition-all"
                                >
                                    <div className="flex flex-col text-left">
                                        <span className="font-bold text-white">{v.brand}</span>
                                        <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">{v.sku}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-blue-400">৳{v.price}</p>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};
