"use client";

import React, { use, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
    User, Bike, MapPin, ShieldCheck,
    ChevronRight, ChevronLeft, CheckCircle2,
    Loader2, AlertCircle, Phone, Mail, Lock
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const registrationSchema = z.object({
    name: z.string().min(2, "Name is too short"),
    phone: z.string().min(10, "Valid phone number is required"),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    nid: z.string().optional(),
    profession: z.string().optional(),
    dateOfBirth: z.string().optional(),
    gender: z.string().optional(),
    division: z.string().min(1, "Division is required"),
    district: z.string().min(1, "District is required"),
    thana: z.string().min(1, "Thana is required"),
    postOffice: z.string().optional(),
    village: z.string().optional(),
    houseRoad: z.string().optional(),
    modelId: z.string().uuid("Please select a bike model"),
    engineNumber: z.string().min(5, "Engine number is required"),
    chassisNumber: z.string().min(5, "Chassis number is required"),
    regNo: z.string().optional(),
    color: z.string().optional(),
    dateOfPurchase: z.string().optional(),
    purchaseFrom: z.string().optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type FormData = z.infer<typeof registrationSchema>;

export default function CustomerRegistrationPage({ params }: { params: Promise<{ code: string }> }) {
    const { code } = use(params);
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Validate QR Code and get Dealer info
    const { data: qrData, isLoading: isValidating, error: qrError } = useQuery({
        queryKey: ["validate-qr", code],
        queryFn: async () => {
            const res = await axios.get(`/api/v1/public/qr-validate?code=${code}`);
            return res.data.data;
        },
        retry: false
    });

    // Fetch Bike Models
    const { data: bikeModels } = useQuery({
        queryKey: ["public-bike-models"],
        queryFn: async () => {
            const res = await axios.get("/api/v1/public/bike-models");
            return res.data.data as { id: string, name: string, code: string }[];
        },
        enabled: !!qrData
    });

    const form = useForm<FormData>({
        resolver: zodResolver(registrationSchema),
        defaultValues: {
            gender: "Male",
            dateOfPurchase: new Date().toISOString().split('T')[0]
        }
    });

    const onSubmit = async (values: FormData) => {
        setIsSubmitting(true);
        try {
            const payload = {
                qrSecret: code,
                customer: {
                    name: values.name,
                    phone: values.phone,
                    email: values.email,
                    password: values.password,
                    nid: values.nid,
                    profession: values.profession,
                    dateOfBirth: values.dateOfBirth,
                    gender: values.gender,
                },
                address: {
                    division: values.division,
                    district: values.district,
                    thana: values.thana,
                    postOffice: values.postOffice,
                    village: values.village,
                    houseRoad: values.houseRoad,
                },
                vehicle: {
                    modelId: values.modelId,
                    engineNumber: values.engineNumber,
                    chassisNumber: values.chassisNumber,
                    regNo: values.regNo,
                    color: values.color,
                    dateOfPurchase: values.dateOfPurchase,
                    purchaseFrom: values.purchaseFrom || qrData?.dealer?.business_name,
                }
            };

            await axios.post("/api/v1/public/register", payload);
            toast.success("Registration successful! You can now login.");
            setStep(5); // Success step
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Registration failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = async () => {
        let fieldsToValidate: (keyof FormData)[] = [];
        if (step === 1) fieldsToValidate = ["name", "phone", "email", "nid"];
        if (step === 2) fieldsToValidate = ["division", "district", "thana"];
        if (step === 3) fieldsToValidate = ["modelId", "engineNumber", "chassisNumber"];

        const isValid = await form.trigger(fieldsToValidate);
        if (isValid) setStep(step + 1);
    };

    if (isValidating) {
        return (
            <div className="bg-white dark:bg-dark-card rounded-[2.5rem] p-12 shadow-2xl flex flex-col items-center justify-center space-y-4">
                <Loader2 size={48} className="animate-spin text-brand" />
                <p className="font-bold text-slate-500">Verifying registration link...</p>
            </div>
        );
    }

    if (qrError || !qrData) {
        return (
            <div className="bg-white dark:bg-dark-card rounded-[2.5rem] p-12 shadow-2xl text-center space-y-6">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto text-danger">
                    <AlertCircle size={40} />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Invalid Link</h2>
                    <p className="text-slate-500 mt-2">This registration link is invalid or has expired. Please contact the showroom for a new QR code.</p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-brand text-white px-8 py-3 rounded-2xl font-bold hover:bg-brand-dark transition-all"
                >
                    Try Again
                </button>
            </div>
        );
    }

    const { dealer } = qrData;

    return (
        <div className="bg-white dark:bg-dark-card rounded-[2.5rem] shadow-2xl border-2 border-slate-100 dark:border-dark-border overflow-hidden">
            {/* Dealer Banner */}
            <div className="bg-brand p-8 text-white flex items-center gap-6">
                {dealer.logo_url ? (
                    <img src={dealer.logo_url} alt={dealer.business_name} className="w-16 h-16 rounded-2xl bg-white object-contain p-2" />
                ) : (
                    <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center font-black text-2xl italic">S</div>
                )}
                <div>
                    <h1 className="text-xl font-black italic uppercase tracking-tight">{dealer.business_name}</h1>
                    <p className="text-white/70 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                        <MapPin size={12} /> {dealer.city} Center
                    </p>
                </div>
            </div>

            {step < 5 && (
                <div className="p-8">
                    {/* Progress Bar */}
                    <div className="flex justify-between mb-10 px-4">
                        {[1, 2, 3, 4].map((s) => (
                            <div key={s} className="flex flex-col items-center gap-2 relative">
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all duration-500 z-10",
                                    step >= s ? "bg-brand text-white shadow-lg shadow-brand/20" : "bg-slate-100 dark:bg-dark-page text-slate-400"
                                )}>
                                    {step > s ? <CheckCircle2 size={20} /> : s}
                                </div>
                                <p className={cn(
                                    "text-[10px] font-black uppercase tracking-tighter",
                                    step >= s ? "text-brand" : "text-slate-400"
                                )}>
                                    {s === 1 ? "User" : s === 2 ? "Address" : s === 3 ? "Vehicle" : "Secure"}
                                </p>
                                {s < 4 && (
                                    <div className={cn(
                                        "absolute top-5 left-10 w-full h-[2px] -z-0",
                                        step > s ? "bg-brand" : "bg-slate-100 dark:bg-dark-page"
                                    )} style={{ width: 'calc(100% + 2rem)' }} />
                                )}
                            </div>
                        ))}
                    </div>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {step === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <User className="text-brand" /> Personal Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-500">Full Name *</label>
                                        <input {...form.register("name")} className="w-full bg-slate-50 dark:bg-dark-page border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-brand font-bold text-sm" placeholder="e.g. John Doe" />
                                        {form.formState.errors.name && <p className="text-xs text-danger font-bold">{form.formState.errors.name.message}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-500">Phone Number *</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <input {...form.register("phone")} className="w-full bg-slate-50 dark:bg-dark-page border-none rounded-2xl pl-12 pr-5 py-3.5 focus:ring-2 focus:ring-brand font-bold text-sm" placeholder="01712xxxxxx" />
                                        </div>
                                        {form.formState.errors.phone && <p className="text-xs text-danger font-bold">{form.formState.errors.phone.message}</p>}
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-500">Email Address (Optional)</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input {...form.register("email")} className="w-full bg-slate-50 dark:bg-dark-page border-none rounded-2xl pl-12 pr-5 py-3.5 focus:ring-2 focus:ring-brand font-bold text-sm" placeholder="john@example.com" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-500">NID / ID Number</label>
                                        <input {...form.register("nid")} className="w-full bg-slate-50 dark:bg-dark-page border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-brand font-bold text-sm" placeholder="National ID" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-500">Profession</label>
                                        <input {...form.register("profession")} className="w-full bg-slate-50 dark:bg-dark-page border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-brand font-bold text-sm" placeholder="e.g. Engineer" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <MapPin className="text-brand" /> Address Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-500">Division *</label>
                                        <input {...form.register("division")} className="w-full bg-slate-50 dark:bg-dark-page border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-brand font-bold text-sm" placeholder="Dhaka" />
                                        {form.formState.errors.division && <p className="text-xs text-danger font-bold">{form.formState.errors.division.message}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-500">District *</label>
                                        <input {...form.register("district")} className="w-full bg-slate-50 dark:bg-dark-page border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-brand font-bold text-sm" placeholder="Dhaka" />
                                        {form.formState.errors.district && <p className="text-xs text-danger font-bold">{form.formState.errors.district.message}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-500">Thana *</label>
                                        <input {...form.register("thana")} className="w-full bg-slate-50 dark:bg-dark-page border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-brand font-bold text-sm" placeholder="Gulshan" />
                                        {form.formState.errors.thana && <p className="text-xs text-danger font-bold">{form.formState.errors.thana.message}</p>}
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-500">Village / Road / House *</label>
                                    <input {...form.register("houseRoad")} className="w-full bg-slate-50 dark:bg-dark-page border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-brand font-bold text-sm" placeholder="House 12, Road 5, Block C" />
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <Bike className="text-brand" /> Vehicle Information
                                </h3>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-500">Bike Model *</label>
                                    <select
                                        {...form.register("modelId")}
                                        className="w-full bg-slate-50 dark:bg-dark-page border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-brand font-bold text-sm appearance-none"
                                    >
                                        <option value="">Select a Model</option>
                                        {bikeModels?.map((m) => (
                                            <option key={m.id} value={m.id}>{m.name} ({m.code})</option>
                                        ))}
                                    </select>
                                    {form.formState.errors.modelId && <p className="text-xs text-danger font-bold">{form.formState.errors.modelId.message}</p>}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-500">Engine Number *</label>
                                        <input {...form.register("engineNumber")} className="w-full bg-slate-50 dark:bg-dark-page border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-brand font-bold text-sm uppercase" placeholder="ENG123456" />
                                        {form.formState.errors.engineNumber && <p className="text-xs text-danger font-bold">{form.formState.errors.engineNumber.message}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-500">Chassis Number *</label>
                                        <input {...form.register("chassisNumber")} className="w-full bg-slate-50 dark:bg-dark-page border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-brand font-bold text-sm uppercase" placeholder="CHAS123456" />
                                        {form.formState.errors.chassisNumber && <p className="text-xs text-danger font-bold">{form.formState.errors.chassisNumber.message}</p>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-500">Registration No (If available)</label>
                                        <input {...form.register("regNo")} className="w-full bg-slate-50 dark:bg-dark-page border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-brand font-bold text-sm" placeholder="Dhaka Metro LA-1234" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-slate-500">Color</label>
                                        <input {...form.register("color")} className="w-full bg-slate-50 dark:bg-dark-page border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-brand font-bold text-sm" placeholder="e.g. Metallic Black" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <ShieldCheck className="text-brand" /> Account Setup
                                </h3>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-500">Create Password *</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="password"
                                            {...form.register("password")}
                                            className="w-full bg-slate-50 dark:bg-dark-page border-none rounded-2xl pl-12 pr-5 py-3.5 focus:ring-2 focus:ring-brand font-bold text-sm"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    {form.formState.errors.password && <p className="text-xs text-danger font-bold">{form.formState.errors.password.message}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-500">Confirm Password *</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="password"
                                            {...form.register("confirmPassword")}
                                            className="w-full bg-slate-50 dark:bg-dark-page border-none rounded-2xl pl-12 pr-5 py-3.5 focus:ring-2 focus:ring-brand font-bold text-sm"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    {form.formState.errors.confirmPassword && <p className="text-xs text-danger font-bold">{form.formState.errors.confirmPassword.message}</p>}
                                </div>
                                <div className="p-4 bg-brand-soft rounded-2xl text-xs font-bold text-brand leading-relaxed">
                                    By registering, you agree to the dealership terms of service. You will be able to track your service history and book appointments instantly.
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4 pt-6">
                            {step > 1 && (
                                <button
                                    type="button"
                                    onClick={() => setStep(step - 1)}
                                    className="px-8 py-4 rounded-2xl bg-slate-100 dark:bg-dark-page text-slate-500 font-black flex items-center gap-2 hover:bg-slate-200 transition-all"
                                >
                                    <ChevronLeft size={20} /> Back
                                </button>
                            )}
                            {step < 4 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="flex-1 bg-brand text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-brand-dark transition-all shadow-xl shadow-brand/20"
                                >
                                    Continue <ChevronRight size={20} />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 bg-brand text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-brand-dark transition-all shadow-xl shadow-brand/20 disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                                    {isSubmitting ? "Processing..." : "Complete Registration"}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            )}

            {step === 5 && (
                <div className="p-12 text-center space-y-8 animate-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto text-emerald-500">
                        <CheckCircle2 size={48} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white">Welcome Aboard!</h2>
                        <p className="text-slate-500 mt-3 font-medium">Your account has been created successfully. You can now login to the customer portal and track your bike's service status.</p>
                    </div>
                    <div className="pt-4">
                        <button
                            onClick={() => router.push("/login")}
                            className="bg-brand text-white px-10 py-4 rounded-2xl font-black hover:bg-brand-dark transition-all shadow-2xl shadow-brand/20 active:scale-95"
                        >
                            Log In to Dashboard
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
