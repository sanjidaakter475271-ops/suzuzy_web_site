"use client";

import { AlertTriangle, CheckCircle, Info, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AlertCardProps {
    title: string;
    description: string;
    type: "info" | "success" | "warning" | "error" | "critical";
    onDismiss?: () => void;
    className?: string;
}

const ALERT_STYLES = {
    info: {
        icon: Info,
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        text: "text-blue-400",
        iconColor: "text-blue-400"
    },
    success: {
        icon: CheckCircle,
        bg: "bg-green-500/10",
        border: "border-green-500/20",
        text: "text-green-400",
        iconColor: "text-green-400"
    },
    warning: {
        icon: AlertTriangle,
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/20",
        text: "text-yellow-400",
        iconColor: "text-yellow-400"
    },
    error: {
        icon: XCircle,
        bg: "bg-red-500/10",
        border: "border-red-500/20",
        text: "text-red-400",
        iconColor: "text-red-400"
    },
    critical: {
        icon: AlertTriangle,
        bg: "bg-red-500/20",
        border: "border-red-500/50",
        text: "text-red-500",
        iconColor: "text-red-500 animation-pulse"
    }
};

export function AlertCard({
    title,
    description,
    type = "info",
    onDismiss,
    className
}: AlertCardProps) {
    const [isVisible, setIsVisible] = useState(true);
    const style = ALERT_STYLES[type];
    const Icon = style.icon;

    const handleDismiss = () => {
        setIsVisible(false);
        onDismiss?.();
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className={cn(
                        "rounded-xl border p-4 relative overflow-hidden",
                        style.bg,
                        style.border,
                        className
                    )}
                >
                    <div className="flex items-start gap-4">
                        <div className={cn("p-2 rounded-lg bg-black/20", style.iconColor)}>
                            <Icon className="w-5 h-5" />
                        </div>

                        <div className="flex-1 pt-0.5">
                            <h4 className={cn("text-sm font-bold mb-1", style.text)}>
                                {title}
                            </h4>
                            <p className="text-xs text-white/60 leading-relaxed">
                                {description}
                            </p>
                        </div>

                        {onDismiss && (
                            <button
                                onClick={handleDismiss}
                                className="p-1 hover:bg-black/20 rounded-lg transition-colors text-white/40 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
