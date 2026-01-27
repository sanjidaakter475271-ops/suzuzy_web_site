'use client';

import { useState } from 'react';
import { useZxing } from 'react-zxing';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Scan } from 'lucide-react';

interface BarcodeScannerProps {
    onScan: (code: string) => void;
    trigger?: React.ReactNode;
}

export function BarcodeScanner({ onScan, trigger }: BarcodeScannerProps) {
    const [isOpen, setIsOpen] = useState(false);

    // We only enable the scanner when the dialog is open to save resources
    const { ref } = useZxing({
        paused: !isOpen,
        constraints: { video: { facingMode: 'environment' } },
        onDecodeResult(result) {
            const code = result.getText();
            if (code) {
                // Play a beep sound for feedback
                const audio = new Audio('/sounds/beep.mp3'); // We'll need to add this or ignore if missing
                audio.play().catch(e => console.log('Audio play failed', e));

                onScan(code);
                setIsOpen(false);
            }
        },
        onError() {
            // Ignore minor scanning errors, log only critical ones if needed
        },
    });

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="icon" className="h-10 w-10 border-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37]/10">
                        <Scan className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-[#0D0D0F] border-[#D4AF37]/20 text-white p-0 overflow-hidden">
                <DialogHeader className="p-4 border-b border-white/10 bg-white/5">
                    <DialogTitle className="flex items-center gap-2 text-[#D4AF37]">
                        <Scan className="w-5 h-5" />
                        বারকোড স্ক্যান করুন
                    </DialogTitle>
                </DialogHeader>

                <div className="relative aspect-square w-full bg-black flex items-center justify-center overflow-hidden">
                    {/* Camera View */}
                    <video ref={ref} className="absolute inset-0 w-full h-full object-cover" />

                    {/* Scanning Overlay */}
                    <div className="absolute inset-0 border-[40px] border-black/60 pointer-events-none">
                        <div className="w-full h-full border-2 border-[#D4AF37] relative animate-pulse">
                            <div className="absolute top-1/2 w-full h-0.5 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
                        </div>
                    </div>

                    <p className="absolute bottom-8 text-xs font-bold text-white/80 bg-black/60 px-3 py-1 rounded-full border border-white/10">
                        ক্যামেরার সামনে বারকোড ধরুন
                    </p>
                </div>

                <div className="p-4 bg-white/5 text-center">
                    <Button
                        variant="ghost"
                        className="w-full text-white/40 hover:text-white hover:bg-white/10"
                        onClick={() => setIsOpen(false)}
                    >
                        বন্ধ করুন
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
