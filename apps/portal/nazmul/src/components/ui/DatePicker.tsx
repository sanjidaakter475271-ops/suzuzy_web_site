'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Calendar } from './Calendar'; // Using the custom calendar component

interface DatePickerProps {
    value?: Date | null;
    onChange: (date: Date | null) => void;
    placeholder?: string;
    className?: string;
    label?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
    value,
    onChange,
    placeholder = "Select date",
    className,
    label
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (date: Date) => {
        onChange(date);
        setIsOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(null);
    };

    const formattedDate = value ? value.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    }) : '';

    return (
        <div className={cn("relative w-full", className)} ref={containerRef}>
            {label && <label className="text-[10px] font-black uppercase tracking-widest text-ink-muted ml-1 mb-2 block">{label}</label>}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full bg-surface-page dark:bg-dark-page border-2 border-surface-border dark:border-dark-border rounded-2xl px-5 py-4 text-sm font-bold flex items-center justify-between transition-all outline-none",
                    isOpen ? "border-brand ring-4 ring-brand/10" : "hover:border-brand/50",
                    !value && "text-ink-muted"
                )}
            >
                <div className="flex items-center gap-3">
                    <CalendarIcon size={18} className={cn(value ? "text-brand" : "text-ink-muted/50")} />
                    <span className={cn("truncate", !value && "opacity-50 font-normal")}>
                        {value ? formattedDate : placeholder}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {value && (
                        <div
                            onClick={handleClear}
                            className="p-1 hover:bg-surface-hover dark:hover:bg-white/10 rounded-full text-ink-muted hover:text-red-500 transition-colors"
                        >
                            <X size={14} />
                        </div>
                    )}
                    <ChevronDown size={16} className={cn("text-ink-muted transition-transform duration-300", isOpen && "rotate-180")} />
                </div>
            </button>

            {/* Dropdown Calendar */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-white dark:bg-dark-card rounded-[2rem] shadow-2xl border-2 border-surface-border dark:border-dark-border overflow-hidden p-2">
                        <Calendar
                            value={value}
                            onChange={handleSelect}
                        // Pass custom navigation handlers if needed or rely on internal state
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
