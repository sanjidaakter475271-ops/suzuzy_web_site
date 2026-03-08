import React, { useState, useEffect } from 'react';
import { WifiOff, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const OfflineBanner: React.FC = () => {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const handleOnline = () => { setIsOffline(false); setDismissed(false); };
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOffline || dismissed) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-amber-500 text-white px-4 py-2 w-full z-50 flex items-center justify-between shadow-md"
            >
                <div className="flex items-center gap-2">
                    <WifiOff size={16} />
                    <span className="text-xs font-bold leading-none mt-0.5">Offline mode. Showing cached data.</span>
                </div>
                <button
                    onClick={() => setDismissed(true)}
                    className="p-1 hover:bg-black/10 rounded-full transition-colors"
                >
                    <X size={14} />
                </button>
            </motion.div>
        </AnimatePresence>
    );
};
