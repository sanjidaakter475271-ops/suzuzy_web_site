"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import QRCode from "qrcode";
import {
    QrCode, Plus, Download, Printer,
    RefreshCw, CheckCircle2, History,
    UserPlus, ShieldCheck, ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/service-admin/ui";
import Link from "next/link";

interface QRCodeBase {
    id: string;
    dealer_id: string;
    qr_secret: string;
    label: string | null;
    is_active: boolean;
    created_at: string;
    qr_content: string;
}

interface WorkshopQRCode extends QRCodeBase {}
interface CustomerQRCode extends QRCodeBase {
    scan_count: number;
}

export default function QRCodesPage() {
    const queryClient = useQueryClient();
    const [qrImages, setQrImages] = useState<Record<string, string>>({});
    const [activeTab, setActiveTab] = useState<"workshop" | "customer">("workshop");

    // Workshop QR Codes Query
    const { data: workshopQRs, isLoading: isLoadingWorkshop } = useQuery({
        queryKey: ["workshop-qr-codes"],
        queryFn: async () => {
            const res = await axios.get("/api/v1/workshop/qr-code");
            return res.data.data as WorkshopQRCode[];
        }
    });

    // Customer Registration QR Codes Query
    const { data: customerQRs, isLoading: isLoadingCustomer } = useQuery({
        queryKey: ["customer-qr-codes"],
        queryFn: async () => {
            const res = await axios.get("/api/v1/crm/qr-codes");
            return res.data.data as CustomerQRCode[];
        }
    });

    const generateWorkshopMutation = useMutation({
        mutationFn: async (label: string) => {
            const res = await axios.post("/api/v1/workshop/qr-code", { label });
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workshop-qr-codes"] });
            toast.success("New workshop QR code generated.");
        },
        onError: () => toast.error("Failed to generate Workshop QR code")
    });

    const generateCustomerMutation = useMutation({
        mutationFn: async (label: string) => {
            const res = await axios.post("/api/v1/crm/qr-codes", { label });
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customer-qr-codes"] });
            toast.success("New customer registration QR code generated.");
        },
        onError: () => toast.error("Failed to generate Customer QR code")
    });

    useEffect(() => {
        const allCodes = [...(workshopQRs || []), ...(customerQRs || [])];
        if (allCodes.length === 0) return;

        const generateImages = async () => {
            const newImages: Record<string, string> = { ...qrImages };
            for (const code of allCodes) {
                if (newImages[code.id]) continue;
                try {
                    // For customer QR, we want the URL to point to the registration page
                    const content = activeTab === "customer" && (customerQRs || []).some(c => c.id === code.id)
                        ? `${window.location.origin}/register/customer/${code.qr_secret}`
                        : code.qr_content;

                    const url = await QRCode.toDataURL(content, {
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
    }, [workshopQRs, customerQRs, activeTab]);

    const activeWorkshopCodes = workshopQRs?.filter(c => c.is_active) || [];
    const activeCustomerCodes = customerQRs?.filter(c => c.is_active) || [];

    const handlePrint = (qrContentUrl: string, label: string, type: string) => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                <head>
                    <title>Print ${type} QR - ${label}</title>
                    <style>
                        body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                        h1 { font-size: 2.5rem; text-transform: uppercase; letter-spacing: 0.1em; color: #1e293b; margin-bottom: 0.5rem; }
                        h2 { font-size: 1.2rem; color: #64748b; margin-bottom: 2rem; text-transform: uppercase; }
                        img { width: 500px; height: 500px; max-width: 90vw; border: 4px solid #1e293b; border-radius: 2rem; padding: 2rem; }
                        p { font-size: 1.5rem; color: #475569; margin-top: 2rem; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <h1>${label || 'Main Center'}</h1>
                    <h2>${type === 'workshop' ? 'Workshop Attendance' : 'Customer Registration'}</h2>
                    <img src="${qrContentUrl}" alt="QR Code" />
                    <p>${type === 'workshop'
                        ? 'Scan to Clock In/Out using ServiceStuff Mobile App'
                        : 'Scan to Register your vehicle at Royal Suzuky'}</p>
                    <script>
                        window.onload = () => { window.print(); window.close(); }
                    </script>
                </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    const isGenerating = generateWorkshopMutation.isPending || generateCustomerMutation.isPending;
    const isLoading = isLoadingWorkshop || isLoadingCustomer;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <QrCode className="text-brand" size={32} />
                        Identity & Access QR Codes
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Generate and manage digital access points for your workshop.</p>
                </div>

                <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                    <button
                        onClick={() => setActiveTab("workshop")}
                        className={cn(
                            "px-5 py-2 rounded-xl font-bold text-sm transition-all",
                            activeTab === "workshop"
                                ? "bg-white dark:bg-slate-700 text-brand shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        Workshop
                    </button>
                    <button
                        onClick={() => setActiveTab("customer")}
                        className={cn(
                            "px-5 py-2 rounded-xl font-bold text-sm transition-all",
                            activeTab === "customer"
                                ? "bg-white dark:bg-slate-700 text-brand shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        Customers
                    </button>
                </div>
            </div>

            {/* Quick Stats & Action */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                <Card className="lg:col-span-2 bg-brand/5 border-brand/10">
                    <CardContent className="p-6 flex items-center gap-6">
                        <div className="p-4 bg-brand text-white rounded-2xl shadow-lg shadow-brand/20">
                            {activeTab === "workshop" ? <ShieldCheck size={32} /> : <UserPlus size={32} />}
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white">
                                {activeTab === "workshop" ? "Workshop Attendance QR" : "Customer Registration QR"}
                            </h3>
                            <p className="text-sm text-slate-500 font-medium">
                                {activeTab === "workshop"
                                    ? "Technicians scan these to log their shifts and time entries."
                                    : "Place these at the reception for new customers to self-register."}
                            </p>
                        </div>
                        <div className="ml-auto">
                            <button
                                onClick={() => {
                                    const label = prompt(`Enter a label for this ${activeTab} QR:`);
                                    if (label) {
                                        if (activeTab === "workshop") generateWorkshopMutation.mutate(label);
                                        else generateCustomerMutation.mutate(label);
                                    }
                                }}
                                disabled={isGenerating}
                                className="bg-brand text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-brand-dark transition-all active:scale-95 shadow-xl shadow-brand/20 disabled:opacity-50"
                            >
                                {isGenerating ? <RefreshCw className="animate-spin" size={20} /> : <Plus size={20} />}
                                Generate
                            </button>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-slate-50 dark:border-slate-800 shadow-sm text-center">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active</p>
                        <h4 className="text-2xl font-black text-brand mt-1">
                            {activeTab === "workshop" ? activeWorkshopCodes.length : activeCustomerCodes.length}
                        </h4>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-slate-50 dark:border-slate-800 shadow-sm text-center">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                            {activeTab === "workshop" ? "Sessions Today" : "Total Scans"}
                        </p>
                        <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                            {activeTab === "workshop" ? "24" : activeCustomerCodes.reduce((sum, c) => sum + c.scan_count, 0)}
                        </h4>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="py-32 flex flex-col items-center justify-center text-slate-400">
                    <RefreshCw className="animate-spin mb-4 text-brand" size={40} />
                    <p className="font-medium text-lg">Syncing QR Database...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {(activeTab === "workshop" ? activeWorkshopCodes : activeCustomerCodes).length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800">
                             <QrCode size={64} className="mx-auto text-slate-200 mb-4" />
                             <h3 className="text-xl font-bold text-slate-400 uppercase tracking-tighter">Empty Records</h3>
                        </div>
                    ) : (activeTab === "workshop" ? activeWorkshopCodes : activeCustomerCodes).map(code => (
                        <motion.div
                            key={code.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border-2 border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none hover:border-brand transition-all group relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="font-black text-2xl text-slate-900 dark:text-white leading-none">{code.label}</h3>
                                    <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">
                                        Added {format(new Date(code.created_at), "MMM dd")}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse mb-2 shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                                    {activeTab === "customer" && (
                                        <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg text-slate-500">
                                            {(code as CustomerQRCode).scan_count} SCANS
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-8 flex justify-center border-2 border-slate-100 dark:border-slate-700/50 mb-8 group-hover:bg-slate-100 dark:group-hover:bg-slate-700 transition-colors">
                                {qrImages[code.id] ? (
                                    <img
                                        src={qrImages[code.id]}
                                        alt={code.label || "QR Code"}
                                        className="w-52 h-52 object-contain mix-blend-multiply dark:mix-blend-screen bg-transparent rounded-2xl group-hover:scale-105 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-52 h-52 flex items-center justify-center bg-slate-200 animate-pulse rounded-2xl" />
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.download = `${activeTab}-qr-${code.label}.png`;
                                        link.href = qrImages[code.id];
                                        link.click();
                                    }}
                                    className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-4 rounded-2xl font-black text-sm transition-all"
                                >
                                    <Download size={20} /> Save
                                </button>
                                <button
                                    onClick={() => handlePrint(qrImages[code.id], code.label || '', activeTab)}
                                    className="flex items-center justify-center gap-2 bg-brand text-white hover:bg-brand-dark py-4 rounded-2xl font-black text-sm transition-all shadow-xl shadow-brand/20"
                                >
                                    <Printer size={20} /> Print
                                </button>
                            </div>

                            {activeTab === "customer" && (
                                <Link
                                    href={`/register/customer/${code.qr_secret}`}
                                    target="_blank"
                                    className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-brand transition-colors"
                                >
                                    <ExternalLink size={14} /> Open Link
                                </Link>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
