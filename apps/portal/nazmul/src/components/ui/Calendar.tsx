'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';

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
        <div className={cn("p-4 bg-white dark:bg-dark-card rounded-3xl shadow-xl w-[320px] border border-surface-border dark:border-dark-border select-none", className)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4 px-2">
                <button
                    onClick={handlePrevMonth}
                    className="p-2 hover:bg-surface-page dark:hover:bg-dark-page rounded-xl text-ink-muted transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="text-center">
                    <h4 className="text-sm font-black text-ink-heading dark:text-white uppercase tracking-widest">
                        {MONTHS[currentMonth]}
                    </h4>
                    <span className="text-[10px] font-bold text-brand uppercase tracking-widest">{currentYear}</span>
                </div>
                <button
                    onClick={handleNextMonth}
                    className="p-2 hover:bg-surface-page dark:hover:bg-dark-page rounded-xl text-ink-muted transition-colors"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 mb-2">
                {DAYS.map(day => (
                    <div key={day} className="text-center text-[10px] font-black text-ink-muted uppercase tracking-wider py-1">
                        {day}
                    </div>
                ))}
            </div>

            {/* Dates Grid */}
            <div className="grid grid-cols-7 gap-1">
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
                            onClick={() => handleDateClick(day)}
                            className={cn(
                                "h-9 w-9 mx-auto rounded-xl flex items-center justify-center text-xs font-bold transition-all relative group",
                                selected
                                    ? "bg-brand text-white shadow-lg shadow-brand/20 scale-105"
                                    : "hover:bg-surface-page dark:hover:bg-dark-page text-ink-heading dark:text-white",
                                today && !selected && "border-2 border-brand text-brand"
                            )}
                        >
                            {day}
                            {/* Dot indicator for selected/today */}
                            {selected && <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-white/50"></div>}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
