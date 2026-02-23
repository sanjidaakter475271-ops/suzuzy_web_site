'use client';

import React, { useState } from 'react';
import { useCustomerStore } from '@/stores/customerStore';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent } from '@/components/ui';
import { User, Phone, Car, ChevronRight, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const CustomerRegisterPage = () => {
    const { register } = useCustomerStore();
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        vehicleModel: '',
        vehicleRegNo: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await register(formData);
            router.push('/customer/dashboard');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] py-12">
            <Card className="w-full max-w-lg border-2 border-surface-border dark:border-dark-border rounded-[2.5rem] shadow-xl overflow-hidden animate-fade relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
                <CardContent className="p-10 space-y-8">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
                            <User size={32} />
                        </div>
                        <h1 className="text-3xl font-black text-ink-heading dark:text-white uppercase tracking-tight">Create Account</h1>
                        <p className="text-ink-muted text-sm font-medium">Join RC Autocore for seamless service experience.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted group-focus-within:text-emerald-500 transition-colors" size={20} />
                                <input
                                    required
                                    type="text"
                                    placeholder="Full Name"
                                    className="w-full pl-12 pr-4 py-4 bg-surface-page dark:bg-dark-page border-2 border-surface-border dark:border-dark-border rounded-2xl font-bold outline-none focus:border-emerald-500 transition-all"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted group-focus-within:text-emerald-500 transition-colors" size={20} />
                                <input
                                    required
                                    type="tel"
                                    placeholder="Mobile Number"
                                    className="w-full pl-12 pr-4 py-4 bg-surface-page dark:bg-dark-page border-2 border-surface-border dark:border-dark-border rounded-2xl font-bold outline-none focus:border-emerald-500 transition-all"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative group">
                                    <Car className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted group-focus-within:text-emerald-500 transition-colors" size={20} />
                                    <input
                                        required
                                        type="text"
                                        placeholder="Vehicle Model"
                                        className="w-full pl-12 pr-4 py-4 bg-surface-page dark:bg-dark-page border-2 border-surface-border dark:border-dark-border rounded-2xl font-bold outline-none focus:border-emerald-500 transition-all"
                                        value={formData.vehicleModel}
                                        onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                                    />
                                </div>
                                <div className="relative group">
                                    <input
                                        required
                                        type="text"
                                        placeholder="Vehicle Reg No"
                                        className="w-full px-4 py-4 bg-surface-page dark:bg-dark-page border-2 border-surface-border dark:border-dark-border rounded-2xl font-bold outline-none focus:border-emerald-500 transition-all text-center uppercase placeholder:normal-case"
                                        value={formData.vehicleRegNo}
                                        onChange={(e) => setFormData({ ...formData, vehicleRegNo: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 gap-2 disabled:opacity-50 transition-all active:scale-95"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Register Vehicle'}
                            {!loading && <ArrowRight size={18} />}
                        </Button>
                    </form>

                    <div className="text-center pt-4 border-t border-surface-border dark:border-dark-border">
                        <p className="text-xs font-medium text-ink-muted">Already have an account?</p>
                        <Link href="/customer/login" className="text-sm font-black text-emerald-600 hover:underline mt-1 block uppercase tracking-wide">
                            Login Here
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default CustomerRegisterPage;
