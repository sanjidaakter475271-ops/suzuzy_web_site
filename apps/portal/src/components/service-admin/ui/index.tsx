import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "rounded-2xl border border-surface-border bg-white text-ink-body shadow-card dark:border-dark-border dark:bg-dark-card dark:text-gray-300",
            className
        )}
        {...props}
    />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 p-6", className)}
        {...props}
    />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn(
            "text-lg font-bold leading-none tracking-tight text-ink-heading dark:text-white",
            className
        )}
        {...props}
    />
))
CardTitle.displayName = "CardTitle"

const CardContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const Button = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' }
>(({ className, variant = 'primary', ...props }, ref) => {
    const variants = {
        primary: "bg-brand text-white hover:bg-brand-hover shadow-soft",
        secondary: "bg-brand-soft text-brand hover:bg-brand-light/30",
        outline: "border border-surface-border dark:border-dark-border bg-transparent hover:bg-surface-hover dark:hover:bg-dark-border",
        danger: "bg-danger text-white hover:bg-danger/90",
        ghost: "bg-transparent text-ink-heading dark:text-white hover:bg-surface-hover dark:hover:bg-white/10",
    }
    return (
        <button
            ref={ref}
            className={cn(
                "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
                variants[variant],
                className
            )}
            {...props}
        />
    )
})
Button.displayName = "Button"

export { Card, CardHeader, CardTitle, CardContent, Button }
export { default as AnimatedNumber } from './AnimatedNumber'
export { default as StatCounter } from './StatCounter'
export { default as Modal } from './Modal'
export { Calendar } from './Calendar'
export { DatePicker } from './DatePicker'
export { SidePanel } from './SidePanel'
export { CSVImportPanel } from './CSVImportPanel'
