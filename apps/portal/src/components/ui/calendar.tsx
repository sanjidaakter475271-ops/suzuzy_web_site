"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("p-3", className)}
            captionLayout="dropdown"
            classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-3",
                caption: "flex justify-between pt-1 relative items-center px-1 mb-2",
                caption_label: "hidden",
                nav: "space-x-1 flex items-center absolute right-1",
                nav_button: cn(
                    buttonVariants({ variant: "outline" }),
                    "h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100 border-slate-800 rounded-lg"
                ),
                nav_button_previous: "relative z-10",
                nav_button_next: "relative z-10",
                table: "w-full border-collapse",
                head_row: "flex w-full justify-between mb-1",
                head_cell:
                    "text-muted-foreground w-8 font-black text-[9px] uppercase tracking-tighter text-center",
                row: "flex w-full justify-between mt-1",
                cell: "h-8 w-8 text-center text-xs p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-8 w-8 p-0 font-bold aria-selected:opacity-100 hover:bg-brand/20 hover:text-brand transition-all rounded-lg"
                ),
                day_range_end: "day-range-end",
                day_selected:
                    "bg-brand text-white hover:bg-brand hover:text-white focus:bg-brand focus:text-white shadow-md shadow-brand/30",
                day_today: "border border-brand text-brand font-black",
                day_outside:
                    "day-outside text-muted-foreground/20 aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle:
                    "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
                dropdowns: "flex gap-0.5 items-center bg-white dark:bg-black/40 px-1.5 py-0.5 rounded-lg border border-slate-800",
                dropdown: "bg-transparent text-[10px] font-black uppercase tracking-tight outline-none cursor-pointer",
                footer: "pt-3 mt-2 border-t border-slate-800 flex justify-center",
                ...classNames,
            }}
            components={{
                Chevron: ({ orientation }) => {
                    const Icon = orientation === "left" ? ChevronLeft : ChevronRight
                    return <Icon className="h-3 w-3" />
                },
            }}
            footer={
                <div className="flex justify-center w-full">
                    <button
                        onClick={() => props.onSelect?.(new Date() as any, new Date(), {} as any, {} as any)}
                        className="text-[9px] font-black uppercase tracking-[0.2em] text-brand hover:bg-brand/10 px-3 py-1.5 rounded-lg transition-all"
                    >
                        Go to Today
                    </button>
                </div>
            }
            {...props}
        />
    )
}
Calendar.displayName = "Calendar"

export { Calendar }
