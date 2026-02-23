'use client';

import React, { useState } from 'react';
import { Button, Card, CardContent, DatePicker } from '@/components/ui';
import Breadcrumb from '@/components/Breadcrumb';
import { User, Car, ClipboardList, Camera, Save, ArrowRight, History, CheckCircle2, Plus } from 'lucide-react';
import { useWorkshopStore } from '@/stores/workshopStore';
import { useRouter } from 'next/navigation';
import { JobCard } from '@/types/workshop';

const CreateJobCard = () => {
    const router = useRouter();
    const { addJobCard, autoAssignRamp, ramps } = useWorkshopStore();
    const [step, setStep] = useState(1);

    // Form States
    const [customer, setCustomer] = useState({ mobile: '', name: '', address: '' });
    const [vehicle, setVehicle] = useState({ regNo: '', model: '', chassisNo: '', mileage: '' });
    const [serviceType, setServiceType] = useState('Paid Service');
    const [deliveryDate, setDeliveryDate] = useState<Date | null>(new Date());

    const complaintsList = [
        "Engine Noise", "Brake Issue", "Oil Change", "General Service", "Starting Problem", "Mileage Drop"
    ];
    const [selectedComplaints, setSelectedComplaints] = useState<string[]>([]);
    const [customComplaint, setCustomComplaint] = useState('');

    const availableRamp = ramps.find(r => r.status === 'available');

    const handleComplaintToggle = (complaint: string) => {
        if (selectedComplaints.includes(complaint)) {
            setSelectedComplaints(prev => prev.filter(c => c !== complaint));
        } else {
            setSelectedComplaints(prev => [...prev, complaint]);
        }
    };

    const handleConfirm = () => {
        const newJobNo = Math.floor(1000 + Math.random() * 9000).toString();
        const newId = 'JC' + newJobNo;

        const newJobCard: JobCard = {
            id: newId,
            jobNo: newJobNo,
            customerId: customer.mobile, // Mock ID
            customerName: customer.name,
            customerPhone: customer.mobile,
            vehicleId: vehicle.regNo,
            vehicleModel: vehicle.model,
            vehicleRegNo: vehicle.regNo,
            chassisNo: vehicle.chassisNo,
            complaints: customComplaint || selectedComplaints[0] || 'Regular Checkup',
            complaintChecklist: selectedComplaints,
            items: selectedComplaints.map(c => ({ description: c, status: 'pending', cost: 0 })),
            status: 'received',
            laborCost: 0,
            partsCost: 0,
            discount: 0,
            total: 0,
            warrantyType: serviceType.toLowerCase().includes('warranty') ? 'warranty' :
                serviceType.toLowerCase().includes('free') ? 'free-service' : 'paid',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            estimatedCompletion: deliveryDate?.toISOString(),
        };

        addJobCard(newJobCard);
        autoAssignRamp(newId);

        // Success redirect
        router.push('/workshop/job-cards');
    };

    return (
        <div className="p-6 lg:p-8 space-y-8 animate-fade max-w-5xl mx-auto">
            <Breadcrumb items={[{ label: 'Workshop' }, { label: 'New Job Card' }]} />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-ink-heading dark:text-white uppercase tracking-tight">Create Job Card</h1>
                    <p className="text-ink-muted mt-2">New service entry for walk-in or appointment customer.</p>
                </div>
                <div className="px-5 py-2.5 bg-brand/10 text-brand font-black uppercase rounded-2xl tracking-widest text-xs border-2 border-brand/20 shadow-soft">
                    Step {step} of 3
                </div>
            </div>

            {/* Steps Progress */}
            <div className="grid grid-cols-3 gap-6">
                {['Customer & Vehicle', 'Service & Complaints', 'Review & Assign'].map((label, idx) => (
                    <div key={idx} className="space-y-3">
                        <div className={`h-2 rounded-full transition-all duration-500 ${step > idx ? 'bg-brand' : 'bg-surface-border dark:bg-dark-border'}`}></div>
                        <p className={`text-[10px] font-black uppercase tracking-widest text-center ${step === idx + 1 ? 'text-brand' : 'text-ink-muted'}`}>{label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Form Area */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Step 1: Customer & Vehicle */}
                    {step === 1 && (
                        <Card className="animate-fade overflow-hidden rounded-[2.5rem]">
                            <CardContent className="p-10 space-y-10">
                                <div className="space-y-6">
                                    <h3 className="text-xl font-black text-ink-heading dark:text-white uppercase flex items-center gap-3">
                                        <div className="p-2 bg-brand/10 rounded-xl text-brand"><User size={24} /></div>
                                        Customer Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-ink-muted ml-1">Mobile Number</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. 01700000000"
                                                className="w-full bg-surface-page dark:bg-dark-page border-2 border-surface-border dark:border-dark-border rounded-2xl px-5 py-4 text-sm font-bold focus:border-brand outline-none transition-all"
                                                value={customer.mobile}
                                                onChange={(e) => setCustomer({ ...customer, mobile: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-ink-muted ml-1">Customer Name</label>
                                            <input
                                                type="text"
                                                placeholder="Enter full name"
                                                className="w-full bg-surface-page dark:bg-dark-page border-2 border-surface-border dark:border-dark-border rounded-2xl px-5 py-4 text-sm font-bold focus:border-brand outline-none transition-all"
                                                value={customer.name}
                                                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full h-px bg-surface-border dark:bg-dark-border"></div>

                                <div className="space-y-6">
                                    <h3 className="text-xl font-black text-ink-heading dark:text-white uppercase flex items-center gap-3">
                                        <div className="p-2 bg-brand/10 rounded-xl text-brand"><Car size={24} /></div>
                                        Vehicle Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-ink-muted ml-1">Reg. Number</label>
                                            <input
                                                type="text"
                                                placeholder="Dhaka Metro H-1234"
                                                className="w-full bg-surface-page dark:bg-dark-page border-2 border-surface-border dark:border-dark-border rounded-2xl px-5 py-4 text-sm font-bold focus:border-brand outline-none transition-all"
                                                value={vehicle.regNo}
                                                onChange={(e) => setVehicle({ ...vehicle, regNo: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-ink-muted ml-1">Model</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Yamaha FZ V3"
                                                className="w-full bg-surface-page dark:bg-dark-page border-2 border-surface-border dark:border-dark-border rounded-2xl px-5 py-4 text-sm font-bold focus:border-brand outline-none transition-all"
                                                value={vehicle.model}
                                                onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-ink-muted ml-1">Chassis Number</label>
                                            <input
                                                type="text"
                                                placeholder="Last 6 digits"
                                                className="w-full bg-surface-page dark:bg-dark-page border-2 border-surface-border dark:border-dark-border rounded-2xl px-5 py-4 text-sm font-bold focus:border-brand outline-none transition-all"
                                                value={vehicle.chassisNo}
                                                onChange={(e) => setVehicle({ ...vehicle, chassisNo: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-ink-muted ml-1">Current Mileage (KM)</label>
                                            <input
                                                type="text"
                                                placeholder="0"
                                                className="w-full bg-surface-page dark:bg-dark-page border-2 border-surface-border dark:border-dark-border rounded-2xl px-5 py-4 text-sm font-bold focus:border-brand outline-none transition-all"
                                                value={vehicle.mileage}
                                                onChange={(e) => setVehicle({ ...vehicle, mileage: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 2: Service & Complaints */}
                    {step === 2 && (
                        <Card className="animate-fade rounded-[2.5rem]">
                            <CardContent className="p-10 space-y-10">
                                <div className="space-y-6">
                                    <h3 className="text-xl font-black text-ink-heading dark:text-white uppercase flex items-center gap-3">
                                        <div className="p-2 bg-brand/10 rounded-xl text-brand"><ClipboardList size={24} /></div>
                                        Service Type
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {['Paid Service', 'Free Service', 'Warranty Claim', 'Accidental', 'Express Checkup'].map((type) => (
                                            <div
                                                key={type}
                                                onClick={() => setServiceType(type)}
                                                className={`p-5 rounded-2xl border-2 cursor-pointer font-black text-xs uppercase tracking-widest text-center transition-all duration-300 ${serviceType === type ? 'border-brand bg-brand text-white shadow-lg shadow-brand/20' : 'border-surface-border dark:border-dark-border hover:border-brand/40 text-ink-muted'}`}
                                            >
                                                {type}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-xl font-black text-ink-heading dark:text-white uppercase flex items-center gap-3">
                                        Expected Delivery
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <DatePicker
                                            label="Select Date"
                                            value={deliveryDate}
                                            onChange={setDeliveryDate}
                                            placeholder="Pick a date"
                                        />
                                    </div>
                                </div>

                                <div className="w-full h-px bg-surface-border dark:bg-dark-border"></div>

                                <div className="space-y-6">
                                    <h3 className="text-xl font-black text-ink-heading dark:text-white uppercase flex items-center gap-3">
                                        ⚠️ Customer Complaints
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {complaintsList.map((comp) => (
                                            <div
                                                key={comp}
                                                onClick={() => handleComplaintToggle(comp)}
                                                className={`p-4 rounded-2xl border-2 cursor-pointer text-sm font-black flex items-center justify-between gap-2 transition-all duration-300 ${selectedComplaints.includes(comp) ? 'bg-brand/10 border-brand text-brand' : 'bg-surface-page dark:bg-dark-page border-surface-border dark:border-dark-border text-ink-muted'}`}
                                            >
                                                <span>{comp}</span>
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedComplaints.includes(comp) ? 'bg-brand border-brand' : 'border-ink-muted/30'}`}>
                                                    {selectedComplaints.includes(comp) && <CheckCircle2 size={12} className="text-white" />}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-2 pt-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-ink-muted ml-1">Additional Complaints / Note</label>
                                        <textarea
                                            placeholder="Write detailed complaints here..."
                                            className="w-full bg-surface-page dark:bg-dark-page border-2 border-surface-border dark:border-dark-border rounded-2xl px-5 py-4 text-sm font-medium focus:border-brand outline-none transition-all min-h-[100px]"
                                            value={customComplaint}
                                            onChange={(e) => setCustomComplaint(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="w-full h-px bg-surface-border dark:bg-dark-border"></div>

                                <div className="space-y-6">
                                    <h3 className="text-xl font-black text-ink-heading dark:text-white uppercase flex items-center gap-3">
                                        <div className="p-2 bg-brand/10 rounded-xl text-brand"><Camera size={24} /></div>
                                        Vehicle Photos
                                    </h3>
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="aspect-square border-2 border-dashed border-surface-border dark:border-dark-border rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-brand hover:text-brand transition-all text-ink-muted">
                                            <Plus size={24} />
                                            <span className="text-[10px] font-black uppercase">Add Photo</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 3: Review & Auto Assign */}
                    {step === 3 && (
                        <Card className="animate-fade overflow-hidden rounded-[2.5rem] bg-surface-page/30 dark:bg-dark-page/20 border-brand/20">
                            <CardContent className="p-10 flex flex-col items-center text-center space-y-8">
                                <div className="w-24 h-24 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shadow-inner">
                                    <CheckCircle2 size={48} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-ink-heading dark:text-white uppercase tracking-tight">Review Job Details</h2>
                                    <p className="text-ink-muted mt-2 max-w-sm mx-auto font-medium">
                                        System will assign this job to <span className="text-brand font-black underline decoration-brand/30">{availableRamp?.name || 'Waitlist'}</span> based on availability.
                                    </p>
                                </div>

                                <div className="w-full bg-white dark:bg-dark-card border-2 border-surface-border dark:border-dark-border rounded-[2rem] p-8 text-left space-y-6 max-w-lg shadow-soft relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-brand pointer-events-none">
                                        <Save size={120} />
                                    </div>
                                    <div className="flex justify-between items-center group">
                                        <span className="text-[10px] font-black text-ink-muted uppercase tracking-wider">Customer</span>
                                        <span className="text-sm font-black text-ink-heading dark:text-white group-hover:text-brand transition-colors">{customer.name} ({customer.mobile})</span>
                                    </div>
                                    <div className="flex justify-between items-center group">
                                        <span className="text-[10px] font-black text-ink-muted uppercase tracking-wider">Vehicle</span>
                                        <span className="text-sm font-black text-ink-heading dark:text-white group-hover:text-brand transition-colors">{vehicle.model} - {vehicle.regNo}</span>
                                    </div>
                                    <div className="flex justify-between items-center group">
                                        <span className="text-[10px] font-black text-ink-muted uppercase tracking-wider">Service Type</span>
                                        <div className="px-3 py-1 bg-brand text-white rounded-lg text-[10px] font-black uppercase tracking-widest">{serviceType}</div>
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-[10px] font-black text-ink-muted uppercase tracking-wider block">Complaints</span>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedComplaints.map(c => (
                                                <span key={c} className="text-[10px] font-black text-ink-heading dark:text-white bg-surface-page dark:bg-dark-page px-3 py-1.5 rounded-full border border-surface-border dark:border-dark-border">{c}</span>
                                            ))}
                                            {customComplaint && <span className="text-[10px] font-black text-ink-heading dark:text-white bg-surface-page dark:bg-dark-page px-3 py-1.5 rounded-full border border-surface-border dark:border-dark-border">{customComplaint}</span>}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="flex justify-between pt-6">
                        {step > 1 ? (
                            <Button variant="outline" onClick={() => setStep(step - 1)} className="px-10 h-14 rounded-2xl font-black uppercase text-xs tracking-[0.2em]">Back</Button>
                        ) : <div></div>}

                        {step < 3 ? (
                            <Button
                                variant="primary"
                                onClick={() => setStep(step + 1)}
                                className="px-10 h-14 rounded-2xl font-black uppercase text-xs tracking-[0.2em] gap-3 shadow-lg shadow-brand/20"
                            >
                                CONTINUE <ArrowRight size={20} />
                            </Button>
                        ) : (
                            <Button
                                variant="primary"
                                onClick={handleConfirm}
                                className="px-10 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-black uppercase text-xs tracking-[0.2em] gap-3 shadow-xl shadow-emerald-600/30 active:scale-95 transition-all"
                            >
                                CREATE & ASSIGN <Save size={20} />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Side Panel: Quick Stats/Info */}
                <div className="space-y-6">
                    <div className="bg-brand text-white p-8 rounded-[2.5rem] shadow-xl shadow-brand/20 relative overflow-hidden group">
                        <div className="absolute -bottom-10 -right-10 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <Car size={180} />
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] opacity-70 mb-2">Live Shop Load</h4>
                        <div className="text-4xl font-black mb-4 flex items-baseline gap-2">
                            {ramps.filter(r => r.status === 'available').length}
                            <span className="text-xs font-bold opacity-60">AVAILABLE</span>
                        </div>
                        <p className="text-xs opacity-90 leading-relaxed font-bold tracking-wide">
                            Auto-routing system is active. Your current wait time is <span className="underline decoration-white/40">~5 mins</span>.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-[2.5rem] p-10 shadow-card">
                        <h4 className="text-xs font-black text-ink-muted uppercase tracking-widest mb-6">Service History</h4>
                        <div className="space-y-6">
                            {[1, 2].map(i => (
                                <div key={i} className="flex gap-4 pb-6 border-b border-surface-border dark:border-dark-border last:border-0 last:pb-0 group cursor-default">
                                    <div className="p-3 bg-surface-page dark:bg-dark-page rounded-2xl h-fit text-ink-muted group-hover:text-brand transition-colors border border-surface-border dark:border-dark-border">
                                        <History size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-ink-heading dark:text-white uppercase tracking-tight">10 Jan 2026</p>
                                        <p className="text-[10px] text-ink-muted font-black uppercase tracking-widest mt-1">General Service • ৳1,200</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" className="w-full mt-8 rounded-2xl h-12 text-xs font-black uppercase tracking-widest">
                            View Archived
                        </Button>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default CreateJobCard;
