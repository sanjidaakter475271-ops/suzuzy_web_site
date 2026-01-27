"use client";

import { useState } from "react";
import { Plus, Trash2, Layers } from "lucide-react";
import { GlassCard } from "@/components/ui/premium/GlassCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface VariantOption {
    type: string;
    values: string[];
}

export interface Variant {
    sku: string;
    barcode: string;
    attributes: Record<string, string>;
    price: number;
    stock: number;
    threshold: number;
}

interface VariantGeneratorProps {
    baseSku: string;
    basePrice: number;
    onUpdate: (variants: Variant[]) => void;
}

export function VariantGenerator({ baseSku, basePrice, onUpdate }: VariantGeneratorProps) {
    const [options, setOptions] = useState<VariantOption[]>([
        { type: "Size", values: [] },
        { type: "Color", values: [] }
    ]);
    const [variants, setVariants] = useState<Variant[]>([]);

    const addOptionValue = (index: number) => {
        const val = prompt(`Enter value for ${options[index].type}:`);
        if (!val) return;

        const newOptions = [...options];
        newOptions[index].values.push(val);
        setOptions(newOptions);
    };

    const generateVariants = () => {
        if (options.every(o => o.values.length === 0)) return;

        // Cartesian product of option values
        let combo: Record<string, string>[] = [{}];
        options.forEach(opt => {
            if (opt.values.length === 0) return;
            const nextCombo: Record<string, string>[] = [];
            combo.forEach(c => {
                opt.values.forEach(v => {
                    nextCombo.push({ ...c, [opt.type.toLowerCase()]: v });
                });
            });
            combo = nextCombo;
        });

        const newVariants = combo.map(c => {
            const attrString = Object.values(c).join("-");
            return {
                sku: `${baseSku}-${attrString}`.toUpperCase(),
                barcode: "",
                attributes: c,
                price: basePrice,
                stock: 0,
                threshold: 5
            };
        });

        setVariants(newVariants);
        onUpdate(newVariants);
    };

    const updateVariant = (idx: number, field: Exclude<keyof Variant, 'attributes' | 'barcode'>, value: string | number) => {
        const newVars = [...variants];
        const variant = newVars[idx];
        if (field === 'price' || field === 'stock' || field === 'threshold') {
            (variant as unknown as Record<string, number>)[field] = Number(value);
        } else {
            (variant as unknown as Record<string, string | number>)[field] = value;
        }
        setVariants(newVars);
        onUpdate(newVars);
    };

    return (
        <GlassCard className="p-8 border-[#D4AF37]/10">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
                    <Layers className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <h2 className="text-lg font-display font-bold text-white uppercase tracking-widest italic">Variant Engine</h2>
            </div>

            <div className="space-y-8">
                {/* Option Config */}
                <div className="grid md:grid-cols-2 gap-8">
                    {options.map((opt, idx) => (
                        <div key={idx} className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-widest">{opt.type} Matrix</label>
                                <Button size="sm" variant="ghost" onClick={() => addOptionValue(idx)} className="h-6 text-[9px] font-black uppercase tracking-widest text-[#D4AF37] hover:bg-[#D4AF37]/10">
                                    <Plus className="w-3 h-3 mr-1" /> Add Option
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 min-h-[44px] p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                {opt.values.map((v, i) => (
                                    <Badge key={i} className="bg-[#D4AF37]/10 border-[#D4AF37]/20 text-[#D4AF37] gap-2">
                                        {v}
                                        <Trash2 className="w-3 h-3 cursor-pointer opacity-50 hover:opacity-100" />
                                    </Badge>
                                ))}
                                {opt.values.length === 0 && <span className="text-[10px] text-white/10 uppercase font-black italic">No options defined</span>}
                            </div>
                        </div>
                    ))}
                </div>

                <Button
                    onClick={generateVariants}
                    className="w-full h-12 bg-white/5 border border-white/10 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/30 text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.2em]"
                >
                    Compute Variant Matrix
                </Button>

                {/* Variant List */}
                {variants.length > 0 && (
                    <div className="space-y-4 pt-4">
                        <div className="grid grid-cols-5 gap-4 px-4 text-[9px] font-black uppercase tracking-widest text-white/20">
                            <div className="col-span-1">Attributes</div>
                            <div className="col-span-1">SKU Protocol</div>
                            <div className="col-span-1">Price (৳)</div>
                            <div className="col-span-1">Stock</div>
                            <div className="col-span-1">Threshold</div>
                        </div>
                        <div className="space-y-2">
                            {variants.map((v, idx) => (
                                <div key={idx} className="grid grid-cols-5 gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5 items-center">
                                    <div className="flex gap-1 flex-wrap">
                                        {Object.entries(v.attributes).map(([k, val]) => (
                                            <Badge key={k} variant="outline" className="text-[8px] uppercase tracking-tighter border-white/10 text-white/40">
                                                {val}
                                            </Badge>
                                        ))}
                                    </div>
                                    <Input
                                        value={v.sku}
                                        onChange={(e) => updateVariant(idx, 'sku', e.target.value)}
                                        className="h-10 bg-black/20 border-white/5 text-[10px] font-mono"
                                    />
                                    <Input
                                        type="number"
                                        value={v.price}
                                        onChange={(e) => updateVariant(idx, 'price', Number(e.target.value))}
                                        className="h-10 bg-black/20 border-white/5 text-[10px] font-bold text-[#D4AF37]"
                                    />
                                    <Input
                                        type="number"
                                        value={v.stock}
                                        onChange={(e) => updateVariant(idx, 'stock', Number(e.target.value))}
                                        className="h-10 bg-black/20 border-white/5 text-[10px] font-bold"
                                    />
                                    <Input
                                        type="number"
                                        value={v.threshold}
                                        onChange={(e) => updateVariant(idx, 'threshold', Number(e.target.value))}
                                        className="h-10 bg-black/20 border-white/5 text-[10px] font-bold text-red-400"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </GlassCard>
    );
}
