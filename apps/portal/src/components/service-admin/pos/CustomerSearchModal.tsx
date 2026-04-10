'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, User, Phone, Mail, Bike, Check, X, Loader2 } from 'lucide-react';
import { usePOSStore } from '@/stores/service-admin/posStore';
import { cn } from '@/lib/utils';

interface CustomerSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CustomerSearchModal: React.FC<CustomerSearchModalProps> = ({ isOpen, onClose }) => {
    const { setSelectedCustomer, setSelectedVehicle } = usePOSStore();
    const [query, setQuery] = useState('');
    const [customers, setCustomers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setQuery('');
            setCustomers([]);
            setSelectedId(null);
            setSelectedVehicleId(null);
            return;
        }

        const fetchCustomers = async (searchQuery: string) => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/v1/customer/search?query=${encodeURIComponent(searchQuery)}`);
                const data = await res.json();
                if (data.success) {
                    setCustomers(data.data);
                }
            } catch (error) {
                console.error("Error searching customers:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            fetchCustomers(query);
        }, 300);

        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, [query, isOpen]);

    const handleConfirm = () => {
        const customer = customers.find(c => c.id === selectedId);
        if (customer) {
            setSelectedCustomer({
                id: customer.id,
                name: customer.full_name,
                phone: customer.phone,
                email: customer.email
            });

            if (selectedVehicleId) {
                const vehicle = customer.service_vehicles.find((v: any) => v.id === selectedVehicleId);
                if (vehicle) {
                    setSelectedVehicle({
                        id: vehicle.id,
                        regNo: vehicle.reg_no,
                        model: vehicle.bike_models?.name
                    });
                }
            }
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-dark-card border-2 border-orange-500/20 rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
                    <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500"><User size={24} /></div>
                            Select Customer & Vehicle
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Search by name, phone, or reg no.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-slate-400 transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-6 pb-0">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500 transition-colors" size={20} />
                        <input
                            autoFocus
                            type="text"
                            placeholder="Type name, phone number, engine, chassis or registration no..."
                            className="w-full bg-black/40 border-2 border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 transition-all text-sm font-bold shadow-inner"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        {isLoading && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <Loader2 className="animate-spin text-orange-500" size={20} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Results Area */}
                <div className="p-6 h-[400px] overflow-y-auto custom-scrollbar">
                    {customers.length === 0 && !isLoading ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 opacity-50">
                            <User size={64} strokeWidth={1} />
                            <p className="font-bold">No customers found.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {customers.map((customer) => (
                                <div
                                    key={customer.id}
                                    className={cn(
                                        "p-4 rounded-2xl border-2 transition-all cursor-pointer group",
                                        selectedId === customer.id
                                            ? "bg-orange-500/5 border-orange-500 shadow-lg shadow-orange-500/10"
                                            : "bg-white/5 border-transparent hover:border-white/10"
                                    )}
                                    onClick={() => setSelectedId(customer.id)}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-black text-sm">
                                                {customer.full_name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-white text-sm uppercase tracking-tight">{customer.full_name}</h3>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400"><Phone size={10} /> {customer.phone}</span>
                                                    {customer.email && <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400"><Mail size={10} /> {customer.email}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        {selectedId === customer.id && <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg"><Check size={14} strokeWidth={3} /></div>}
                                    </div>

                                    {/* Vehicles Sub-list */}
                                    {customer.service_vehicles?.length > 0 && (
                                        <div className="ml-13 grid grid-cols-1 gap-2 pt-2 border-t border-white/5 mt-2">
                                            {customer.service_vehicles.map((v: any) => (
                                                <div
                                                    key={v.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedId(customer.id);
                                                        setSelectedVehicleId(v.id);
                                                    }}
                                                    className={cn(
                                                        "flex items-center justify-between p-2 rounded-xl transition-all",
                                                        selectedVehicleId === v.id
                                                            ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                                                            : "bg-black/20 text-slate-400 hover:text-white"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Bike size={14} />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">{v.reg_no}</span>
                                                        <span className="text-[10px] font-bold opacity-60">| {v.bike_models?.name}</span>
                                                    </div>
                                                    {selectedVehicleId === v.id && <Check size={12} strokeWidth={3} />}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 bg-black/20 flex items-center justify-between">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={!selectedId}
                        onClick={handleConfirm}
                        className={cn(
                            "px-10 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-orange-500/20",
                            selectedId ? "bg-orange-600 hover:bg-orange-500 text-white" : "bg-slate-800 text-slate-500 cursor-not-allowed"
                        )}
                    >
                        Confirm Selection
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomerSearchModal;
