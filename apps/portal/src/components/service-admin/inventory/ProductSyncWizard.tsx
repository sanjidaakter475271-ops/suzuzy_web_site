'use client';

import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import {
    Upload,
    FileText,
    CheckCircle2,
    AlertTriangle,
    X,
    ArrowRight,
    Settings2,
    Info,
    RefreshCw,
    Database
} from 'lucide-react';
import { Button } from '@/components/service-admin/ui';
import { cn } from '@/lib/utils';
import { useInventoryStore } from '@/stores/service-admin/inventoryStore';
import { SyncPreviewResult, SyncPreviewRow, SyncOptions } from '@/types/service-admin/inventory';

interface ProductSyncWizardProps {
    onClose: () => void;
}

export const ProductSyncWizard: React.FC<ProductSyncWizardProps> = ({ onClose }) => {
    const { previewSync, executeSync, isLoading } = useInventoryStore();
    const [file, setFile] = useState<File | null>(null);
    const [step, setStep] = useState<'upload' | 'preview' | 'options' | 'result'>('upload');
    const [previewData, setPreviewData] = useState<SyncPreviewResult | null>(null);
    const [options, setOptions] = useState<SyncOptions>({
        update_stock: true,
        update_prices: true,
        create_bike_model_links: true
    });
    const [syncResult, setSyncResult] = useState<any>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleUpload(e.target.files[0]);
        }
    };

    const handleUpload = (file: File) => {
        setFile(file);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const data = await previewSync(results.data);
                if (data) {
                    setPreviewData(data);
                    setStep('preview');
                }
            }
        });
    };

    const handleExecute = async () => {
        if (!file) return;
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const data = await executeSync(results.data, options);
                if (data) {
                    setSyncResult(data);
                    setStep('result');
                } else {
                    alert("Sync failed or was interrupted. Check console or try again with a smaller file.");
                }
            }
        });
    };

    const getStatusBadge = (action: string) => {
        switch (action) {
            case 'CREATE': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 text-green-500">NEW</span>;
            case 'UPDATE': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-500">UPDATE</span>;
            default: return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-500/10 text-gray-400">SKIP</span>;
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-950 text-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <Database className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">Advanced Parts Sync</h2>
                        <p className="text-xs text-slate-400">Smart import from CSV with auto-categorization</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Stepper */}
            <div className="flex border-b border-slate-800">
                {['upload', 'preview', 'options', 'result'].map((s, i) => (
                    <div
                        key={s}
                        className={cn(
                            "flex-1 py-3 text-center text-xs font-medium border-b-2 transition-colors capitalize",
                            step === s ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-500"
                        )}
                    >
                        {i + 1}. {s}
                    </div>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {step === 'upload' && (
                    <div className="flex flex-col items-center justify-center h-full space-y-6">
                        <div
                            className={cn(
                                "w-full max-w-xl aspect-video border-2 border-dashed rounded-2xl flex flex-col items-center justify-center space-y-4 transition-all cursor-pointer",
                                isDragging ? "border-indigo-500 bg-indigo-500/5" : "border-slate-800 hover:border-slate-700 hover:bg-slate-900/50"
                            )}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => { e.preventDefault(); setIsDragging(false); if(e.dataTransfer.files[0]) handleUpload(e.dataTransfer.files[0]); }}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".csv" className="hidden" />
                            <div className="p-4 bg-slate-900 rounded-full">
                                <Upload className="w-8 h-8 text-slate-500" />
                            </div>
                            <div className="text-center">
                                <p className="font-semibold">Drop your categorized CSV here</p>
                                <p className="text-sm text-slate-500">or click to browse from files</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 w-full max-w-xl">
                            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl space-y-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <p className="text-xs font-medium">Smart Matching</p>
                                <p className="text-[10px] text-slate-500">Detects existing parts by number to prevent duplicates</p>
                            </div>
                            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl space-y-2">
                                <RefreshCw className="w-4 h-4 text-blue-400" />
                                <p className="text-xs font-medium">Auto Hierarchy</p>
                                <p className="text-[10px] text-slate-500">Creates categories and sub-categories automatically</p>
                            </div>
                            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl space-y-2">
                                <Settings2 className="w-4 h-4 text-amber-400" />
                                <p className="text-xs font-medium">Model Sync</p>
                                <p className="text-[10px] text-slate-500">Links parts to GIXXER, ACCESS and other bike models</p>
                            </div>
                        </div>
                    </div>
                )}

                {step === 'preview' && previewData && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-4 gap-4">
                            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">Total Rows</p>
                                <p className="text-2xl font-bold">{previewData.summary.total}</p>
                            </div>
                            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                                <p className="text-xs text-emerald-500/70 mb-1">New Products</p>
                                <p className="text-2xl font-bold text-emerald-400">{previewData.summary.new_products}</p>
                            </div>
                            <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                                <p className="text-xs text-blue-500/70 mb-1">Updates Found</p>
                                <p className="text-2xl font-bold text-blue-400">{previewData.summary.updates}</p>
                            </div>
                            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">Unchanged</p>
                                <p className="text-2xl font-bold">{previewData.summary.skipped}</p>
                            </div>
                        </div>

                        <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl flex items-start gap-3">
                            <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-indigo-300">New Metadata Detection</p>
                                <p className="text-xs text-indigo-400/80 mt-1">
                                    The sync detected <span className="font-bold">{previewData.summary.new_categories}</span> new categories
                                    and <span className="font-bold">{previewData.summary.new_bike_models}</span> new bike models to be created.
                                </p>
                            </div>
                        </div>

                        <div className="border border-slate-800 rounded-xl overflow-hidden">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead className="bg-slate-900 border-b border-slate-800">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Action</th>
                                        <th className="px-4 py-3 font-semibold">Part Number</th>
                                        <th className="px-4 py-3 font-semibold">Description</th>
                                        <th className="px-4 py-3 font-semibold">Model</th>
                                        <th className="px-4 py-3 font-semibold">Price/Loc</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {previewData.products.slice(0, 15).map((p, idx) => (
                                        <tr key={idx} className="hover:bg-slate-900/50">
                                            <td className="px-4 py-3">{getStatusBadge(p.action)}</td>
                                            <td className="px-4 py-3 font-mono text-indigo-300">{p.part_number || 'N/A'}</td>
                                            <td className="px-4 py-3 max-w-xs truncate">{p.description}</td>
                                            <td className="px-4 py-3">{p.bike_model}</td>
                                            <td className="px-4 py-3">
                                                {p.is_location_code ? (
                                                    <span className="text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">LOC: {p.price}</span>
                                                ) : p.price}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {previewData.products.length > 15 && (
                                <div className="p-3 bg-slate-900/30 text-center text-slate-500 border-t border-slate-800">
                                    + {previewData.products.length - 15} more rows detected
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {step === 'options' && (
                    <div className="max-w-xl mx-auto space-y-8 py-8">
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-bold">Sync Configuration</h3>
                            <p className="text-sm text-slate-400">Control how the data should be integrated into your inventory</p>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-5 bg-slate-900 border border-slate-800 rounded-2xl">
                                <div className="space-y-1">
                                    <p className="font-semibold">Update Stock Quantities</p>
                                    <p className="text-xs text-slate-500">Overwrite current stock levels with values from CSV</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={options.update_stock}
                                    onChange={(e) => setOptions({...options, update_stock: e.target.checked})}
                                    className="w-5 h-5 accent-indigo-500"
                                />
                            </div>
                            <div className="flex items-center justify-between p-5 bg-slate-900 border border-slate-800 rounded-2xl">
                                <div className="space-y-1">
                                    <p className="font-semibold">Update Prices</p>
                                    <p className="text-xs text-slate-500">Update product prices (only for rows with valid numeric price)</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={options.update_prices}
                                    onChange={(e) => setOptions({...options, update_prices: e.target.checked})}
                                    className="w-5 h-5 accent-indigo-500"
                                />
                            </div>
                            <div className="flex items-center justify-between p-5 bg-slate-900 border border-slate-800 rounded-2xl">
                                <div className="space-y-1">
                                    <p className="font-semibold">Auto-link Bike Models</p>
                                    <p className="text-xs text-slate-500">Create compatibility mapping for parts to specific bikes</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={options.create_bike_model_links}
                                    onChange={(e) => setOptions({...options, create_bike_model_links: e.target.checked})}
                                    className="w-5 h-5 accent-indigo-500"
                                />
                            </div>
                        </div>
                        <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                            <p className="text-xs text-amber-500/80">
                                <span className="font-bold">Caution:</span> Location codes (like A-2-5) found in price column will automatically be
                                moved to warehouse bin tracking, and product price for those will be set to 0.
                            </p>
                        </div>
                    </div>
                )}

                {step === 'result' && syncResult && (
                    <div className="flex flex-col items-center justify-center h-full space-y-8 text-center">
                        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-2">
                            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-white">Sync Completed Successfully</h3>
                            <p className="text-slate-400">Your inventory has been updated with the latest parts data</p>
                        </div>
                        <div className="grid grid-cols-3 gap-8 w-full max-w-lg p-8 bg-slate-900 border border-slate-800 rounded-3xl">
                            <div className="space-y-1 text-center">
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">New Added</p>
                                <p className="text-4xl font-black text-indigo-400">{syncResult.created}</p>
                            </div>
                            <div className="space-y-1 text-center border-x border-slate-800">
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Updated</p>
                                <p className="text-4xl font-black text-blue-400">{syncResult.updated}</p>
                            </div>
                            <div className="space-y-1 text-center">
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">No Change</p>
                                <p className="text-4xl font-black text-slate-400">{syncResult.skipped}</p>
                            </div>
                        </div>
                        <Button onClick={onClose} className="bg-indigo-600 hover:bg-indigo-700 h-12 px-10 rounded-xl text-lg font-bold">
                            View Product Catalog
                        </Button>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50">
                {step === 'upload' && (
                    <Button variant="ghost" onClick={onClose} className="border-slate-800">Cancel</Button>
                )}
                {step === 'preview' && (
                    <>
                        <Button variant="ghost" onClick={() => setStep('upload')} className="border-slate-800">Back</Button>
                        <Button onClick={() => setStep('options')} className="bg-indigo-600 hover:bg-indigo-700 group">
                            Continue to Options <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </>
                )}
                {step === 'options' && (
                    <>
                        <Button variant="ghost" onClick={() => setStep('preview')} className="border-slate-800">Back</Button>
                        <Button
                            onClick={handleExecute}
                            disabled={isLoading}
                            className="bg-indigo-600 hover:bg-indigo-700 min-w-[120px]"
                        >
                            {isLoading ? "Executing..." : "Start Sync Now"}
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
};
