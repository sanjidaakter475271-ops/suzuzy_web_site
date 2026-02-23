'use client';

import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Upload, FileText, CheckCircle2, AlertTriangle, X, ArrowRight, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface CSVImportPanelProps {
    onImport: (data: any[]) => void;
    onClose: () => void;
    templateFields?: string[]; // e.g., ["name", "sku", "price"]
}

export const CSVImportPanel: React.FC<CSVImportPanelProps> = ({ onImport, onClose, templateFields }) => {
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [step, setStep] = useState<'upload' | 'preview'>('upload');
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            parseFile(e.target.files[0]);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type === "text/csv" || droppedFile.name.endsWith('.csv')) {
                parseFile(droppedFile);
            } else {
                alert("Please upload a CSV file.");
            }
        }
    };

    const parseFile = (file: File) => {
        setFile(file);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                setHeaders(results.meta.fields || []);
                setPreviewData(results.data.slice(0, 5)); // Preview first 5
                setStep('preview');
            },
            error: (error: Error) => { // Explicitly type error
                console.error("CSV Parse Error:", error);
                alert("Failed to parse CSV file.");
            }
        });
    };

    const handleImport = () => {
        if (!file) return;
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                onImport(results.data);
                onClose();
            }
        });
    };

    const reset = () => {
        setFile(null);
        setPreviewData([]);
        setStep('upload');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="flex flex-col h-full">
            {step === 'upload' ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
                    <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        className={cn(
                            "w-full h-64 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all cursor-pointer bg-surface-page/50 dark:bg-dark-page/50",
                            isDragging ? "border-brand bg-brand/5 scale-[1.02]" : "border-surface-border dark:border-dark-border hover:border-brand/50 hover:bg-surface-hover/50"
                        )}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="w-16 h-16 rounded-full bg-surface-border dark:bg-dark-border flex items-center justify-center mb-4 text-brand">
                            <Upload size={32} />
                        </div>
                        <h3 className="text-sm font-black uppercase text-ink-heading dark:text-white tracking-widest">
                            {isDragging ? "Drop file here" : "Click to upload or drag & drop"}
                        </h3>
                        <p className="text-xs text-ink-muted mt-2">.CSV format only (Max 5MB)</p>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept=".csv"
                        className="hidden"
                    />

                    {templateFields && (
                        <div className="bg-brand/5 border border-brand/10 p-4 rounded-xl text-left w-full max-w-sm">
                            <p className="text-[10px] font-black uppercase text-brand tracking-widest mb-2">Required Columns</p>
                            <div className="flex flex-wrap gap-2">
                                {templateFields.map(f => (
                                    <span key={f} className="text-xs bg-white dark:bg-dark-card px-2 py-1 rounded border border-brand/20 text-ink-muted font-mono">
                                        {f}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto space-y-6">
                    {/* File Info */}
                    <div className="flex items-center justify-between p-4 bg-surface-page dark:bg-dark-page rounded-2xl border border-surface-border dark:border-dark-border">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
                                <FileSpreadsheet size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-ink-heading dark:text-white line-clamp-1">{file?.name}</p>
                                <p className="text-xs text-ink-muted">{(file!.size / 1024).toFixed(1)} KB</p>
                            </div>
                        </div>
                        <button onClick={reset} className="p-2 hover:bg-surface-hover dark:hover:bg-white/5 rounded-full transition-colors text-ink-muted">
                            <X size={16} />
                        </button>
                    </div>

                    {/* Preview Table */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-black uppercase tracking-widest text-ink-muted">Data Preview (First 5 Rows)</h4>
                        <div className="border border-surface-border dark:border-dark-border rounded-xl overflow-hidden overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-surface-page dark:bg-dark-page">
                                    <tr>
                                        {headers.map((h) => (
                                            <th key={h} className="px-3 py-2 font-bold text-ink-heading dark:text-white border-b border-surface-border dark:border-dark-border uppercase tracking-wide whitespace-nowrap">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-border dark:divide-dark-border">
                                    {previewData.map((row, i) => (
                                        <tr key={i} className="hover:bg-surface-hover/30 dark:hover:bg-white/5">
                                            {headers.map((h) => (
                                                <td key={`${i}-${h}`} className="px-3 py-2 text-ink-muted whitespace-nowrap">
                                                    {row[h]}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="text-[10px] text-ink-muted flex items-center gap-1">
                            <AlertTriangle size={10} className="text-warning" />
                            Ensure column names match required fields for correct mapping.
                        </p>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <Button variant="outline" className="flex-1 rounded-xl h-12 font-bold" onClick={reset}>
                            Cancel
                        </Button>
                        <Button className="flex-1 rounded-xl h-12 font-bold shadow-lg shadow-brand/20 gap-2" onClick={handleImport}>
                            <CheckCircle2 size={16} />
                            Start Import
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
