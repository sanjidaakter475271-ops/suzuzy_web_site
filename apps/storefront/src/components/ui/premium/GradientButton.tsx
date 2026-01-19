'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const GradientButton = ({
    children,
    className,
    onClick,
    disabled,
    type = "button"
}: {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
}) => (
    <motion.button
        type={type}
        whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(212, 175, 55, 0.4)" }}
        whileTap={{ scale: 0.98 }}
        disabled={disabled}
        onClick={onClick}
        className={cn(
            "relative group px-8 py-4 bg-gradient-to-r from-[#D4AF37] via-[#F8E4A0] to-[#D4AF37] text-[#0D0D0F] font-bold rounded-2xl overflow-hidden transition-all disabled:opacity-50 disabled:cursor-not-allowed",
            className
        )}
    >
        {/* Shine effect */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </motion.button>
);
