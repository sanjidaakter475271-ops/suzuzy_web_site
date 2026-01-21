"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/ui/premium/GlassCard";
import { Settings2 } from "lucide-react";

interface AttributeField {
    id: string;
    label: string;
    type: 'text' | 'number' | 'select';
    placeholder?: string;
    options?: string[];
}

interface CategoryConfig {
    [categoryId: string]: AttributeField[];
}

const CATEGORY_ATTRIBUTES: CategoryConfig = {
    // Note: These IDs should ideally be fetched or known. 
    // For now, we'll map by common category names if IDs aren't static, 
    // but in a real app these would be DB UUIDs.
    "motorbikes": [
        { id: "engine_capacity", label: "Engine Displacement (CC)", type: "number", placeholder: "e.g. 150" },
        { id: "engine_type", label: "Engine Type", type: "text", placeholder: "e.g. Single Cylinder, 4-Stroke" },
        { id: "fuel_system", label: "Fuel System", type: "text", placeholder: "e.g. Carburetor / FI" },
        { id: "transmission", label: "Transmission", type: "text", placeholder: "e.g. 5-Speed Manual" },
    ],
    "apparel": [
        { id: "material", label: "Material", type: "text", placeholder: "e.g. Leather, Polyester" },
        { id: "style", label: "Style", type: "text", placeholder: "e.g. Racing, Casual" },
    ],
    "parts": [
        { id: "compatibility", label: "OEM Compatibility", type: "text", placeholder: "e.g. GSX-R150, Gixxer SF" },
        { id: "warranty", label: "Warranty Period", type: "text", placeholder: "e.g. 6 Months" },
    ]
};

interface AttributeFormProps {
    categoryId: string;
    categoryName: string;
    values: Record<string, any>;
    onChange: (id: string, value: any) => void;
}

export function AttributeForm({ categoryId, categoryName, values, onChange }: AttributeFormProps) {
    // Normalize category name for matching if ID is dynamic
    const normalizedName = categoryName.toLowerCase();
    const fields = CATEGORY_ATTRIBUTES[normalizedName] || CATEGORY_ATTRIBUTES[categoryId] || [];

    if (fields.length === 0) return null;

    return (
        <GlassCard className="p-8 border-[#D4AF37]/10">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
                    <Settings2 className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <h2 className="text-lg font-display font-bold text-white uppercase tracking-widest italic">Technical Specifications</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fields.map((field) => (
                    <div key={field.id} className="space-y-3">
                        <Label className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-widest ml-1">
                            {field.label}
                        </Label>
                        <Input
                            type={field.type}
                            value={values[field.id] || ""}
                            onChange={(e) => onChange(field.id, e.target.value)}
                            placeholder={field.placeholder}
                            className="h-14 bg-white/[0.03] border-white/10 rounded-xl focus:border-[#D4AF37]/50"
                        />
                    </div>
                ))}
            </div>
        </GlassCard>
    );
}
