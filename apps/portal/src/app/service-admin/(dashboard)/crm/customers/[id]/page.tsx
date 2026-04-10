"use client";

import React, { use, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
    User, Bike, History, Wallet, Phone, Mail, MapPin,
    Calendar, Briefcase, FileText, ChevronRight, ArrowLeft,
    Clock, Wrench, CheckCircle2, AlertCircle, TrendingUp,
    MessageSquare, Star
} from "lucide-react";
import { format } from "date-fns";
import Breadcrumb from "@/components/service-admin/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/service-admin/ui";
import { cn } from "@/lib/utils";
import { CustomerDetail, ServiceHistoryEntry } from "@/types/service-admin/customer-detail";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("overview");

    const { data: customer, isLoading, error } = useQuery({
        queryKey: ["customer-detail", id],
        queryFn: async () => {
            const res = await axios.get(`/api/v1/crm/customers/${id}`);
            return res.data.data as CustomerDetail & { history: ServiceHistoryEntry[] };
        }
    });

    if (isLoading) {
        return (
            <div className="p-6 lg:p-8 space-y-8 animate-pulse">
                <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="flex justify-between items-center">
                    <div className="space-y-2">
                        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded" />
                        <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                    <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                    <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                </div>
                <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            </div>
        );
    }

    if (error || !customer) {
        return (
            <div className="p-6 lg:p-8 flex flex-col items-center justify-center h-[70vh] space-y-4">
                <AlertCircle size={48} className="text-danger" />
                <h2 className="text-xl font-bold">Customer Not Found</h2>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    const tabs = [
        { id: "overview", label: "Overview", icon: User },
        { id: "vehicles", label: "Vehicles", icon: Bike },
        { id: "history", label: "Service History", icon: History },
        { id: "financials", label: "Financials", icon: Wallet },
        { id: "complaints", label: "Complaints & Rating", icon: MessageSquare },
    ];

    return (
        <div className="p-6 lg:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                    <Breadcrumb
                        items={[
                            { label: "CRM", href: "/service-admin/crm" },
                            { label: "Customers", href: "/service-admin/crm/customers" },
                            { label: customer.name }
                        ]}
                    />
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-surface-hover dark:hover:bg-dark-border rounded-full transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-3xl font-black text-ink-heading dark:text-white">{customer.name}</h1>
                        <span className="px-3 py-1 bg-brand-soft text-brand text-xs font-black uppercase rounded-full">
                            Customer
                        </span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2">
                        <FileText size={18} />
                        Export Data
                    </Button>
                    <Button className="gap-2">
                        <Wrench size={18} />
                        Create Ticket
                    </Button>
                </div>
            </div>

            {/* KPI Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-brand to-brand-hover text-white border-none shadow-brand/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-white/70 text-sm font-bold uppercase tracking-wider">Total Revenue</p>
                            <h3 className="text-3xl font-black mt-1">৳{customer.totalSpent.toLocaleString()}</h3>
                        </div>
                        <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                            <TrendingUp size={24} />
                        </div>
                    </CardContent>
                </Card>
                <Card className="transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-ink-muted text-sm font-bold uppercase tracking-wider">Service Count</p>
                            <div className="flex items-baseline gap-2 mt-1">
                                <h3 className="text-3xl font-black text-ink-heading dark:text-white">{customer.totalServices}</h3>
                                <span className="text-xs font-bold text-ink-muted">Total</span>
                            </div>
                        </div>
                        <div className="p-4 bg-brand-soft rounded-2xl group-hover:bg-brand group-hover:text-white transition-all">
                            <History size={24} className="text-brand group-hover:text-white" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-ink-muted text-sm font-bold uppercase tracking-wider">Free Services</p>
                            <div className="flex items-baseline gap-2 mt-1">
                                <h3 className="text-3xl font-black text-emerald-500">{customer.usedFreeServices}/{customer.totalFreeServices}</h3>
                                <span className="text-xs font-bold text-ink-muted">Used</span>
                            </div>
                        </div>
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition-all">
                            <CheckCircle2 size={24} className="text-emerald-500 group-hover:text-white" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-ink-muted text-sm font-bold uppercase tracking-wider">Remaining Free</p>
                            <h3 className="text-3xl font-black mt-1 text-amber-500">{customer.remainingFreeServices}</h3>
                        </div>
                        <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-2xl group-hover:bg-amber-500 group-hover:text-white transition-all">
                            <Clock size={24} className="text-amber-500 group-hover:text-white" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-ink-muted text-sm font-bold uppercase tracking-wider">Paid Services</p>
                            <h3 className="text-3xl font-black mt-1 text-ink-heading dark:text-white">{customer.totalPaidServices}</h3>
                        </div>
                        <div className="p-4 bg-brand-soft rounded-2xl group-hover:bg-brand group-hover:text-white transition-all">
                            <Wallet size={24} className="text-brand group-hover:text-white" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group border-red-100 hover:border-danger transition-all">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-ink-muted text-sm font-bold uppercase tracking-wider">Outstanding</p>
                            <h3 className="text-3xl font-black mt-1 text-danger">৳{customer.outstandingBalance.toLocaleString()}</h3>
                        </div>
                        <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-2xl group-hover:bg-danger group-hover:text-white transition-all">
                            <AlertCircle size={24} className="text-danger group-hover:text-white" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-ink-muted text-sm font-bold uppercase tracking-wider">Active Vehicles</p>
                            <h3 className="text-3xl font-black mt-1 text-ink-heading dark:text-white">{customer.vehicles.length}</h3>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-dark-border rounded-2xl group-hover:bg-ink-heading group-hover:text-white transition-all">
                            <Bike size={24} className="text-ink-muted group-hover:text-white" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <div className="space-y-6">
                    <div className="flex gap-2 p-1.5 bg-surface-page dark:bg-dark-page rounded-2xl inline-flex transition-all duration-500">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 transform",
                                    activeTab === tab.id
                                        ? "bg-white dark:bg-dark-card text-brand shadow-soft scale-105"
                                        : "text-ink-muted hover:text-ink-heading dark:hover:text-white hover:bg-white/50 dark:hover:bg-dark-card/50 hover:scale-105"
                                )}
                            >
                                <tab.icon size={18} className={cn("transition-transform duration-300", activeTab === tab.id && "scale-110")} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                <div className="min-h-[400px]">
                    {activeTab === "overview" && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle>Personal Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-1">
                                            <p className="text-xs font-black uppercase text-ink-muted">Full Name</p>
                                            <p className="text-lg font-bold text-ink-heading dark:text-white">{customer.name}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-black uppercase text-ink-muted">Phone Number</p>
                                            <p className="text-lg font-bold text-ink-heading dark:text-white flex items-center gap-2">
                                                <Phone size={16} className="text-brand" />
                                                {customer.phone}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-black uppercase text-ink-muted">Email Address</p>
                                            <p className="text-lg font-bold text-ink-heading dark:text-white flex items-center gap-2">
                                                <Mail size={16} />
                                                {customer.email || "N/A"}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-black uppercase text-ink-muted">Customer Since</p>
                                            <p className="text-lg font-bold text-ink-heading dark:text-white flex items-center gap-2">
                                                <Calendar size={16} />
                                                {customer.createdAt ? format(new Date(customer.createdAt), "PPP") : "N/A"}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-black uppercase text-ink-muted">Profession</p>
                                            <p className="text-lg font-bold text-ink-heading dark:text-white">{customer.profession || "N/A"}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-black uppercase text-ink-muted">Gender / DOB</p>
                                            <p className="text-lg font-bold text-ink-heading dark:text-white">
                                                {customer.gender || "N/A"} • {customer.dateOfBirth ? format(new Date(customer.dateOfBirth), "PP") : "N/A"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-surface-border dark:border-dark-border/50">
                                        <h4 className="font-bold text-brand mb-4 flex items-center gap-2">
                                            <MapPin size={18} />
                                            Permanent Address
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase text-ink-muted">Division / District</p>
                                                <p className="text-sm font-bold text-ink-heading dark:text-white">
                                                    {customer.permanentAddress?.division || "N/A"} / {customer.permanentAddress?.district || "N/A"}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase text-ink-muted">Thana / Post Office</p>
                                                <p className="text-sm font-bold text-ink-heading dark:text-white">
                                                    {customer.permanentAddress?.thana || "N/A"} / {customer.permanentAddress?.postOffice || "N/A"}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase text-ink-muted">Village / Road</p>
                                                <p className="text-sm font-bold text-ink-heading dark:text-white">
                                                    {customer.permanentAddress?.village || "N/A"} {customer.permanentAddress?.houseRoad}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Current Address</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex gap-3">
                                            <MapPin className="text-brand shrink-0" size={20} />
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-ink-heading dark:text-white">
                                                    {customer.presentAddress?.address_line1}
                                                </p>
                                                <p className="text-xs text-ink-muted">
                                                    {customer.presentAddress?.city}, {customer.presentAddress?.district} {customer.presentAddress?.postal_code}
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="outline" className="w-full text-xs">Edit Address</Button>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Customer ID (NID)</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="bg-surface-page dark:bg-dark-page p-4 rounded-xl border border-dashed border-surface-border dark:border-dark-border">
                                            <p className="text-center font-black text-xl tracking-widest text-ink-heading dark:text-white">
                                                {customer.nid || "NOT PROVIDED"}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {activeTab === "vehicles" && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {customer.vehicles?.map((v) => (
                                <Card key={v.id} className="group hover:border-brand transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-brand-soft rounded-2xl group-hover:bg-brand group-hover:text-white transition-all duration-300 group-hover:rotate-6">
                                                <Bike size={24} />
                                            </div>
                                            <div>
                                                <CardTitle>{v.modelName}</CardTitle>
                                                <p className="text-xs font-bold text-brand uppercase mt-0.5">{v.regNo || "UNREGISTERED"}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-ink-muted uppercase">Purchase Date</p>
                                            <p className="text-xs font-bold">{v.purchaseDate ? format(new Date(v.purchaseDate), "PP") : "N/A"}</p>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 bg-surface-page dark:bg-dark-page rounded-xl">
                                                <p className="text-[10px] font-black text-ink-muted uppercase">Chassis Number</p>
                                                <p className="text-sm font-bold tracking-wider">{v.chassisNumber}</p>
                                            </div>
                                            <div className="p-3 bg-surface-page dark:bg-dark-page rounded-xl">
                                                <p className="text-[10px] font-black text-ink-muted uppercase">Engine Number</p>
                                                <p className="text-sm font-bold tracking-wider">{v.engineNumber}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <p className="text-sm font-bold text-ink-heading dark:text-white">Free Service Plan</p>
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded text-[10px] font-black uppercase",
                                                    v.servicePlan?.isActive ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10" : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                                                )}>
                                                    {v.servicePlan?.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </div>

                                            {v.servicePlan ? (
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-xs font-bold">
                                                        <span className="text-ink-muted">Used: {v.servicePlan.usedFreeServices}</span>
                                                        <span className="text-brand">Remaining: {v.servicePlan.remainingFreeServices}</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-brand transition-all duration-1000"
                                                            style={{ width: `${(v.servicePlan.usedFreeServices / v.servicePlan.totalFreeServices) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-ink-muted italic">No active free service plan for this vehicle.</p>
                                            )}
                                        </div>

                                        <div className="pt-4 border-t border-surface-border dark:border-dark-border/50 flex justify-between items-center">
                                            <p className="text-xs font-bold text-ink-muted">
                                                Purchase From: <span className="text-ink-heading dark:text-white">{v.purchaseFrom || "N/A"}</span>
                                            </p>
                                            <Button variant="ghost" className="text-xs p-0 h-auto gap-1">
                                                View Details <ChevronRight size={14} />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {activeTab === "history" && (
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Service Record Timeline</CardTitle>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5 text-xs font-bold">
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Free
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs font-bold">
                                        <span className="w-2.5 h-2.5 rounded-full bg-brand" /> Paid
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-surface-border dark:border-dark-border/50">
                                                <th className="pb-4 font-black uppercase text-[10px] text-ink-muted">Seq</th>
                                                <th className="pb-4 font-black uppercase text-[10px] text-ink-muted">Date</th>
                                                <th className="pb-4 font-black uppercase text-[10px] text-ink-muted">Vehicle</th>
                                                <th className="pb-4 font-black uppercase text-[10px] text-ink-muted">Technician</th>
                                                <th className="pb-4 font-black uppercase text-[10px] text-ink-muted">Type / Status</th>
                                                <th className="pb-4 font-black uppercase text-[10px] text-ink-muted">Mileage</th>
                                                <th className="pb-4 font-black uppercase text-[10px] text-ink-muted">Cost</th>
                                                <th className="pb-4 font-black uppercase text-[10px] text-ink-muted">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-surface-border dark:divide-dark-border/50">
                                            {customer.history && customer.history.length > 0 ? (
                                                customer.history.map((h) => (
                                                    <tr key={h.id} className="group hover:bg-brand-soft/30 dark:hover:bg-brand/10 transition-all duration-300 cursor-default hover:scale-[1.002]">
                                                        <td className="py-4">
                                                            <span className="w-8 h-8 rounded-lg bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border flex items-center justify-center font-black text-xs text-ink-muted">
                                                                #{h.serviceSequence || "-"}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 font-bold text-sm">
                                                            {format(new Date(h.serviceDate), "dd MMM yyyy")}
                                                        </td>
                                                        <td className="py-4">
                                                            <div className="flex items-center gap-2">
                                                                <Bike size={14} className="text-brand" />
                                                                <span className="text-sm font-bold">{h.vehicleName}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-ink-heading dark:text-white">
                                                                    {h.technicians && h.technicians.length > 0
                                                                        ? h.technicians.join(", ")
                                                                        : h.technicianName || "N/A"}
                                                                </span>
                                                                <span className="text-[10px] text-ink-muted uppercase">
                                                                    {h.technicians && h.technicians.length > 1 ? "Technicians" : "Technician"}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4">
                                                            <div className="flex flex-col gap-1">
                                                                <span className={cn(
                                                                    "px-2 py-0.5 rounded text-[10px] font-black uppercase w-fit",
                                                                    h.serviceType === "free" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10" : "bg-brand-soft text-brand"
                                                                )}>
                                                                    {h.serviceType}
                                                                </span>
                                                                <span className="text-[10px] font-bold text-ink-muted uppercase">
                                                                    {h.status?.replace('_', ' ')}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 text-sm font-bold text-ink-muted">
                                                            {h.mileage?.toLocaleString() || "-"} km
                                                        </td>
                                                        <td className="py-4 font-black text-sm text-ink-heading dark:text-white">
                                                            ৳{h.totalCost.toLocaleString()}
                                                        </td>
                                                        <td className="py-4">
                                                            <Button variant="ghost" className="p-2 h-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <ChevronRight size={16} />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={7} className="py-20 text-center space-y-2">
                                                        <History size={40} className="mx-auto text-slate-200" />
                                                        <p className="text-ink-muted font-bold">No service records found.</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "financials" && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-xs font-black uppercase text-ink-muted">Total Outstanding</p>
                                                <h3 className="text-3xl font-black mt-1 text-danger">৳{customer.outstandingBalance.toLocaleString()}</h3>
                                            </div>
                                            <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-2xl">
                                                <AlertCircle size={24} className="text-danger" />
                                            </div>
                                        </div>
                                        <Button className="w-full mt-6 bg-danger hover:bg-danger/90">Pay Now</Button>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-xs font-black uppercase text-ink-muted">Average Ticket Value</p>
                                                <h3 className="text-3xl font-black mt-1 text-ink-heading dark:text-white">
                                                    ৳{customer.totalServices > 0 ? Math.round(customer.totalSpent / customer.totalServices).toLocaleString() : "0"}
                                                </h3>
                                            </div>
                                            <div className="p-4 bg-brand-soft rounded-2xl">
                                                <TrendingUp size={24} className="text-brand" />
                                            </div>
                                        </div>
                                        <Button variant="outline" className="w-full mt-6">Financial Analytics</Button>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Invoices</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {customer.invoices && customer.invoices.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="border-b border-surface-border dark:border-dark-border/50">
                                                        <th className="pb-4 font-black uppercase text-[10px] text-ink-muted">Inv #</th>
                                                        <th className="pb-4 font-black uppercase text-[10px] text-ink-muted">Date</th>
                                                        <th className="pb-4 font-black uppercase text-[10px] text-ink-muted">Amount</th>
                                                        <th className="pb-4 font-black uppercase text-[10px] text-ink-muted">Due</th>
                                                        <th className="pb-4 font-black uppercase text-[10px] text-ink-muted">Status</th>
                                                        <th className="pb-4 font-black uppercase text-[10px] text-ink-muted">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-surface-border dark:divide-dark-border/50">
                                                    {customer.invoices?.map((inv) => (
                                                        <tr key={inv.id} className="group hover:bg-brand-soft/30 dark:hover:bg-brand/10 transition-all duration-300 cursor-default hover:scale-[1.002]">
                                                            <td className="py-4 font-bold text-sm text-brand group-hover:underline transition-all">{inv.invoiceNumber}</td>
                                                            <td className="py-4 text-sm font-bold">
                                                                {format(new Date(inv.invoiceDate), "dd MMM yyyy")}
                                                            </td>
                                                            <td className="py-4 font-black text-sm">৳{inv.grandTotal.toLocaleString()}</td>
                                                            <td className="py-4 font-bold text-sm text-danger">৳{inv.dueAmount.toLocaleString()}</td>
                                                            <td className="py-4">
                                                                <span className={cn(
                                                                    "px-2 py-0.5 rounded text-[10px] font-black uppercase",
                                                                    inv.paymentStatus === "paid" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10" :
                                                                    inv.paymentStatus === "partial" ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10" :
                                                                    "bg-red-50 text-red-600 dark:bg-red-500/10"
                                                                )}>
                                                                    {inv.paymentStatus}
                                                                </span>
                                                            </td>
                                                            <td className="py-4">
                                                                <Button variant="ghost" className="p-2 h-auto">
                                                                    <FileText size={16} />
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 bg-surface-page dark:bg-dark-page rounded-2xl border border-dashed border-surface-border dark:border-dark-border">
                                            <Wallet size={40} className="mx-auto text-slate-200 mb-2" />
                                            <p className="text-ink-muted font-bold">No recent invoices found.</p>
                                            <Button variant="ghost" className="mt-2 text-brand font-black">View All Bills</Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                    {activeTab === "complaints" && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Complaints Section */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-black text-ink-heading dark:text-white flex items-center gap-2">
                                        <MessageSquare size={24} className="text-brand" />
                                        Customer Complaints
                                    </h3>
                                    <Button variant="outline" className="text-[10px] px-2 py-1 font-black uppercase">Log New</Button>
                                </div>

                                {customer.complaints && customer.complaints.length > 0 ? (
                                    <div className="space-y-4">
                                        {customer.complaints.map((c) => (
                                            <Card key={c.id} className="transition-all duration-300 hover:scale-[1.01] hover:shadow-md border-l-4 border-l-brand">
                                                <CardContent className="p-5">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="space-y-1">
                                                            <p className="font-bold text-ink-heading dark:text-white">{c.subject}</p>
                                                            <p className="text-[10px] text-ink-muted font-black uppercase">
                                                                {format(new Date(c.createdAt), "PPP")}
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <span className={cn(
                                                                "px-2 py-0.5 rounded text-[10px] font-black uppercase",
                                                                c.priority === "high" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                                                            )}>
                                                                {c.priority}
                                                            </span>
                                                            <span className={cn(
                                                                "px-2 py-0.5 rounded text-[10px] font-black uppercase",
                                                                c.status === "open" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                                                            )}>
                                                                {c.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" className="w-full text-xs h-8 border border-dashed border-surface-border hover:border-brand">
                                                        View Conversation
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-20 text-center bg-surface-page dark:bg-dark-page rounded-2xl border border-dashed border-surface-border">
                                        <MessageSquare size={40} className="mx-auto text-slate-200 mb-2" />
                                        <p className="text-ink-muted font-bold">No active complaints found.</p>
                                    </div>
                                )}
                            </div>

                            {/* Ratings Section */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-black text-ink-heading dark:text-white flex items-center gap-2">
                                    <Star size={24} className="text-amber-500" />
                                    Service Feedback
                                </h3>

                                {customer.ratings && customer.ratings.length > 0 ? (
                                    <div className="space-y-4">
                                        {customer.ratings.map((r) => (
                                            <Card key={r.id} className="transition-all duration-300 hover:scale-[1.01] hover:shadow-md">
                                                <CardContent className="p-5">
                                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={cn("w-4 h-4 transition-all duration-300", i < r.rating ? "fill-amber-500 text-amber-500 scale-110" : "text-slate-100")}
                                                />
                                            ))}
                                        </div>
                                                        <p className="text-[10px] font-black text-brand uppercase">Ticket: {r.ticketNumber || "N/A"}</p>
                                                    </div>
                                                    <p className="text-sm text-ink-muted italic mb-4 leading-relaxed">
                                                        "{r.comment || "No comment provided."}"
                                                    </p>
                                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-surface-border dark:border-dark-border/50">
                                                        <div>
                                                            <p className="text-[10px] font-black text-ink-muted uppercase">Staff Conduct</p>
                                                            <div className="flex gap-0.5 mt-1">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <div key={i} className={cn("h-1 w-4 rounded-full", i < r.staffRating ? "bg-emerald-500" : "bg-slate-100")} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-ink-muted uppercase">Timing & Speed</p>
                                                            <div className="flex gap-0.5 mt-1">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <div key={i} className={cn("h-1 w-4 rounded-full", i < r.timingRating ? "bg-amber-500" : "bg-slate-100")} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-20 text-center bg-surface-page dark:bg-dark-page rounded-2xl border border-dashed border-surface-border">
                                        <Star size={40} className="mx-auto text-slate-200 mb-2" />
                                        <p className="text-ink-muted font-bold">No service feedback yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
