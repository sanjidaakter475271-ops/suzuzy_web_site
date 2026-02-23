'use client';

import React, { useState } from 'react';
import { useCustomerStore } from '@/stores/customerStore';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent } from '@/components/ui';
import { Phone, Lock, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const CustomerLoginPage = () => {
    const { login } = useCustomerStore();
    const router = useRouter();
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState(['', '', '', '']);
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async () => {
        if (phone.length < 11) return;
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLoading(false);
        setStep('otp');
    };

    const handleVerifyOtp = async () => {
        const otpString = otp.join('');
        if (otpString.length !== 4) return;

        setLoading(true);
        const success = await login(phone, otpString);
        setLoading(false);

        if (success) {
            router.push('/customer/dashboard');
        } else {
            alert('Invalid OTP (Try 1234)');
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto focus next input
        if (value && index < 3) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <Card className="w-full max-w-md border-2 border-surface-border dark:border-dark-border rounded-[2.5rem] shadow-xl overflow-hidden animate-fade relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand to-purple-600"></div>
                <CardContent className="p-10 space-y-8">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-brand/10 text-brand rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-brand/20">
                            <Lock size={32} />
                        </div>
                        <h1 className="text-3xl font-black text-ink-heading dark:text-white uppercase tracking-tight">Welcome Back</h1>
                        <p className="text-ink-muted text-sm font-medium">Access your service history & track repairs.</p>
                    </div>

                    {step === 'phone' ? (
                        <div className="space-y-6 animate-fade">
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted group-focus-within:text-brand transition-colors" size={20} />
                                <input
                                    type="tel"
                                    placeholder="Enter Mobile Number"
                                    className="w-full pl-12 pr-4 py-4 bg-surface-page dark:bg-dark-page border-2 border-surface-border dark:border-dark-border rounded-2xl text-lg font-bold outline-none focus:border-brand transition-all"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                            <Button
                                onClick={handleSendOtp}
                                disabled={loading || phone.length < 11}
                                className="w-full h-14 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-brand/20 gap-2 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Send OTP'}
                                {!loading && <ChevronRight size={18} />}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-fade">
                            <div className="flex justify-center gap-4">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`otp-${index}`}
                                        type="text"
                                        maxLength={1}
                                        className="w-14 h-16 text-center text-2xl font-black bg-surface-page dark:bg-dark-page border-2 border-surface-border dark:border-dark-border rounded-2xl focus:border-brand outline-none transition-all"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Backspace' && !digit && index > 0) {
                                                document.getElementById(`otp-${index - 1}`)?.focus();
                                            }
                                        }}
                                    />
                                ))}
                            </div>
                            <Button
                                onClick={handleVerifyOtp}
                                disabled={loading || otp.join('').length !== 4}
                                className="w-full h-14 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-brand/20 gap-2 disabled:opacity-50"
                            >
                                {loading && <Loader2 className="animate-spin" />}
                                Verify & Login
                            </Button>
                            <p className="text-center text-xs text-ink-muted cursor-pointer hover:text-brand transition-colors font-bold" onClick={() => setStep('phone')}>
                                Change Number?
                            </p>
                        </div>
                    )}

                    <div className="text-center pt-4 border-t border-surface-border dark:border-dark-border">
                        <p className="text-xs font-medium text-ink-muted">Don't have an account?</p>
                        <Link href="/customer/register" className="text-sm font-black text-brand hover:underline mt-1 block uppercase tracking-wide">
                            Create New Account
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default CustomerLoginPage;
