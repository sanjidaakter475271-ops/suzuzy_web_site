'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileSpreadsheet,
    Upload,
    X,
    Check,
    Loader2,
    AlertCircle,
    ChevronRight,
    Search,
    Package,
    ArrowLeft,
    Database,
    History
} from 'lucide-react';
import { GlassCard } from '@/components/ui/premium/GlassCard';
import { MetallicText } from '@/components/ui/premium/MetallicText';
import { GradientButton } from '@/components/ui/premium/GradientButton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';

interface Category {
    id: string;
    name: string;
}

export default function ImportProductsPage() {
    const { profile } = useUser();
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [defaultCategoryId, setDefaultCategoryId] = useState<string>('');
    const [stats, setStats] = useState<{ successful: number; failed: number } | null>(null);

    useEffect(() => {
        async function fetchCategories() {
            const { data } = await supabase.from('categories').select('id, name').order('name');
            if (data) {
                setCategories(data);
                setDefaultCategoryId(data[0]?.id || '');
            }
        }
        fetchCategories();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            parsePreview(selectedFile);
        }
    };

    const parsePreview = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);
            setPreviewData(json.slice(0, 5));
        };
        reader.readAsArrayBuffer(file);
    };

    const handleImport = async () => {
        if (!file || !profile?.dealer_id) return;

        setIsUploading(true);
        try {
            const base64 = await fileToBase64(file);
            const pureBase64 = base64.split(',')[1];

            const { data, error } = await supabase.functions.invoke('import-products-excel', {
                body: {
                    dealerId: profile.dealer_id,
                    fileData: pureBase64,
                    defaultCategoryId: defaultCategoryId
                }
            });

            if (error) throw error;

            setStats({
                successful: data.successful,
                failed: data.failed
            });

            if (data.failed === 0) {
                toast.success(`Successfully imported ${data.successful} records`);
            } else {
                toast.warning(`Import complete: ${data.successful} succeeded, ${data.failed} failed`);
            }

        } catch (error: any) {
            console.error("Import failed:", error);
            toast.error(error.message || "Failed to process the registry file");
        } finally {
            setIsUploading(false);
        }
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    return (
        <div className="max-w-6xl mx-auto selection:bg-[#D4AF37] selection:text-[#0D0D0F] p-8 -mt-8">
            <div className="flex items-center justify-between mb-12">
                <div>
                    <div className="flex items-center gap-2 mb-2 text-[#D4AF37]">
                        <Database className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">System Registry Engine</span>
                    </div>
                    <h1 className="text-4xl font-display font-black text-white italic tracking-tighter">
                        COLLECTIVE <MetallicText>IMPORT PROTOCOL</MetallicText>
                    </h1>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-2 ml-1">
                        Map legacy database assets to modern architecture
                    </p>
                </div>
                <div className="flex gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/dealer/products')}
                        className="text-white/40 hover:text-white uppercase text-[10px] font-black tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Cancel Protocol
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Upload Zone */}
                    <GlassCard className="p-8 border-[#D4AF37]/10 relative group overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        {!file ? (
                            <div className="relative border-2 border-dashed border-white/5 rounded-2xl p-12 text-center hover:border-[#D4AF37]/30 transition-all cursor-pointer bg-white/[0.02]">
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    accept=".xlsx,.xls"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-6 border border-[#D4AF37]/20">
                                    <Upload className="w-8 h-8 text-[#D4AF37]" />
                                </div>
                                <h3 className="text-xl font-display font-bold text-white mb-2">Initiate Data Feed</h3>
                                <p className="text-white/40 text-xs font-medium uppercase tracking-widest max-w-[240px] mx-auto leading-relaxed">
                                    Drop your inventory spreadsheet here or click to browse the filesystem
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-6 bg-white/[0.03] rounded-2xl border border-white/10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                            <FileSpreadsheet className="w-6 h-6 text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{file.name}</p>
                                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">
                                                {(file.size / 1024).toFixed(1)} KB • Protocol Analysis Ready
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { setFile(null); setPreviewData([]); setStats(null); }}
                                        className="p-2 hover:bg-red-500/10 rounded-lg text-white/20 hover:text-red-500 transition-all"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {previewData.length > 0 && (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Search className="w-3 h-3 text-[#D4AF37]" />
                                            <span className="text-[9px] font-black text-[#D4AF37] uppercase tracking-[0.2em]">Data Structure Validation</span>
                                        </div>
                                        <div className="rounded-xl border border-white/5 overflow-hidden">
                                            <table className="w-full text-left text-[10px]">
                                                <thead>
                                                    <tr className="bg-white/5 border-b border-white/5 font-black uppercase tracking-widest text-white/40">
                                                        <th className="p-3">Barcode</th>
                                                        <th className="p-3">Item Name</th>
                                                        <th className="p-3">Quantity</th>
                                                        <th className="p-3">Retail</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-white/60">
                                                    {previewData.map((row, i) => (
                                                        <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                                                            <td className="p-3 font-mono">{row['Barcode'] || '-'}</td>
                                                            <td className="p-3 font-bold text-white/80">{row['Item Name'] || row['ItemName'] || '-'}</td>
                                                            <td className="p-3">{row['Quantity'] || row['Qty'] || '0'}</td>
                                                            <td className="p-3">৳{row['Retail Price'] || row['RetailPrice'] || '0'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </GlassCard>

                    {/* Import Progress / Stats */}
                    {isUploading && (
                        <GlassCard className="p-12 border-[#D4AF37]/20 flex flex-col items-center justify-center text-center">
                            <div className="relative w-20 h-20 mb-8">
                                <div className="absolute inset-0 rounded-full border-4 border-[#D4AF37]/10" />
                                <motion.div
                                    className="absolute inset-0 rounded-full border-4 border-t-[#D4AF37]"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                />
                                <Package className="absolute inset-0 m-auto w-8 h-8 text-[#D4AF37] animate-pulse" />
                            </div>
                            <h3 className="text-xl font-display font-bold text-white mb-2">Syncing Global Registry</h3>
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Processing high-volume asset transfer...</p>
                        </GlassCard>
                    )}

                    {stats && (
                        <GlassCard className="p-8 border-emerald-500/20 bg-emerald-500/[0.02]">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                        <Check className="w-6 h-6 text-emerald-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-display font-bold text-white italic">Protocol Successful</h3>
                                        <p className="text-[10px] text-emerald-500/60 font-black uppercase tracking-widest">Registry deployment finalized</p>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 bg-white/[0.02] rounded-2xl border border-white/5">
                                    <label className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Active Assets</label>
                                    <p className="text-3xl font-display font-black text-white mt-1 italic">{stats.successful}</p>
                                </div>
                                <div className="p-6 bg-white/[0.02] rounded-2xl border border-white/5">
                                    <label className="text-[8px] font-black text-red-500 uppercase tracking-widest">Rejected Entries</label>
                                    <p className="text-3xl font-display font-black text-white mt-1 italic">{stats.failed}</p>
                                </div>
                            </div>
                            <div className="mt-8 flex gap-4">
                                <GradientButton onClick={() => router.push('/dealer/products')} className="px-8 flex-1 h-12 text-xs font-black uppercase italic tracking-widest">
                                    View Repository
                                </GradientButton>
                                <Button variant="outline" onClick={() => { setFile(null); setStats(null); }} className="px-8 flex-1 h-12 text-xs font-black uppercase italic tracking-widest border-white/10 text-white/60 hover:text-white">
                                    New Protocol
                                </Button>
                            </div>
                        </GlassCard>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <GlassCard className="p-8 border-[#D4AF37]/10 bg-[#0D0D0F]/60">
                        <h3 className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.4em] mb-8 italic">IMPORT SETTINGS</h3>
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Classification Overflow</label>
                                <select
                                    value={defaultCategoryId}
                                    onChange={(e) => setDefaultCategoryId(e.target.value)}
                                    className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-xl px-4 text-xs font-bold text-white/80 outline-none focus:border-[#D4AF37]/50 appearance-none bg-[#0D0D0F]"
                                >
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <p className="text-[8px] text-white/20 italic ml-1">Used if auto-detection fails to find keywords</p>
                            </div>

                            <div className="pt-8 border-t border-white/5">
                                <div className="flex items-start gap-3 p-4 bg-amber-500/[0.02] border border-amber-500/10 rounded-xl">
                                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1 italic">Collision Protocol</p>
                                        <p className="text-[9px] text-white/40 leading-relaxed font-medium">
                                            Duplicate barcodes will be flagged with a <span className="text-red-500">System Alert</span> for manual reconciliation.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {file && !stats && (
                                <GradientButton
                                    onClick={handleImport}
                                    disabled={isUploading}
                                    className="w-full h-14 text-xs font-black uppercase italic tracking-[0.2em] shadow-[0_10px_30px_rgba(212,175,55,0.15)]"
                                >
                                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ChevronRight className="w-4 h-4 mr-2" />}
                                    Execute Sycnronization
                                </GradientButton>
                            )}
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6 border-white/5 bg-transparent">
                        <div className="flex items-center gap-3 text-white/30">
                            <History className="w-4 h-4" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Recent Protocols</span>
                        </div>
                        <div className="mt-4 space-y-3">
                            <p className="text-[9px] text-white/20 italic">No recent synchronize operations detected on this terminal.</p>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
