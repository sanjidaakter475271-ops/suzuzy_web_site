'use client';

import React from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { KPI } from '@/types';
import { cn } from '@/lib/utils';
import AnimatedNumber from '../ui/AnimatedNumber';

interface KPICardProps {
    kpi: KPI;
}

const KPICard: React.FC<KPICardProps> = ({ kpi }) => {
    return (
        <div className="bg-white dark:bg-[#080809] p-6 rounded-[2rem] shadow-card border border-surface-border dark:border-white/5 hover:border-brand/30 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-brand/5 blur-2xl -mr-8 -mt-8 group-hover:bg-brand/10 transition-colors" />

            <div className="flex justify-between items-start mb-5 relative z-10">
                <span className="text-[10px] font-black text-ink-muted uppercase tracking-[0.2em]">{kpi.title}</span>
                <div className={cn(
                    "p-2 rounded-xl transition-all duration-500 group-hover:scale-110",
                    kpi.isPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                )}>
                    {kpi.isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                </div>
            </div>

            <div className="flex flex-col relative z-10">
                <div className="text-3xl font-black text-ink-heading dark:text-white mb-2 flex items-center tracking-tighter italic">
                    {kpi.prefix}
                    <AnimatedNumber
                        value={parseInt(kpi.value.replace(/[^0-9]/g, ''), 10) || 0}
                        format={(val: number) => val.toLocaleString()}
                    />
                    {kpi.title.toLowerCase().includes('tat') && <span className="text-xs font-black text-ink-muted ml-1 not-italic">min</span>}
                </div>

                <div className="flex items-center gap-1.5">
                    <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        kpi.isPositive ? "text-emerald-500" : "text-rose-500"
                    )}>
                        {kpi.change || '0%'}
                    </span>
                    <span className="text-[9px] font-bold text-ink-muted uppercase tracking-[0.1em]">vs last period</span>
                </div>
            </div>

            <div className="mt-4 w-full h-1 bg-surface-page dark:bg-white/5 rounded-full overflow-hidden">
                <div
                    className={cn("h-full rounded-full transition-all duration-1000", kpi.isPositive ? "bg-emerald-500" : "bg-rose-500")}
                    style={{ width: kpi.isPositive ? '70%' : '40%' }}
                />
            </div>
        </div>
    );
};

export default KPICard;
