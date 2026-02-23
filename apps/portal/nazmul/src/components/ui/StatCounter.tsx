'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import AnimatedNumber from './AnimatedNumber';

interface StatCounterProps {
    value: number;
    label: string;
    prefix?: string;
    suffix?: string;
    className?: string;
}

const StatCounter: React.FC<StatCounterProps> = ({
    value,
    label,
    prefix = '',
    suffix = '',
    className
}) => {
    return (
        <div className={cn("p-6 bg-surface-card dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-3xl shadow-soft group hover:border-brand/40 transition-all", className)}>
            <p className="text-[10px] font-black text-ink-muted uppercase tracking-widest mb-1 group-hover:text-brand transition-colors">{label}</p>
            <div className="flex items-baseline gap-1">
                {prefix && <span className="text-lg font-black text-brand">{prefix}</span>}
                <AnimatedNumber
                    value={value}
                    className="text-3xl font-black text-ink-heading dark:text-white tracking-tighter tabular-nums"
                    format={(val: number) => val.toLocaleString()}
                />
                {suffix && <span className="text-sm font-bold text-ink-muted">{suffix}</span>}
            </div>
        </div>
    );
};

export default StatCounter;
