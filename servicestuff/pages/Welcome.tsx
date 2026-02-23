import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RoutePath } from '../types';
import { motion } from 'framer-motion';

export const Welcome: React.FC = () => {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        // Mark as onboarded in local storage
        localStorage.setItem('servicemate_onboarded', 'true');
        navigate(RoutePath.LOGIN);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-600 via-blue-500 to-indigo-600 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 overflow-hidden relative selection:bg-white/30 selection:text-white">

            {/* Background Overlay Textures */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] dark:opacity-[0.05] pointer-events-none"></div>

            {/* Top Section: Hero Image */}
            <div className="relative flex-1 flex flex-col items-center justify-center min-h-[55vh] p-8 z-10">

                {/* Decoration circles (like the fireflies in the Smart Home app) */}
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute top-[20%] left-[20%] w-3 h-3 rounded-full bg-yellow-400 blur-[2px]" />
                <motion.div animate={{ y: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 5 }} className="absolute top-[30%] right-[25%] w-4 h-4 rounded-full bg-white/50 blur-[2px]" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="w-full max-w-sm flex items-center justify-center relative mt-8"
                >
                    {/* Subtle backglow */}
                    <div className="absolute w-[80%] h-[80%] bg-white/20 dark:bg-blue-400/20 rounded-full blur-3xl"></div>
                    <img
                        src="/assets/welcome-hero.png"
                        alt="Service Technician setup"
                        className="w-full h-auto object-contain relative z-10 drop-shadow-2xl"
                    />
                </motion.div>
            </div>

            {/* Bottom Section: White Card overlapping the blue */}
            {/* We use a negative margin and specific border-radius to curve the top */}
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6, type: "spring", damping: 25 }}
                className="relative z-20 flex-shrink-0 bg-white dark:bg-[#0f172a] rounded-t-[40px] pt-10 pb-12 px-8 flex flex-col items-center shadow-[0_-15px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-15px_40px_rgba(0,0,0,0.5)]"
            >
                {/* Decorative inner curve line (optical adjustment for a premium look) */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-400 via-indigo-500 to-blue-600 dark:from-blue-600 dark:via-blue-400 dark:to-indigo-600 rounded-t-[40px] opacity-80" />

                {/* Page indicator dots (●○○) */}
                <div className="flex space-x-2 mb-8">
                    <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 transition-all"></div>
                    <div className="w-2 h-2 rounded-full bg-blue-100 dark:bg-slate-700 transition-all"></div>
                    <div className="w-2 h-2 rounded-full bg-blue-100 dark:bg-slate-700 transition-all"></div>
                </div>

                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="font-display text-4xl font-bold text-center text-slate-900 dark:text-white mb-4"
                >
                    ServiceMate App
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center text-slate-500 dark:text-slate-400 font-medium tracking-tight mb-10 max-w-xs leading-relaxed"
                >
                    You are a few clicks away to enter the world of smart service management.
                </motion.p>

                <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    onClick={handleGetStarted}
                    className="w-full max-w-sm relative group overflow-hidden bg-blue-600 hover:bg-blue-500 dark:hover:bg-blue-400 text-white font-bold py-5 rounded-[2rem] shadow-xl shadow-blue-500/30 active:scale-[0.98] transition-all"
                >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                    <span className="relative z-10 font-display tracking-[0.05em] text-lg uppercase">Continue</span>
                </motion.button>
            </motion.div>
        </div>
    );
};
