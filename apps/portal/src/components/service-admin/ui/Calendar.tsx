'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/service-admin/ui';

interface CalendarProps {
    value?: Date | null;
    onChange?: (date: Date) => void;
    className?: string;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export const Calendar: React.FC<CalendarProps> = ({ value, onChange, className }) => {
    // Current view state (month/year navigation)
    const [viewDate, setViewDate] = useState(value || new Date());

    // Ensure view updates if external value changes significantly (optional)
    useEffect(() => {
        if (value) {
            setViewDate(new Date(value));
        }
    }, [value]);

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const currentYear = viewDate.getFullYear();
    const currentMonth = viewDate.getMonth();

    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const startDay = getFirstDayOfMonth(currentYear, currentMonth);

    const handlePrevMonth = () => {
        setViewDate(new Date(currentYear, currentMonth - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(currentYear, currentMonth + 1, 1));
    };

    const handleDateClick = (day: number) => {
        const newDate = new Date(currentYear, currentMonth, day);
        if (onChange) {
            onChange(newDate);
        }
    };

    const isSameDate = (d1: Date, d2: Date) => {
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    };

    const isToday = (day: number) => {
        const today = new Date();
        return isSameDate(today, new Date(currentYear, currentMonth, day));
    };

    const isSelected = (day: number) => {
        if (!value) return false;
        return isSameDate(value, new Date(currentYear, currentMonth, day));
    };

    return (
        <div className={cn("p-5 bg-white dark:bg-dark-card rounded-[2rem] shadow-xl w-[320px] border border-surface-border dark:border-dark-border select-none", className)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6 px-1">
                <button
                    onClick={handlePrevMonth}
                    type="button"
                    className="p-2.5 hover:bg-surface-page dark:hover:bg-dark-page rounded-2xl text-ink-muted transition-all active:scale-90"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="text-center">
                    <h4 className="text-xs font-black text-ink-heading dark:text-white uppercase tracking-[0.2em]">
                        {MONTHS[currentMonth]}
                    </h4>
                    <span className="text-[10px] font-black text-brand uppercase tracking-widest mt-0.5 block">{currentYear}</span>
                </div>
                <button
                    onClick={handleNextMonth}
                    type="button"
                    className="p-2.5 hover:bg-surface-page dark:hover:bg-dark-page rounded-2xl text-ink-muted transition-all active:scale-90"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 mb-3">
                {DAYS.map(day => (
                    <div key={day} className="text-center text-[9px] font-black text-ink-muted/60 uppercase tracking-widest py-1">
                        {day}
                    </div>
                ))}
            </div>

            {/* Dates Grid */}
            <div className="grid grid-cols-7 gap-1.5">
                {/* Empty slots for start offset */}
                {Array.from({ length: startDay }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}

                {/* Days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const selected = isSelected(day);
                    const today = isToday(day);

                    return (
                        <button
                            key={day}
                            type="button"
                            onClick={() => handleDateClick(day)}
                            className={cn(
                                "h-10 w-10 mx-auto rounded-2xl flex items-center justify-center text-xs font-black transition-all relative group",
                                selected
                                    ? "bg-brand text-white shadow-lg shadow-brand/20 scale-110 z-10"
                                    : "hover:bg-surface-page dark:hover:bg-dark-page text-ink-heading dark:text-white",
                                today && !selected && "border-2 border-brand/50 text-brand"
                            )}
                        >
                            {day}
                            {/* Dot indicator for selected/today */}
                            {selected && <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-white/50 animate-pulse"></div>}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
