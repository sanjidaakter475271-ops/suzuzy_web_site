"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import QRCode from "qrcode";
import {
    QrCode, Plus, Download, Printer,
    RefreshCw, CheckCircle2, History
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface WorkshopQRCode {
    id: string;
    dealer_id: string;
    qr_secret: string;
    label: string | null;
    is_active: boolean;
    created_at: string;
    qr_content: string;
}

export default function QRCodesPage() {
    const queryClient = useQueryClient();
    const [qrImages, setQrImages] = useState<Record<string, string>>({});

    const { data: qrCodes, isLoading } = useQuery({
        queryKey: ["workshop-qr-codes"],
        queryFn: async () => {
            const res = await axios.get("/api/v1/workshop/qr-code");
            return res.data.data as WorkshopQRCode[];
        }
    });

    const generateMutation = useMutation({
        mutationFn: async (label: string) => {
            const res = await axios.post("/api/v1/workshop/qr-code", { label });
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workshop-qr-codes"] });
            toast.success("New workshop QR code generated dynamically.");
        },
        onError: () => toast.error("Failed to generate QR code")
    });

    useEffect(() => {
        if (!qrCodes) return;

        const generateImages = async () => {
            const newImages: Record<string, string> = {};
            for (const code of qrCodes) {
                try {
                    const url = await QRCode.toDataURL(code.qr_content, {
                        width: 500,
                        margin: 2,
                        color: {
                            dark: '#0f172a',
                            light: '#ffffff'
                        }
                    });
                    newImages[code.id] = url;
                } catch (err) {
                    console.error("Failed to generate QR Image", err);
                }
            }
            setQrImages(newImages);
        };

        generateImages();
    }, [qrCodes]);

    const activeCodes = qrCodes?.filter(c => c.is_active) || [];
    const archivedCodes = qrCodes?.filter(c => !c.is_active) || [];

    const handlePrint = (qrContentUrl: string, label: string) => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                <head>
                    <title>Print Workshop QR - ${label}</title>
                    <style>
                        body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                        h1 { font-size: 2.5rem; text-transform: uppercase; letter-spacing: 0.1em; color: #1e293b; margin-bottom: 2rem; }
                        img { width: 500px; height: 500px; max-width: 90vw; border: 4px solid #1e293b; border-radius: 2rem; padding: 2rem; }
                        p { font-size: 1.5rem; color: #475569; margin-top: 2rem; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <h1>${label || 'Main Workshop'}</h1>
                    <img src="${qrContentUrl}" alt="QR Code" />
                    <p>Scan to Clock In/Out using ServiceStuff Mobile App</p>
                    <script>
                        window.onload = () => { window.print(); window.close(); }
                    </script>
                </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <QrCode className="text-brand" size={32} />
                        Workshop QR Codes
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Manage attendance QR codes for your Service Center.</p>
                </div>

                <button
                    onClick={() => {
                        const label = prompt("Enter a label (e.g., 'Main Bay', 'Engine Room'):");
                        if (label !== null) {
                            generateMutation.mutate(label || 'Main Workshop');
                        }
                    }}
                    disabled={generateMutation.isPending}
                    className="flex items-center gap-2 bg-brand text-white px-5 py-2.5 rounded-xl font-bold hover:bg-brand-dark transition-all active:scale-95 shadow-lg shadow-brand/20 disabled:opacity-50"
                >
                    {generateMutation.isPending ? <RefreshCw className="animate-spin" size={20} /> : <Plus size={20} />}
                    Generate New QR Code
                </button>
            </div>

            {isLoading ? (
                <div className="py-32 flex flex-col items-center justify-center text-slate-400">
                    <RefreshCw className="animate-spin mb-4 text-brand" size={40} />
                    <p className="font-medium text-lg">Loading QR Codes...</p>
                </div>
            ) : (
                <>
                    {/* Active QR Codes */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-6">
                            <CheckCircle2 className="text-emerald-500" size={24} />
                            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Active Workshop Cards</h2>
                            <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-xs font-black">{activeCodes.length}</span>
                        </div>

                        {activeCodes.length === 0 ? (
                            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center flex flex-col items-center">
                                <QrCode size={48} className="text-slate-300 mb-4" />
                                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No Active QR Codes</h3>
                                <p className="text-slate-500 max-w-sm font-medium">Generate your first Workshop QR code so your technicians can clock in using the mobile app.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {activeCodes.map(code => (
                                    <motion.div
                                        key={code.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border-2 border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-brand/30 transition-all group overflow-hidden relative"
                                    >
                                        <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />

                                        <div className="flex justify-between items-start mb-6 pt-2">
                                            <div>
                                                <h3 className="font-black text-xl text-slate-900 dark:text-white">{code.label || "Main Workshop"}</h3>
                                                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                                                    Created {format(new Date(code.created_at), "MMM dd, yyyy")}
                                                </p>
                                            </div>
                                            <span className="bg-emerald-500 inline-flex w-3 h-3 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                        </div>

                                        <div className="bg-slate-50 dark:bg-slate-800 rounded-3xl p-6 flex justify-center border border-slate-100 dark:border-slate-700 mb-6 group-hover:bg-slate-100 dark:group-hover:bg-slate-700/50 transition-colors">
                                            {qrImages[code.id] ? (
                                                <img
                                                    src={qrImages[code.id]}
                                                    alt={code.label || "QR Code"}
                                                    className="w-48 h-48 object-contain mix-blend-multiply dark:mix-blend-screen bg-transparent rounded-2xl group-hover:scale-[1.02] transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-48 h-48 flex items-center justify-center bg-slate-200 animate-pulse rounded-2xl" />
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => {
                                                    const link = document.createElement('a');
                                                    link.download = `workshop-qr-${code.label || 'main'}.png`;
                                                    link.href = qrImages[code.id];
                                                    link.click();
                                                }}
                                                className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-3 rounded-xl font-bold transition-colors"
                                            >
                                                <Download size={18} /> Download
                                            </button>
                                            <button
                                                onClick={() => handlePrint(qrImages[code.id], code.label || 'Main Workshop')}
                                                className="flex items-center justify-center gap-2 bg-brand text-white hover:bg-brand-dark py-3 rounded-xl font-bold transition-colors shadow-lg shadow-brand/20"
                                            >
                                                <Printer size={18} /> Print Now
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Archived QR Codes */}
                    {archivedCodes.length > 0 && (
                        <div className="mt-16 border-t border-slate-200 dark:border-slate-800 pt-10">
                            <div className="flex items-center gap-3 mb-6">
                                <History className="text-slate-400" size={24} />
                                <h2 className="text-xl font-bold tracking-tight text-slate-700 dark:text-slate-300">Deactivated QR Codes</h2>
                                <span className="bg-slate-200 dark:bg-slate-800 text-slate-500 px-3 py-1 rounded-full text-xs font-black">{archivedCodes.length}</span>
                            </div>

                            <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Label</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Secret Hash</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Created Date</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {archivedCodes.map(code => (
                                            <tr key={code.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">{code.label || "Main Workshop"}</td>
                                                <td className="px-6 py-4 font-mono text-xs text-slate-400">{code.qr_secret.split('-')[0]}***</td>
                                                <td className="px-6 py-4 text-sm text-slate-500 font-medium">{format(new Date(code.created_at), "MMM dd, yyyy HH:mm")}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 dark:bg-slate-800">
                                                        Deactivated
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
