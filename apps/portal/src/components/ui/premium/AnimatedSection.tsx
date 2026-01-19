'use client';

import { motion } from 'framer-motion';

export const AnimatedSection = ({
    children,
    className,
    delay = 0
}: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, delay, ease: "easeOut" }}
        className={className}
    >
        {children}
    </motion.div>
);
