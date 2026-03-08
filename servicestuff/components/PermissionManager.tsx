import React, { useEffect, useState } from 'react';
import { Camera, MapPin, CheckCircle, ShieldAlert } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Preferences } from '@capacitor/preferences';

export const PermissionManager: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [showPrompt, setShowPrompt] = useState(false);
    const [permissionsChecked, setPermissionsChecked] = useState(false);

    useEffect(() => {
        const checkInitialPermissions = async () => {
            if (!Capacitor.isNativePlatform()) {
                onComplete();
                return;
            }

            const { value } = await Preferences.get({ key: 'permissions_requested' });
            if (value === 'true') {
                onComplete();
                return;
            }

            setShowPrompt(true);
            setPermissionsChecked(true);
        };

        checkInitialPermissions();
    }, [onComplete]);

    const requestPermissions = async () => {
        try {
            await Geolocation.requestPermissions();
        } catch (e) {
            console.warn("Geolocation permission request failed", e);
        }

        try {
            await BarcodeScanner.requestPermissions();
        } catch (e) {
            console.warn("Camera permission request failed", e);
        }

        await Preferences.set({ key: 'permissions_requested', value: 'true' });
        setShowPrompt(false);
        onComplete();
    };

    if (!permissionsChecked || !showPrompt) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-slide-up border border-slate-700">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <ShieldAlert className="text-blue-600 dark:text-blue-400" size={32} />
                </div>

                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 font-display">App Permissions</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                    To provide a smooth experience, ServiceStuff needs access to a few device features.
                </p>

                <div className="space-y-4 mb-8 text-left">
                    <div className="flex items-start">
                        <div className="mt-1 p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg mr-3">
                            <Camera size={18} />
                        </div>
                        <div>
                            <p className="font-bold text-sm text-slate-900 dark:text-white">Camera Access</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Required for scanning barcodes and QR codes.</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <div className="mt-1 p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg mr-3">
                            <MapPin size={18} />
                        </div>
                        <div>
                            <p className="font-bold text-sm text-slate-900 dark:text-white">Location Services</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Used for accurate attendance logging.</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={requestPermissions}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                    <CheckCircle size={18} />
                    Continue
                </button>
            </div>
        </div>
    );
};
