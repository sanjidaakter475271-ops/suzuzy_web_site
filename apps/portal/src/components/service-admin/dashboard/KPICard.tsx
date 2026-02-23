'use client';

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { KPI } from '@/types';
import { cn } from '@/lib/utils';
import AnimatedNumber from '../ui/AnimatedNumber';

interface KPICardProps {
    kpi: KPI;
}

const KPICard: React.FC<KPICardProps> = ({ kpi }) => {
    return (
        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-card border border-surface-border dark:border-dark-border hover:shadow-hover transition-shadow group">
            <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-medium text-ink-muted">{kpi.title}</span>
                <div className={cn(
                    "p-1.5 rounded-md",
                    kpi.isPositive ? "bg-success-bg text-success" : "bg-danger-bg text-danger"
                )}>
                    {kpi.isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                </div>
            </div>
            <div className="flex flex-col">
                <div className="text-2xl font-bold text-ink-heading dark:text-white mb-1 flex items-center">
                    {kpi.prefix}
                    <AnimatedNumber
                        value={parseInt(kpi.value.replace(/,/g, ''), 10)}
                        format={(val: number) => val.toLocaleString()}
                    />
                </div>
                <span className={cn(
                    "text-xs font-bold",
                    kpi.isPositive ? "text-success" : "text-danger"
                )}>
                    {kpi.change} <span className="text-ink-muted font-normal ml-1">from last month</span>
                </span>
            </div>
        </div>
    );
};

export default KPICard;
