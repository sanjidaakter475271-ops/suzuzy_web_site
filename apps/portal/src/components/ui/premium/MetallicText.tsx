'use client';

import { cn } from '@/lib/utils';

export const MetallicText = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <span className={cn(
        "bg-gradient-to-b from-[#F8E4A0] via-[#D4AF37] to-[#A6851F] bg-clip-text text-transparent italic font-display font-black",
        className
    )}>
        {children}
    </span>
);
