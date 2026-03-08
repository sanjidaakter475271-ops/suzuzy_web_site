import React, { useState, useEffect, useRef } from 'react';
import { BarcodeScanner, LensFacing } from '@capacitor-mlkit/barcode-scanning';
import { Capacitor } from '@capacitor/core';
import { X, Camera, Loader2, RefreshCw } from 'lucide-react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { motion, AnimatePresence } from 'framer-motion';

interface ScannerProps {
    onScan: (result: string) => void;
    onClose: () => void;
    message?: string;
}

export const BarcodeScannerComponent: React.FC<ScannerProps> = ({ onScan, onClose, message }) => {
    const [error, setError] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadTimedOut, setDownloadTimedOut] = useState(false);
    const listenerRef = useRef<any>(null);

    const checkAndInstallModule = async () => {
        try {
            const { available } = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
            if (!available) {
                setIsDownloading(true);
                setDownloadTimedOut(false);

                // Set a timeout to show a retry button if it takes too long
                const timeoutId = setTimeout(() => {
                    setDownloadTimedOut(true);
                }, 10000); // 10 seconds

                await BarcodeScanner.installGoogleBarcodeScannerModule();
                clearTimeout(timeoutId);
                setIsDownloading(false);
                setDownloadTimedOut(false);
            }
            return true;
        } catch (e: any) {
            console.error("Module installation error:", e);
            setError("Failed to download scanner module. Please check your internet connection.");
            setIsDownloading(false);
            return false;
        }
    };

    const startScan = async () => {
        try {
            if (!Capacitor.isNativePlatform()) {
                setError('Scanner requires the native mobile app.');
                return;
            }

            const moduleReady = await checkAndInstallModule();
            if (!moduleReady) return;

            // Request permission
            const { camera } = await BarcodeScanner.requestPermissions();

            if (camera === 'granted' || camera === 'limited') {
                document.body.classList.add('scanner-active');

                // Hide Status Bar for immersive mode
                if (Capacitor.isNativePlatform()) {
                    await StatusBar.hide().catch(() => { });
                }

                listenerRef.current = await BarcodeScanner.addListener('barcodesScanned', async (result) => {
                    if (result.barcodes.length > 0) {
                        const code = result.barcodes[0].displayValue;
                        if (code) {
                            await stopScan();
                            onScan(code);
                        }
                    }
                });

                await BarcodeScanner.startScan({
                    lensFacing: LensFacing.Back
                });
            } else {
                setError("Camera permission denied. Please enable it in Settings.");
            }
        } catch (e: any) {
            console.error("Scanner startup error:", e);
            setError(e.message || "Could not start camera. Ensure permissions are granted.");
        }
    };

    const stopScan = async () => {
        try {
            if (listenerRef.current) {
                await listenerRef.current.remove();
                listenerRef.current = null;
            }
            await BarcodeScanner.stopScan().catch(() => { });
            await BarcodeScanner.removeAllListeners().catch(() => { });

            // Restore Status Bar
            if (Capacitor.isNativePlatform()) {
                await StatusBar.show().catch(() => { });
            }
        } catch (e) {
            console.error("Error stopping scan:", e);
        } finally {
            document.body.classList.remove('scanner-active');
            onClose();
        }
    };

    useEffect(() => {
        // Delay slightly to let mount animation finish
        const timer = setTimeout(() => {
            startScan();
        }, 300);
        return () => {
            clearTimeout(timer);
            // On unmount, make sure we clean up
            BarcodeScanner.stopScan().catch(() => { });
            BarcodeScanner.removeAllListeners().catch(() => { });
            document.body.classList.remove('scanner-active');
            if (Capacitor.isNativePlatform()) {
                StatusBar.setOverlaysWebView({ overlay: true }).catch(() => { });
                StatusBar.setStyle({ style: Style.Dark }).catch(() => { });
                StatusBar.setBackgroundColor({ color: '#020617' }).catch(() => { });
            }
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[999] flex flex-col bg-transparent scanner-ui">
            {/* Scanner Overlay UI */}
            {!isDownloading && (
                <div className="flex-1 flex flex-col relative">
                    {/* Immersive Dark Backdrop with Professional Cutout */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                        {/* The Cutout - Using massive box-shadow for perfect immersive blackout */}
                        <div className="w-64 h-64 rounded-[2rem] border-2 border-blue-500/30 relative shadow-[0_0_0_2000px_rgba(2,6,23,0.85)]">
                            {/* Corner Guards */}
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-400 rounded-tl-[1.5rem] -mt-[4px] -ml-[4px]"></div>
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-400 rounded-tr-[1.5rem] -mt-[4px] -mr-[4px]"></div>
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-400 rounded-bl-[1.5rem] -mb-[4px] -ml-[4px]"></div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-400 rounded-br-[1.5rem] -mb-[4px] -mr-[4px]"></div>

                            {/* Laser scanning line */}
                            {!error && (
                                <motion.div
                                    initial={{ top: '10%', opacity: 0 }}
                                    animate={{ top: '90%', opacity: 1 }}
                                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear", repeatType: "reverse" }}
                                    className="absolute left-6 right-6 h-[1.5px] bg-red-500 shadow-[0_0_20px_rgba(239,68,68,1)] z-10"
                                ></motion.div>
                            )}
                        </div>
                    </div>

                    {/* Top Header */}
                    <div className="absolute top-0 w-full p-6 pt-12 flex justify-between items-center z-50">
                        <div className="bg-black/40 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10">
                            <h3 className="text-white font-bold text-lg tracking-tight">Scan</h3>
                        </div>

                        <button
                            onClick={stopScan}
                            className="p-3 bg-white/10 backdrop-blur-xl rounded-full text-white hover:bg-white/20 transition-all border border-white/10 shadow-2xl"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Bottom Status Panel */}
                    <div className="absolute bottom-12 w-full text-center px-6 z-50">
                        <div className="bg-black/40 backdrop-blur-2xl inline-block px-8 py-5 rounded-[2rem] border border-white/10 shadow-2xl max-w-sm w-full">
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mb-1">
                                    <Camera size={20} className="text-blue-400" />
                                </div>
                                <p className="text-white font-bold text-sm tracking-wide">{message || "Align within the frame"}</p>
                                <p className="text-white/40 text-[10px] uppercase font-bold tracking-[0.2em] mt-1">Scanning for Data</p>
                            </div>
                            {error && (
                                <div className="mt-4 p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                                    <p className="text-rose-400 text-xs font-bold">{error}</p>
                                    <button
                                        onClick={() => { setError(null); startScan(); }}
                                        className="mt-3 w-full text-white bg-rose-600 hover:bg-rose-500 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Downloading Module Overlay */}
            {isDownloading && (
                <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center">
                    <Loader2 size={48} className="text-blue-500 animate-spin mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Setting up Scanner</h3>
                    <p className="text-slate-300 text-sm mb-6">
                        Downloading ML Kit scanner module (one-time).<br />
                        This may take a moment on slower networks...
                    </p>

                    {downloadTimedOut && (
                        <div className="animate-fade-in flex flex-col items-center">
                            <p className="text-amber-400 text-xs mb-4 max-w-xs">
                                Download is taking longer than expected. You can keep waiting or try restarting.
                            </p>
                            <button
                                onClick={() => {
                                    setIsDownloading(false);
                                    startScan();
                                }}
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl border border-white/20 transition-all font-medium text-sm"
                            >
                                <RefreshCw size={16} />
                                Retry Download
                            </button>
                        </div>
                    )}

                    <button
                        onClick={stopScan}
                        className="absolute bottom-12 mt-8 text-slate-400 hover:text-white px-4 py-2"
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
};
