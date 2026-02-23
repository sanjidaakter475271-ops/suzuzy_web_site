'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ToggleSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    description?: string;
    className?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
    checked,
    onChange,
    label,
    description,
    className
}) => {
    return (
        <div className={cn("flex items-center justify-between gap-4 p-4 rounded-2xl border border-surface-border dark:border-dark-border bg-surface-page dark:bg-dark-page transition-all", className)}>
            <div className="flex flex-col gap-0.5">
                <span className="text-sm font-black text-ink-heading dark:text-white uppercase tracking-tight">{label}</span>
                {description && <span className="text-[10px] text-ink-muted font-bold">{description}</span>}
            </div>
            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2",
                    checked ? "bg-brand" : "bg-surface-border dark:bg-dark-border"
                )}
            >
                <span
                    aria-hidden="true"
                    className={cn(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        checked ? "translate-x-5" : "translate-x-0"
                    )}
                />
            </button>
        </div>
    );
};

export default ToggleSwitch;
