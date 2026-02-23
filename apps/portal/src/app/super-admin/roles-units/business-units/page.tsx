"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Building2, MoreHorizontal, Check, X, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/ui/premium/GlassCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface BusinessUnit {
    id: string;
    name: string;
    code: string;
    unit_type: string;
    is_active: boolean;
    created_at: string;
    _count?: {
        business_unit_users: number;
    }
}

export default function BusinessUnitsPage() {
    const [units, setUnits] = useState<BusinessUnit[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [creating, setCreating] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        unit_type: "showroom"
    });

    const fetchUnits = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/super-admin/business-units');
            if (!res.ok) throw new Error("Registry retrieval failure");
            const data = await res.json();
            setUnits(data || []);
        } catch (error) {
            console.error("Error fetching units:", error);
            toast.error("Failed to load business units");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUnits();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);

        try {
            const res = await fetch('/api/super-admin/business-units', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error("Initialization failure");

            toast.success("Business Unit initialized successfully");
            setIsCreateOpen(false);
            setFormData({ name: "", code: "", unit_type: "showroom" });
            fetchUnits();
        } catch (error) {
            console.error("Error creating unit:", error);
            toast.error("Failed to create business unit");
        } finally {
            setCreating(false);
        }
    };

    const filteredUnits = units.filter(unit =>
        unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#D4AF37] transition-colors" />
                    <Input
                        placeholder="Search units..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 h-12 bg-white/5 border-white/10 focus:border-[#D4AF37]/50 focus:bg-white/10 rounded-xl text-white placeholder:text-white/20"
                    />
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-12 px-6 bg-[#D4AF37] hover:bg-[#B8860B] text-[#0D0D0F] font-bold uppercase tracking-wider rounded-xl">
                            <Plus className="w-4 h-4 mr-2" />
                            Initialize Unit
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#1A1A1C] border-[#D4AF37]/20 text-white sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-display font-black italic text-[#F8F8F8]">
                                INITIALIZE <span className="text-[#D4AF37]">BUSINESS UNIT</span>
                            </DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleCreate} className="space-y-6 mt-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase font-bold text-[#D4AF37]">Unit Name</Label>
                                    <Input
                                        placeholder="e.g. Dhaka North Showroom"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="bg-white/5 border-white/10 focus:border-[#D4AF37]/50"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase font-bold text-[#D4AF37]">Unit Code</Label>
                                        <Input
                                            placeholder="e.g. DHK-N"
                                            value={formData.code}
                                            onChange={e => setFormData({ ...formData, code: e.target.value })}
                                            className="bg-white/5 border-white/10 focus:border-[#D4AF37]/50 uppercase"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase font-bold text-[#D4AF37]">Type</Label>
                                        <Select
                                            value={formData.unit_type}
                                            onValueChange={val => setFormData({ ...formData, unit_type: val })}
                                        >
                                            <SelectTrigger className="bg-white/5 border-white/10 focus:border-[#D4AF37]/50 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#1A1A1C] border-[#D4AF37]/20 text-white">
                                                <SelectItem value="showroom">Showroom</SelectItem>
                                                <SelectItem value="service_center">Service Center</SelectItem>
                                                <SelectItem value="warehouse">Warehouse</SelectItem>
                                                <SelectItem value="hq">Headquarters</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 bg-[#D4AF37] hover:bg-[#B8860B] text-[#0D0D0F] font-bold uppercase tracking-wider"
                                disabled={creating}
                            >
                                {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Initialization"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Content Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin" />
                </div>
            ) : filteredUnits.length === 0 ? (
                <GlassCard className="p-12 text-center border-dashed border-[#D4AF37]/20">
                    <Building2 className="w-12 h-12 text-white/10 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">No Business Units Found</h3>
                    <p className="text-white/40 text-sm">Initialize a new unit to get started.</p>
                </GlassCard>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredUnits.map((unit, index) => (
                        <motion.div
                            key={unit.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <GlassCard className="p-6 h-full flex flex-col justify-between group hover:border-[#D4AF37]/30 transition-all">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-[#D4AF37]/10 rounded-xl text-[#D4AF37] group-hover:scale-110 transition-transform duration-500">
                                            <Building2 className="w-6 h-6" />
                                        </div>
                                        <Badge variant="outline" className={unit.is_active
                                            ? "border-green-500/20 text-green-500 bg-green-500/5"
                                            : "border-red-500/20 text-red-500 bg-red-500/5"
                                        }>
                                            {unit.is_active ? "ACTIVE" : "INACTIVE"}
                                        </Badge>
                                    </div>

                                    <h3 className="text-xl font-bold text-[#F8F8F8] mb-1">{unit.name}</h3>
                                    <p className="text-xs font-black text-[#D4AF37] uppercase tracking-widest mb-4">
                                        CODE: {unit.code}
                                    </p>

                                    <div className="space-y-2 text-sm text-white/40">
                                        <div className="flex justify-between">
                                            <span>Type</span>
                                            <span className="text-white capitalize">{unit.unit_type.replace('_', ' ')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Staff Count</span>
                                            <span className="text-white font-mono">{unit._count?.business_unit_users || 0}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-white/5 flex gap-2">
                                    <Button variant="ghost" className="flex-1 h-10 text-xs font-bold uppercase tracking-wider hover:bg-white/5">
                                        Manage
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 text-white/20 hover:text-white hover:bg-white/5">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
