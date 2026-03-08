import React, { useState, useEffect, useRef } from 'react';
import { BarcodeScanner, LensFacing } from '@capacitor-mlkit/barcode-scanning';
import { Capacitor } from '@capacitor/core';
import { X, Camera, Loader2, RefreshCw } from 'lucide-react';

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

            // Request permission (no race timeout, wait for user)
            const { camera } = await BarcodeScanner.requestPermissions();

            if (camera === 'granted' || camera === 'limited') {
                document.body.classList.add('scanner-active');

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
        } catch (e) {
            console.error("Error stopping scan:", e);
        } finally {
            document.body.classList.remove('scanner-active');
            onClose();
        }
    };

    useEffect(() => {
        // Delay slighty to let mount animation finish
        const timer = setTimeout(() => {
            startScan();
        }, 300);
        return () => {
            clearTimeout(timer);
            // On unmount, make sure we clean up
            BarcodeScanner.stopScan().catch(() => { });
            BarcodeScanner.removeAllListeners().catch(() => { });
            document.body.classList.remove('scanner-active');
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-transparent scanner-ui">
            {/* Scanner Overlay UI */}
            {!isDownloading && (
                <div className="flex-1 flex flex-col relative">
                    {/* The cutout window */}
                    <div className="absolute inset-0 border-[60px] border-black/70 md:border-[100px] pointer-events-none">
                        <div className="w-full h-full border-2 border-blue-500/50 relative">
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 -mt-1 -ml-1"></div>
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 -mt-1 -mr-1"></div>
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 -mb-1 -ml-1"></div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 -mb-1 -mr-1"></div>
                        </div>
                    </div>

                    {/* Top Right Close Button */}
                    <div className="absolute top-12 right-6 z-50">
                        <button
                            onClick={stopScan}
                            className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all shadow-xl"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Bottom Status Panel */}
                    <div className="absolute bottom-24 w-full text-center px-6">
                        <div className="bg-black/60 backdrop-blur-lg inline-block px-6 py-4 rounded-2xl border border-white/20 shadow-2xl">
                            <div className="flex items-center space-x-3 justify-center">
                                <Camera size={20} className="text-blue-400" />
                                <p className="text-white font-medium text-sm">{message || "Align barcode within the frame"}</p>
                            </div>
                            {error && (
                                <div className="mt-3 p-2 bg-red-500/20 rounded-lg">
                                    <p className="text-red-300 text-xs font-medium">{error}</p>
                                    <button
                                        onClick={() => { setError(null); startScan(); }}
                                        className="mt-2 text-white bg-red-500/50 hover:bg-red-500 px-3 py-1 rounded text-xs transition"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Laser scanning line */}
                    {!error && (
                        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-red-500 shadow-[0_0_15px_rgba(239,68,68,1)] animate-pulse"></div>
                    )}
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
