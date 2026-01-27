"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    UserPlus, ArrowLeft, Loader2, Bike,
    Hash, Phone, User, CheckCircle2, AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function CustomerRegistration() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [bikeModels, setBikeModels] = useState<{ id: string, name: string }[]>([]);
    const [formData, setFormData] = useState({
        customer_name: "",
        phone_number: "",
        engine_number: "",
        chassis_number: "",
        model_id: ""
    });

    useEffect(() => {
        const fetchModels = async () => {
            const { data } = await supabase.from('bike_models').select('id, name').eq('is_active', true);
            if (data) setBikeModels(data);
        };
        fetchModels();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const { error } = await supabase
            .from('service_vehicles')
            .insert([formData]);

        if (error) {
            if (error.code === '23505') {
                toast.error("Engine or Chassis number already exists");
            } else {
                toast.error(error.message);
            }
        } else {
            toast.success("Customer registered successfully");
            router.push('/service-admin');
        }
        setIsLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <Button
                variant="ghost"
                onClick={() => router.back()}
                className="text-white/40 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 -ml-4"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                BACK TO COMMAND CENTER
            </Button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Card className="bg-[#0D0D12] border-[#D4AF37]/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                    <CardHeader className="border-b border-white/5 pb-6">
                        <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center mb-4">
                            <UserPlus className="w-6 h-6 text-[#D4AF37]" />
                        </div>
                        <CardTitle className="text-2xl font-display text-[#F8F8F8]">Register New Entity</CardTitle>
                        <CardDescription className="text-white/40">Initialize a new customer and vehicle record in the system.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Customer Name */}
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">FullName</Label>
                                    <div className="relative group">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#D4AF37] transition-colors" />
                                        <Input
                                            required
                                            value={formData.customer_name}
                                            onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                            placeholder="Enter customer name"
                                            className="bg-white/[0.03] border-white/5 pl-10 focus:border-[#D4AF37]/40 h-11"
                                        />
                                    </div>
                                </div>

                                {/* Phone Number */}
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Contact Number</Label>
                                    <div className="relative group">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#D4AF37] transition-colors" />
                                        <Input
                                            required
                                            value={formData.phone_number}
                                            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                            placeholder="01XXXXXXXXX"
                                            className="bg-white/[0.03] border-white/5 pl-10 focus:border-[#D4AF37]/40 h-11"
                                        />
                                    </div>
                                </div>

                                {/* Engine Number */}
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Engine Number</Label>
                                    <div className="relative group">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#D4AF37] transition-colors" />
                                        <Input
                                            required
                                            value={formData.engine_number}
                                            onChange={(e) => setFormData({ ...formData, engine_number: e.target.value })}
                                            placeholder="Ex: E12345"
                                            className="bg-white/[0.03] border-white/5 pl-10 focus:border-[#D4AF37]/40 h-11 uppercase font-mono"
                                        />
                                    </div>
                                </div>

                                {/* Chassis Number */}
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Chassis Number</Label>
                                    <div className="relative group">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#D4AF37] transition-colors" />
                                        <Input
                                            required
                                            value={formData.chassis_number}
                                            onChange={(e) => setFormData({ ...formData, chassis_number: e.target.value })}
                                            placeholder="Ex: C67890"
                                            className="bg-white/[0.03] border-white/5 pl-10 focus:border-[#D4AF37]/40 h-11 uppercase font-mono"
                                        />
                                    </div>
                                </div>

                                {/* Bike Model Selection */}
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Bike Model</Label>
                                    <Select
                                        required
                                        value={formData.model_id}
                                        onValueChange={(v) => setFormData({ ...formData, model_id: v })}
                                    >
                                        <SelectTrigger className="bg-white/[0.03] border-white/5 h-11 focus:ring-[#D4AF37]/20">
                                            <div className="flex items-center gap-2">
                                                <Bike className="w-4 h-4 text-[#D4AF37]" />
                                                <SelectValue placeholder="Select vehicle model" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#0D0D12] border-white/10 text-white">
                                            {bikeModels.map(model => (
                                                <SelectItem key={model.id} value={model.id} className="hover:bg-[#D4AF37]/10 focus:bg-[#D4AF37]/10 focus:text-[#D4AF37]">
                                                    {model.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-bold text-sm tracking-widest shadow-[0_4px_20px_rgba(212,175,55,0.2)]"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        INITIALIZING RECORD...
                                    </>
                                ) : (
                                    "REGISTER & PROCEED"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Info Guide */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#10B981] mt-0.5" />
                        <div>
                            <p className="text-xs font-bold text-white/80">Validation</p>
                            <p className="text-[10px] text-white/40">Real-time check for duplicate identifiers.</p>
                        </div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
                        <Bike className="w-5 h-5 text-[#D4AF37] mt-0.5" />
                        <div>
                            <p className="text-xs font-bold text-white/80">Asset Link</p>
                            <p className="text-[10px] text-white/40">Direct linkage to Suzuki master catalogs.</p>
                        </div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                        <div>
                            <p className="text-xs font-bold text-white/80">Assistance</p>
                            <p className="text-[10px] text-white/40">Contact HQ for missing bike models.</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
