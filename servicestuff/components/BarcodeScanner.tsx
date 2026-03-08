import React, { useState, useEffect } from 'react';
import { BarcodeScanner, LensFacing } from '@capacitor-mlkit/barcode-scanning';
import { Capacitor } from '@capacitor/core';
import { X, Camera, Zap } from 'lucide-react';

interface ScannerProps {
    onScan: (result: string) => void;
    onClose: () => void;
    message?: string;
}

export const BarcodeScannerComponent: React.FC<ScannerProps> = ({ onScan, onClose, message }) => {
    const [error, setError] = useState<string | null>(null);

    const startScan = async () => {
        try {
            if (!Capacitor.isNativePlatform()) {
                setError('Scanner requires the native mobile app.');
                alert('Scanner requires the native mobile app.');
                onClose();
                return;
            }

            // Request permission with timeout catch mechanism
            const { camera } = await Promise.race([
                BarcodeScanner.requestPermissions(),
                new Promise<{ camera: string }>((_, reject) => setTimeout(() => reject(new Error('Permission prompt timed out')), 5000))
            ]);

            if (camera === 'granted' || camera === 'limited') {
                // Prepare UI
                document.body.classList.add('scanner-active');

                // Add listener
                const listener = await BarcodeScanner.addListener('barcodesScanned', async (result) => {
                    if (result.barcodes.length > 0) {
                        console.log("Barcode scanned:", result.barcodes[0].displayValue);
                        await listener.remove();
                        await stopScan();
                        onScan(result.barcodes[0].displayValue);
                    }
                });

                await BarcodeScanner.startScan({
                    lensFacing: LensFacing.Back
                });
                console.log("Scanner started successfully");
            } else {
                setError("Camera permission denied");
                alert("Camera permission is required for scanning.");
                onClose();
            }
        } catch (e: any) {
            console.error("Scanner startup error:", e);
            const errorMsg = e.message || "Could not start camera. Make sure you are using the mobile app and have granted permissions.";
            setError(errorMsg);
            alert(errorMsg);
            onClose();
        }
    };

    const stopScan = async () => {
        try {
            await BarcodeScanner.stopScan();
            await BarcodeScanner.removeAllListeners();
        } catch (e) {
            console.error("Error stopping scan:", e);
        }
        document.body.classList.remove('scanner-active');
        onClose();
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            startScan();
        }, 300);
        return () => {
            clearTimeout(timer);
            stopScan();
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-transparent scanner-ui">
            {/* Scanner Overlay */}
            <div className="flex-1 flex flex-col relative">
                <div className="absolute inset-0 border-[40px] border-black/60 md:border-[100px]">
                    <div className="w-full h-full border-2 border-blue-500 relative">
                        {/* Corner markers */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 -mt-1 -ml-1"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 -mt-1 -mr-1"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 -mb-1 -ml-1"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 -mb-1 -mr-1"></div>
                    </div>
                </div>

                <div className="absolute top-10 right-6 z-50">
                    <button
                        onClick={stopScan}
                        className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all shadow-xl"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="absolute bottom-20 w-full text-center px-6">
                    <div className="bg-black/40 backdrop-blur-lg inline-block px-6 py-3 rounded-2xl border border-white/10 shadow-2xl">
                        <div className="flex items-center space-x-3">
                            <Camera size={18} className="text-blue-400" />
                            <p className="text-white font-medium">{message || "Align barcode within the frame"}</p>
                        </div>
                        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
                    </div>
                </div>
            </div>

            {/* Laser Simulation */}
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse"></div>
        </div>
    );
};
