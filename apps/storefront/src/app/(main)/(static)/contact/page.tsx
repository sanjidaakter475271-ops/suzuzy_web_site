'use client';

import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Globe } from 'lucide-react';
import { GlassCard } from '@/components/ui/premium/GlassCard';
import { GradientButton } from '@/components/ui/premium/GradientButton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const CONTACT_INFO = [
    { label: 'DIRECT CONCIERGE', value: '+880 1XXX-XXXXXX', icon: <Phone className="w-5 h-5 text-[#D4AF37]" />, desc: 'Available 9AM - 9PM' },
    { label: 'EMAIL ASSISTANCE', value: 'concierge@royalconsortium.com', icon: <Mail className="w-5 h-5 text-[#D4AF37]" />, desc: '24/7 Response time' },
    { label: 'HEADQUARTERS', value: 'Gulshan 2, Dhaka, BD', icon: <MapPin className="w-5 h-5 text-[#D4AF37]" />, desc: 'By appointment only' },
];

export default function ContactPage() {
    return (
        <div className="pt-32 pb-24 bg-[#0D0D0F] min-h-screen">
            <div className="max-w-7xl mx-auto px-6 sm:px-10">
                <div className="grid lg:grid-cols-2 gap-20 items-start">
                    {/* Left: Content */}
                    <div className="space-y-12">
                        <div>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2 mb-6"
                            >
                                <div className="h-px w-8 bg-[#D4AF37]" />
                                <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.5em]">Get In Touch</span>
                            </motion.div>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-6xl lg:text-8xl font-display font-black text-white italic tracking-tight mb-8"
                            >
                                LET'S <span className="text-white/20">CONNECT</span>
                            </motion.h1>
                            <p className="text-xl text-white/40 leading-relaxed font-medium italic max-w-lg">
                                Whether you're a discerning rider seeking your next masterpiece or a dealer looking to join our elite circle, our team is ready to assist.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {CONTACT_INFO.map((info, i) => (
                                <motion.div
                                    key={info.label}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <GlassCard className="p-6 border-white/5 flex gap-6 items-center group hover:border-[#D4AF37]/30 transition-all duration-500">
                                        <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-[#D4AF37]/10 transition-colors">
                                            {info.icon}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] mb-1">{info.label}</p>
                                            <p className="text-lg font-bold text-white mb-0.5">{info.value}</p>
                                            <p className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest opacity-60 italic">{info.desc}</p>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            ))}
                        </div>

                        {/* Social Links */}
                        <div className="pt-8 flex gap-4">
                            <div className="text-[10px] font-bold text-white/20 uppercase tracking-[0.5em] self-center mr-4 mt-1">FOLLOW US</div>
                            {[MessageSquare, Clock, Globe].map((Icon, i) => (
                                <button key={i} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-[#D4AF37] hover:border-[#D4AF37]/50 transition-all">
                                    <Icon className="w-5 h-5" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Form */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <GlassCard className="p-10 lg:p-16 border-white/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 blur-[100px] rounded-full -mr-32 -mt-32" />

                            <h3 className="text-3xl font-display font-black text-white italic mb-10 tracking-widest uppercase">SEND A MESSAGE</h3>

                            <form className="space-y-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">FULL NAME</label>
                                        <Input className="h-14 bg-white/5 border-white/10 rounded-2xl text-white focus:border-[#D4AF37]/50 outline-none transition-all px-6 font-bold" placeholder="E.g. Nazmul Hasan" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">PHONE NUMBER</label>
                                        <Input className="h-14 bg-white/5 border-white/10 rounded-2xl text-white focus:border-[#D4AF37]/50 outline-none transition-all px-6 font-bold" placeholder="+880 1XXX..." />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">EMAIL ADDRESS</label>
                                    <Input className="h-14 bg-white/5 border-white/10 rounded-2xl text-white focus:border-[#D4AF37]/50 outline-none transition-all px-6 font-bold" placeholder="your@email.com" />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">INQUIRY TYPE</label>
                                    <div className="relative">
                                        <select className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl text-white/60 focus:border-[#D4AF37]/50 outline-none transition-all px-6 font-bold text-sm appearance-none bg-none">
                                            <option>General Inquiry</option>
                                            <option>Dealer Partnership</option>
                                            <option>Customer Support</option>
                                            <option>Media & Press</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">YOUR MESSAGE</label>
                                    <Textarea className="min-h-[150px] bg-white/5 border-white/10 rounded-2xl text-white focus:border-[#D4AF37]/50 outline-none transition-all p-6 font-bold resize-none" placeholder="How can we assist you today?" />
                                </div>

                                <GradientButton className="w-full h-16 text-xs shadow-2xl shadow-[#D4AF37]/10">
                                    Deliver Message <Send className="w-4 h-4" />
                                </GradientButton>
                            </form>
                        </GlassCard>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
