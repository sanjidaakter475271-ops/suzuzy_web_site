'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BikeLoaderProps {
  isLoading?: boolean;
  text?: string;
  fullPage?: boolean;
}

export function BikeLoader({ 
  isLoading = true, 
  text = "Loading",
  fullPage = true 
}: BikeLoaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) return 0;
          return prev + Math.random() * 15;
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`
            ${fullPage ? 'fixed inset-0 z-[9999]' : 'relative w-full h-64'}
            flex flex-col items-center justify-center
            bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900
          `}
        >
          {/* Background Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/10 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          {/* Main Loader */}
          <div className="relative">
            {/* Road */}
            <div className="w-72 h-2 bg-slate-700 rounded relative overflow-hidden">
              <motion.div
                className="absolute inset-y-0 w-[200%]"
                style={{
                  background: 'repeating-linear-gradient(90deg, transparent, transparent 20px, #fbbf24 20px, #fbbf24 40px)',
                }}
                animate={{ x: ['0%', '-50%'] }}
                transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}
              />
            </div>

            {/* Bike */}
            <motion.div
              className="absolute -top-16 left-1/2 -translate-x-1/2"
              animate={{
                y: [0, -3, 0, -2, 0],
                rotate: [0, -1, 0, 1, 0],
              }}
              transition={{
                duration: 0.4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {/* Speed Lines */}
              <div className="absolute right-full top-1/2 -translate-y-1/2 flex flex-col gap-2 mr-2">
                {[40, 30, 50].map((width, i) => (
                  <motion.div
                    key={i}
                    className="h-0.5 rounded-full"
                    style={{
                      width,
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6))',
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      x: [20, -20],
                    }}
                    transition={{
                      duration: 0.4,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </div>

              {/* Bike SVG */}
              <svg width="120" height="70" viewBox="0 0 120 70">
                {/* Back Wheel */}
                <g className="origin-center" style={{ transformOrigin: '25px 50px' }}>
                  <motion.g
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.3, repeat: Infinity, ease: 'linear' }}
                    style={{ transformOrigin: '25px 50px' }}
                  >
                    <circle cx="25" cy="50" r="18" fill="none" stroke="#1e293b" strokeWidth="4" />
                    <circle cx="25" cy="50" r="8" fill="#475569" />
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                      <line
                        key={angle}
                        x1="25"
                        y1="50"
                        x2={25 + 15 * Math.cos((angle * Math.PI) / 180)}
                        y2={50 + 15 * Math.sin((angle * Math.PI) / 180)}
                        stroke="#64748b"
                        strokeWidth="1"
                      />
                    ))}
                  </motion.g>
                </g>

                {/* Front Wheel */}
                <g>
                  <motion.g
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.3, repeat: Infinity, ease: 'linear' }}
                    style={{ transformOrigin: '95px 50px' }}
                  >
                    <circle cx="95" cy="50" r="18" fill="none" stroke="#1e293b" strokeWidth="4" />
                    <circle cx="95" cy="50" r="8" fill="#475569" />
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                      <line
                        key={angle}
                        x1="95"
                        y1="50"
                        x2={95 + 15 * Math.cos((angle * Math.PI) / 180)}
                        y2={50 + 15 * Math.sin((angle * Math.PI) / 180)}
                        stroke="#64748b"
                        strokeWidth="1"
                      />
                    ))}
                  </motion.g>
                </g>

                {/* Bike Frame */}
                <path
                  d="M25 50 L45 30 L75 30 L95 50 M45 30 L55 15 L75 15 L85 30 M55 15 L55 8 L75 8 L75 15"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Seat */}
                <ellipse cx="45" cy="12" rx="12" ry="5" fill="#1e293b" />

                {/* Tank */}
                <path
                  d="M50 18 Q60 10 70 18 L70 25 Q60 22 50 25 Z"
                  fill="#ef4444"
                />

                {/* Engine */}
                <rect x="50" y="32" width="20" height="15" rx="3" fill="#374151" />

                {/* Exhaust */}
                <path
                  d="M25 45 L15 42 L8 45"
                  fill="none"
                  stroke="#9ca3af"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Headlight */}
                <motion.circle
                  cx="100"
                  cy="30"
                  r="5"
                  fill="#fbbf24"
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 0.2, repeat: Infinity }}
                  style={{ filter: 'drop-shadow(0 0 8px #fbbf24)' }}
                />

                {/* Handle */}
                <line x1="88" y1="22" x2="95" y2="15" stroke="#9ca3af" strokeWidth="3" strokeLinecap="round" />
                <line x1="85" y1="25" x2="80" y2="18" stroke="#9ca3af" strokeWidth="3" strokeLinecap="round" />
              </svg>

              {/* Smoke */}
              <div className="absolute bottom-4 left-0">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-white/30 rounded-full"
                    animate={{
                      x: [-30, -60],
                      y: [0, -20],
                      scale: [1, 2],
                      opacity: [0.6, 0],
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Loading Text */}
          <div className="mt-10 text-center">
            <h2 className="text-xl font-semibold text-white tracking-wide">
              {text}
              <span className="inline-flex gap-1 ml-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 bg-amber-400 rounded-full"
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                  />
                ))}
              </span>
            </h2>

            {/* Progress Bar */}
            <div className="w-48 h-1 bg-white/20 rounded-full mt-4 mx-auto overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                animate={{ width: ['0%', '100%'] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </div>
          </div>

          {/* Brand */}
          <motion.div
            className="absolute bottom-8 text-white/40 text-sm font-medium tracking-widest"
            animate={{ opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ROYALCONSORTIUM
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function BikeLoaderMini({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <motion.div
      className={`${sizes[size]} relative`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          strokeOpacity="0.2"
        />
        <motion.circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="60"
          strokeDashoffset="45"
        />
      </svg>
    </motion.div>
  );
}
