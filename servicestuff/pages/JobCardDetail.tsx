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
    Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { authClient } from '../lib/auth-client';
import { JobCard, Category, Part, PartVariant, RoutePath } from '../types';
import { TopBar } from '../components/TopBar';

export const JobCardDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: session } = authClient.useSession();
    const [job, setJob] = useState<JobCard | null>(null);
    const [loading, setLoading] = useState(true);
    const [parts, setParts] = useState<any[]>([]); // Selected parts for this job
    const [categories, setCategories] = useState<Category[]>([]);
    const [showPartsSelector, setShowPartsSelector] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [availableParts, setAvailableParts] = useState<Part[]>([]);
    const [selectedPart, setSelectedPart] = useState<Part | null>(null);
    const [availableVariants, setAvailableVariants] = useState<PartVariant[]>([]);

    useEffect(() => {
        if (id) {
            fetchJobDetails();
            fetchCategories();
        }
    }, [id]);

    const fetchJobDetails = async () => {
        setLoading(true);
        try {
            // First, try to find an existing job card for this ticket_id
            let { data: jobData, error: jobError } = await supabase
                .from('job_cards')
                .select(`
          *,
          vehicle:ticket_id (
            model_name,
            license_plate,
            customer_name,
            issue_description
          )
        `)
                .eq('ticket_id', id)
                .maybeSingle();

            if (!jobData && !jobError) {
                // Create a new job card if it doesn't exist
                const { data: staffData } = await supabase
                    .from('service_staff')
                    .select('id')
                    .eq('profile_id', session?.user?.id)
                    .single();

                const { data: newJob, error: createError } = await supabase
                    .from('job_cards')
                    .insert({
                        ticket_id: id,
                        technician_id: staffData?.id,
                        status: 'in_progress'
                    })
                    .select(`
            *,
            vehicle:ticket_id (
              model_name,
              license_plate,
              customer_name,
              issue_description
            )
          `)
                    .single();

                if (createError) throw createError;
                jobData = newJob;
            }

            if (jobError) throw jobError;
            setJob(jobData as any);

            // Fetch used parts
            if (jobData) {
                const { data: usageData } = await supabase
                    .from('parts_usage')
                    .select(`
            *,
            variant:variant_id (
              brand,
              sku,
              part:part_id (name)
            )
          `)
                    .eq('job_card_id', jobData.id);

                if (usageData) setParts(usageData);
            }
        } catch (err) {
            console.error("Error fetching job:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
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

    const handleAddPart = async (variant: PartVariant) => {
        try {
            const { error } = await supabase
                .from('parts_usage')
                .insert({
                    job_card_id: job?.id,
                    variant_id: variant.id,
                    quantity: 1,
                    unit_price: variant.price
                });

            if (error) throw error;
            setShowPartsSelector(false);
            setSelectedCategory(null);
            setSelectedPart(null);
            fetchJobDetails(); // Refresh list
        } catch (err) {
            console.error("Error adding part:", err);
        }
    };

    const handleFinishJob = async () => {
        try {
            const { error } = await supabase
                .from('job_cards')
                .update({
                    status: 'completed',
                    service_end_time: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;
            navigate(RoutePath.DASHBOARD);
        } catch (err) {
            console.error("Error finishing job:", err);
        }
    };

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>;
    if (!job) return <div className="p-8 text-white">Job not found.</div>;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 pb-20">
            <TopBar
                title={`Job #${id?.slice(0, 8)}`}
                onMenuClick={() => navigate(-1)}
                showBack
            />

            <div className="p-4 max-w-2xl mx-auto space-y-6">
                {/* Vehicle Info Card - Minimal & Elegant */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl"
                >
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
                            Customer Issue
                        </div>
                        <p className="text-sm leading-relaxed text-slate-300">
                            {job.vehicle?.issue_description || 'General maintenance and checkup.'}
                        </p>
                    </div>
                </motion.div>

                {/* Parts Usage Section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Package size={20} className="text-blue-500" />
                            Service Parts
                        </h3>
                        <button
                            onClick={() => setShowPartsSelector(true)}
                            className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            <Plus size={16} />
                            Add Parts
                        </button>
                    </div>

                    <AnimatePresence mode="popLayout">
                        {parts.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl p-12 text-center"
                            >
                                <Package className="mx-auto text-slate-700 mb-2" size={32} />
                                <p className="text-slate-500 text-sm italic">No parts added yet.</p>
                            </motion.div>
                        ) : (
                            <div className="space-y-3">
                                {parts.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="flex justify-between items-center p-4 bg-slate-900/50 border border-slate-800 rounded-2xl"
                                    >
                                        <div>
                                            <h4 className="font-medium text-slate-200">{item.variant?.part?.name}</h4>
                                            <p className="text-xs text-slate-500 font-mono uppercase">
                                                {item.variant?.brand} • {item.variant?.sku}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 text-sm font-bold">
                                                x{item.quantity}
                                            </div>
                                            <button className="text-slate-600 hover:text-rose-500 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Fixed Action Button */}
                <div className="fixed bottom-6 left-4 right-4 max-w-2xl mx-auto flex gap-3">
                    <button
                        onClick={handleFinishJob}
                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transition-all active:scale-95"
                    >
                        <CheckCircle2 size={20} />
                        Complete Service
                    </button>
                </div>
            </div>

            {/* Parts Selector Overlay */}
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
                            {/* Stage 1: Categories */}
                            {!selectedCategory && categories.map((cat) => (
                                <motion.button
                                    key={cat.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    onClick={() => {
                                        setSelectedCategory(cat);
                                        fetchPartsByCategory(cat.id);
                                    }}
                                    className="w-full bg-slate-900/50 border border-slate-800 p-6 rounded-3xl flex items-center justify-between hover:border-blue-500/30 active:scale-95 transition-all text-left group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-blue-500 group-hover:text-blue-400 transition-colors">
                                            <Tag size={24} />
                                        </div>
                                        <div>
                                            <span className="font-bold text-lg">{cat.name}</span>
                                            <p className="text-xs text-slate-500">{cat.description || 'View parts'}</p>
                                        </div>
                                    </div>
                                    <ChevronLeft className="rotate-180 text-slate-700" size={20} />
                                </motion.button>
                            ))}

                            {/* Stage 2: Parts */}
                            {selectedCategory && !selectedPart && availableParts.map((p) => (
                                <motion.button
                                    key={p.id}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    onClick={() => {
                                        setSelectedPart(p);
                                        fetchVariantsByPart(p.id);
                                    }}
                                    className="w-full bg-slate-900/50 border border-slate-800 p-5 rounded-3xl flex items-center justify-between active:scale-95 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center text-slate-400">
                                            <Package size={20} />
                                        </div>
                                        <span className="font-semibold">{p.name}</span>
                                    </div>
                                    <ChevronLeft className="rotate-180 text-slate-700" size={20} />
                                </motion.button>
                            ))}

                            {/* Stage 3: Variants */}
                            {selectedPart && availableVariants.map((v) => (
                                <motion.button
                                    key={v.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    onClick={() => handleAddPart(v)}
                                    className="w-full bg-slate-900/80 border border-blue-500/20 p-5 rounded-3xl flex items-center justify-between active:scale-95 transition-all group overflow-hidden relative"
                                >
                                    {/* Design accent */}
                                    <div className="absolute top-0 right-0 p-1 bg-blue-500/10 rounded-bl-xl text-[10px] font-bold text-blue-400 font-mono tracking-tighter uppercase">
                                        Available: {v.stock_quantity}
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="font-bold text-white group-hover:text-blue-400 transition-colors">{v.brand}</span>
                                        <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">{v.sku}</span>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-lg font-bold text-blue-400">৳{v.price}</p>
                                        <p className="text-[10px] text-slate-600 font-medium">TAP TO ADD</p>
                                    </div>
                                </motion.button>
                            ))}
                        </div>

                        {/* Close hint */}
                        <div className="p-4 text-center">
                            <button
                                onClick={() => setShowPartsSelector(false)}
                                className="text-slate-600 text-xs font-bold uppercase tracking-[0.2em] hover:text-slate-400 transition-colors"
                            >
                                Cancel and Close
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
