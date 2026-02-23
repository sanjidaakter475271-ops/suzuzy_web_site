'use client';

import React, { useState, useEffect } from 'react';
import { useCustomerStore } from '@/stores/customerStore';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent } from '@/components/ui';
import { Bike, PenTool, CheckCircle2, ArrowRight } from 'lucide-react';

const RequestServicePage = () => {
    const { customer, isAuthenticated, requestService } = useCustomerStore();
    const router = useRouter();
    const [selectedVehicleId, setSelectedVehicleId] = useState('');
    const [complaint, setComplaint] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (!isAuthenticated) router.push('/customer/login');
    }, [isAuthenticated, router]);

    if (!mounted || !isAuthenticated) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedVehicleId || !complaint) return;

        requestService(selectedVehicleId, complaint);
        router.push('/customer/dashboard'); // Or show success modal
    };

    return (
        <div className="max-w-2xl mx-auto py-12 animate-fade">
            <h1 className="text-3xl font-black text-ink-heading dark:text-white uppercase tracking-tight mb-8 pl-4 border-l-4 border-brand">Request Service</h1>

            <Card className="rounded-[2.5rem] border-2 border-surface-border dark:border-dark-border shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-brand to-purple-600"></div>
                <CardContent className="p-10 space-y-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-ink-muted mb-4 block">Select Vehicle</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {customer?.vehicles.map(v => (
                                    <div
                                        key={v.id}
                                        onClick={() => setSelectedVehicleId(v.id)}
                                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${selectedVehicleId === v.id ? 'border-brand bg-brand/5 shadow-inner' : 'border-surface-border dark:border-dark-border hover:border-brand/40'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedVehicleId === v.id ? 'bg-brand text-white' : 'bg-surface-page dark:bg-dark-page text-ink-muted'}`}>
                                            <Bike size={20} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-black text-ink-heading dark:text-white">{v.model}</div>
                                            <div className="text-xs font-bold text-ink-muted uppercase">{v.regNo}</div>
                                        </div>
                                        {selectedVehicleId === v.id && <CheckCircle2 className="text-brand ml-auto" size={20} />}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-ink-muted mb-4 block flex items-center gap-2">
                                <PenTool size={14} /> Description of Issue
                            </label>
                            <textarea
                                className="w-full bg-surface-page dark:bg-dark-page border-2 border-surface-border dark:border-dark-border rounded-2xl p-6 text-sm font-medium focus:border-brand outline-none min-h-[150px] resize-none"
                                placeholder="Describe the issues you are facing (e.g. Engine noise, Brake check...)"
                                value={complaint}
                                onChange={(e) => setComplaint(e.target.value)}
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={!selectedVehicleId || !complaint}
                            className="w-full h-14 bg-brand hover:bg-brand-dark rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-brand/20 gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Submit Request <ArrowRight size={18} />
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default RequestServicePage;
