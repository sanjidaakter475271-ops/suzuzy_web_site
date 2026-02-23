'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedNumberProps {
    value: number;
    className?: string;
    format?: (value: number) => string;
    duration?: number;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
    value,
    className,
    format = (val) => val.toLocaleString(),
    duration = 1500
}) => {
    const [displayValue, setDisplayValue] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLSpanElement>(null);
    const animationRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        let start = 0;
        const end = value;
        if (start === end) {
            setDisplayValue(end);
            return;
        }

        // Clear any existing interval
        if (animationRef.current) clearInterval(animationRef.current);

        const timer = setInterval(() => {
            // Ease-out effect: (end - start) / 10
            const change = (end - start) / 10;
            const step = change > 0 ? Math.ceil(change) : Math.floor(change);

            start += step;

            if ((step > 0 && start >= end) || (step < 0 && start <= end) || step === 0) {
                setDisplayValue(end);
                clearInterval(timer);
            } else {
                setDisplayValue(start);
            }
        }, 30);

        animationRef.current = timer;

        return () => clearInterval(timer);
    }, [value, isVisible]);

    return (
        <span ref={ref} className={cn("tabular-nums", className)}>
            {format(displayValue)}
        </span>
    );
};

export default AnimatedNumber;
