"use client";

import { useState } from "react";
import {
    Calculator,
    Percent,
    DollarSign,
    Package,
    Scale,
    ArrowRight
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/premium/GlassCard";
import { cn } from "@/lib/utils";

export default function CalculatorToolsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-display font-black text-[#F8F8F8] italic uppercase tracking-tighter">Utility Calculators</h1>
                <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1">Quick Math Tools for Sales Operations</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <ProfitMarginCalculator />
                <DiscountCalculator />
                <BulkPricingCalculator />
                <CommissionSplitCalculator />
            </div>
        </div>
    );
}

function ProfitMarginCalculator() {
    const [cost, setCost] = useState<number | string>("");
    const [sell, setSell] = useState<number | string>("");

    const costNum = Number(cost);
    const sellNum = Number(sell);

    const profit = sellNum - costNum;
    const margin = sellNum > 0 ? (profit / sellNum) * 100 : 0;
    const markup = costNum > 0 ? (profit / costNum) * 100 : 0;

    return (
        <GlassCard className="p-6 border-white/5 bg-[#0D0D0F]">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#10B981]/10 rounded-lg">
                    <Scale className="w-5 h-5 text-[#10B981]" />
                </div>
                <div>
                    <h3 className="text-sm font-black text-[#F8F8F8] uppercase tracking-widest">Profit Margin</h3>
                    <p className="text-[10px] text-white/40 font-bold">Cost vs Revenue Analysis</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Cost Price</label>
                        <Input
                            type="number"
                            className="bg-white/5 border-white/10 font-mono text-sm"
                            value={cost}
                            onChange={(e) => setCost(e.target.value)}
                            placeholder="0.00"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Selling Price</label>
                        <Input
                            type="number"
                            className="bg-white/5 border-white/10 font-mono text-sm"
                            value={sell}
                            onChange={(e) => setSell(e.target.value)}
                            placeholder="0.00"
                        />
                    </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white/50 uppercase">Net Profit</span>
                        <span className={cn("text-lg font-black font-display tracking-tight", profit >= 0 ? "text-[#10B981]" : "text-red-500")}>
                            ৳{profit.toLocaleString()}
                        </span>
                    </div>
                    <div className="h-px bg-white/5" />
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white/50 uppercase">Margin %</span>
                        <span className="text-sm font-bold text-white">{margin.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white/50 uppercase">Markup %</span>
                        <span className="text-sm font-bold text-white">{markup.toFixed(2)}%</span>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
}

function DiscountCalculator() {
    const [original, setOriginal] = useState<number | string>("");
    const [discount, setDiscount] = useState<number | string>("");

    const origNum = Number(original);
    const discNum = Number(discount);

    const saved = (origNum * discNum) / 100;
    const final = origNum - saved;

    return (
        <GlassCard className="p-6 border-white/5 bg-[#0D0D0F]">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#F59E0B]/10 rounded-lg">
                    <Percent className="w-5 h-5 text-[#F59E0B]" />
                </div>
                <div>
                    <h3 className="text-sm font-black text-[#F8F8F8] uppercase tracking-widest">Discount Calc</h3>
                    <p className="text-[10px] text-white/40 font-bold">Promotion Impact</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">MRP</label>
                        <Input
                            type="number"
                            className="bg-white/5 border-white/10 font-mono text-sm"
                            value={original}
                            onChange={(e) => setOriginal(e.target.value)}
                            placeholder="0.00"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Discount %</label>
                        <Input
                            type="number"
                            className="bg-white/5 border-white/10 font-mono text-sm"
                            value={discount}
                            onChange={(e) => setDiscount(e.target.value)}
                            placeholder="0"
                        />
                    </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white/50 uppercase">You Save</span>
                        <span className="text-sm font-bold text-[#F59E0B]">
                            -৳{saved.toLocaleString()}
                        </span>
                    </div>
                    <div className="h-px bg-white/5" />
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white/50 uppercase">Final Price</span>
                        <span className="text-xl font-black font-display tracking-tight text-[#F8F8F8]">৳{final.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
}

function BulkPricingCalculator() {
    const [unit, setUnit] = useState<number | string>("");
    const [qty, setQty] = useState<number | string>("");

    const unitNum = Number(unit);
    const qtyNum = Number(qty);

    const total = unitNum * qtyNum;
    const dozen = unitNum * 12;

    return (
        <GlassCard className="p-6 border-white/5 bg-[#0D0D0F]">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#3B82F6]/10 rounded-lg">
                    <Package className="w-5 h-5 text-[#3B82F6]" />
                </div>
                <div>
                    <h3 className="text-sm font-black text-[#F8F8F8] uppercase tracking-widest">Bulk Pricing</h3>
                    <p className="text-[10px] text-white/40 font-bold">Quantity Estimation</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Unit Price</label>
                        <Input
                            type="number"
                            className="bg-white/5 border-white/10 font-mono text-sm"
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            placeholder="0.00"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Quantity</label>
                        <Input
                            type="number"
                            className="bg-white/5 border-white/10 font-mono text-sm"
                            value={qty}
                            onChange={(e) => setQty(e.target.value)}
                            placeholder="0"
                        />
                    </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white/50 uppercase">Total Order</span>
                        <span className="text-xl font-black font-display tracking-tight text-[#F8F8F8]">
                            ৳{total.toLocaleString()}
                        </span>
                    </div>
                    <div className="h-px bg-white/5" />
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white/50 uppercase">Per Dozen</span>
                        <span className="text-sm font-bold text-white">৳{dozen.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
}

function CommissionSplitCalculator() {
    const [amount, setAmount] = useState<number | string>("");

    const amountNum = Number(amount);
    const platform = amountNum * 0.10; // 10%
    const dealer = amountNum * 0.90; // 90%

    return (
        <GlassCard className="p-6 border-white/5 bg-[#0D0D0F]">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#D4AF37]/10 rounded-lg">
                    <Calculator className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                    <h3 className="text-sm font-black text-[#F8F8F8] uppercase tracking-widest">Quick Split</h3>
                    <p className="text-[10px] text-white/40 font-bold">Standard 10% Commission</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Sale Amount</label>
                    <Input
                        type="number"
                        className="bg-white/5 border-white/10 font-mono text-sm"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                    />
                </div>

                <div className="bg-white/5 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white/50 uppercase">Platform (10%)</span>
                        <span className="text-sm font-bold text-[#D4AF37]">
                            ৳{platform.toLocaleString()}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white/50 uppercase">Dealer (90%)</span>
                        <span className="text-sm font-bold text-white">৳{dealer.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
}
