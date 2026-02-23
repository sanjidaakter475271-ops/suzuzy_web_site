import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoutePath } from '../types';
import { motion } from 'framer-motion';

export const Splash: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Navigate to welcome page after 2.5 seconds
        const timer = setTimeout(() => {
            navigate(RoutePath.WELCOME);
        }, 2500);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-blue-600 via-blue-500 to-indigo-600 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 flex flex-col items-center justify-center selection:bg-white/30 selection:text-white">

            {/* Curved Waves Background overlay */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-overlay">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute top-0 w-full h-1/3 text-white/10 dark:text-blue-500/10">
                    <path fill="currentColor" d="M0,0 Q50,100 100,0 L100,0 L0,0 Z"></path>
                </svg>
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute bottom-0 w-full h-[60%] text-indigo-900/40 dark:text-black/60">
                    <path fill="currentColor" d="M0,100 C 20,40 80,40 100,100 Z"></path>
                </svg>
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute bottom-0 w-full h-[40%] text-blue-800/60 dark:text-black/40">
                    <path fill="currentColor" d="M0,100 C 30,20 70,80 100,100 Z"></path>
                </svg>
            </div>

            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] dark:opacity-[0.05]"></div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center justify-center">

                {/* Glow Ring */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute w-48 h-48 bg-white/20 dark:bg-blue-400/20 rounded-full blur-2xl"
                />

                {/* Generated App Logo inside a crisp container */}
                <motion.div
                    initial={{ scale: 0.5, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ ease: [0.16, 1, 0.3, 1], duration: 1 }}
                    className="relative bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.6)] mb-8"
                >
                    <img src="/assets/logo.png" alt="ServiceMate Logo" className="w-24 h-24 object-contain" />
                </motion.div>

                {/* Staggered text animation for SERVICEMATE */}
                <div className="flex space-x-1 font-display font-bold text-4xl text-white tracking-[0.2em] uppercase">
                    {['S', 'E', 'R', 'V', 'I', 'C', 'E', 'M', 'A', 'T', 'E'].map((letter, index) => (
                        <motion.span
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + (index * 0.05), duration: 0.4 }}
                            className="drop-shadow-lg"
                        >
                            {letter}
                        </motion.span>
                    ))}
                </div>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 0.8 }}
                    className="mt-4 text-sm font-medium text-white/80 dark:text-blue-200/80 tracking-widest uppercase font-display"
                >
                    Smart Mechanic Workshop
                </motion.p>
            </div>

        </div>
    );
};
