"use client";

import { useEffect, useState, useTransition } from "react";
import {
    Megaphone,
    Plus,
    Trash2,
    Eye,
    Image as ImageIcon,
    Link as LinkIcon,
    Loader2,
    MoreVertical
} from "lucide-react";
import { GlassCard } from "@/components/ui/premium/GlassCard";
import { MetallicText } from "@/components/ui/premium/MetallicText";
import { GradientButton } from "@/components/ui/premium/GradientButton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DealerAd {
    id: string;
    title: string;
    image_url: string;
    link: string;
    status: 'active' | 'inactive' | 'draft';
    created_at: string;
}

export default function MarketingPage() {
    const { profile } = useUser();
    const [loading, setLoading] = useState(true);
    const [ads, setAds] = useState<DealerAd[]>([]);
    const [isPending, startTransition] = useTransition();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // New Ad Form State
    const [newAd, setNewAd] = useState({
        title: '',
        image_url: '',
        link: ''
    });

    useEffect(() => {
        if (profile?.dealer_id) {
            fetchAds();
        }
    }, [profile?.dealer_id]);

    const fetchAds = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('dealer_ads')
            .select('*')
            .eq('dealer_id', profile?.dealer_id)
            .order('created_at', { ascending: false });

        if (error) {
            toast.error("Failed to load advertisements");
        } else {
            setAds(data || []);
        }
        setLoading(false);
    };

    const handleCreateAd = async () => {
        if (!newAd.title || !newAd.image_url) {
            toast.error("Title and Image URL are required");
            return;
        }

        startTransition(async () => {
            const { error } = await supabase
                .from('dealer_ads')
                .insert({
                    dealer_id: profile?.dealer_id,
                    title: newAd.title,
                    image_url: newAd.image_url,
                    link: newAd.link,
                    status: 'active'
                });

            if (error) {
                toast.error(error.message);
            } else {
                toast.success("Ad campaign launched successfully");
                setIsCreateOpen(false);
                setNewAd({ title: '', image_url: '', link: '' });
                fetchAds();
            }
        });
    };

    const handleDeleteAd = async (id: string) => {
        const { error } = await supabase.from('dealer_ads').delete().eq('id', id);
        if (error) {
            toast.error("Failed to delete ad");
        } else {
            toast.success("Ad removed");
            setAds(ads.filter(a => a.id !== id));
        }
    };

    const toggleStatus = async (ad: DealerAd) => {
        const newStatus = ad.status === 'active' ? 'inactive' : 'active';
        const { error } = await supabase
            .from('dealer_ads')
            .update({ status: newStatus })
            .eq('id', ad.id);

        if (error) {
            toast.error("Update failed");
        } else {
            setAds(ads.map(a => a.id === ad.id ? { ...a, status: newStatus } : a));
            toast.success(`Campaign ${newStatus === 'active' ? 'activated' : 'paused'}`);
        }
    };

    if (loading && ads.length === 0) {
        return (
            <div className="h-full w-full min-h-[600px] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 selection:bg-[#D4AF37] selection:text-[#0D0D0F]">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                <div>
                    <div className="flex items-center gap-2 mb-2 text-[#D4AF37]/60">
                        <Megaphone className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Promotional Command</span>
                    </div>
                    <h1 className="text-5xl font-display font-black text-white italic tracking-tighter leading-none">
                        CAMPAIGN <MetallicText>MANAGER</MetallicText>
                    </h1>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <GradientButton className="h-14 px-8 text-[10px] font-black uppercase italic tracking-[0.2em] shadow-[0_10px_40px_rgba(212,175,55,0.2)]">
                            <Plus className="w-4 h-4 mr-2" /> Launch Campaign
                        </GradientButton>
                    </DialogTrigger>
                    <DialogContent className="bg-[#1A1A1C] border-[#D4AF37]/20 text-white sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-display font-black italic text-white uppercase">New Campaign</DialogTitle>
                            <DialogDescription className="text-white/40 text-xs text-left">
                                Create a new promotional banner for your public showroom profile.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">Campaign Title</label>
                                <Input
                                    placeholder="e.g. Winter Clearance Sale"
                                    className="bg-white/5 border-white/10 rounded-xl h-12 text-white placeholder:text-white/20"
                                    value={newAd.title}
                                    onChange={(e) => setNewAd({ ...newAd, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">Visual Asset URL</label>
                                <Input
                                    placeholder="https://..."
                                    className="bg-white/5 border-white/10 rounded-xl h-12 text-white placeholder:text-white/20 font-mono text-xs"
                                    value={newAd.image_url}
                                    onChange={(e) => setNewAd({ ...newAd, image_url: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">Destination Link (Optional)</label>
                                <Input
                                    placeholder="https://..."
                                    className="bg-white/5 border-white/10 rounded-xl h-12 text-white placeholder:text-white/20 font-mono text-xs"
                                    value={newAd.link}
                                    onChange={(e) => setNewAd({ ...newAd, link: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                onClick={handleCreateAd}
                                disabled={isPending}
                                className="w-full bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-black uppercase tracking-widest h-12 rounded-xl"
                            >
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Launch Now'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Ads Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {ads.map((ad) => (
                    <GlassCard key={ad.id} className="group relative overflow-hidden p-0 border-[#D4AF37]/10 bg-[#0D0D0F]/40 hover:border-[#D4AF37]/30 transition-all duration-500">
                        {/* Image Area */}
                        <div className="aspect-video relative overflow-hidden bg-white/5">
                            <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0F] to-transparent opacity-80" />

                            {/* Status Badge */}
                            <div className="absolute top-4 left-4">
                                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 backdrop-blur-md border ${ad.status === 'active'
                                        ? 'bg-green-500/20 border-green-500/30 text-green-500'
                                        : 'bg-white/10 border-white/10 text-white/40'
                                    }`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${ad.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-white/40'}`} />
                                    {ad.status}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="absolute top-4 right-4">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-black/50 hover:bg-[#D4AF37] text-white hover:text-black transition-colors backdrop-blur-md border border-white/10">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="bg-[#1A1A1C] border-[#D4AF37]/20 text-white animate-in zoom-in-95">
                                        <DropdownMenuItem onClick={() => toggleStatus(ad)} className="focus:bg-white/10 cursor-pointer text-xs font-bold uppercase tracking-wider">
                                            {ad.status === 'active' ? 'Pause Campaign' : 'Resume Campaign'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleDeleteAd(ad.id)} className="focus:bg-red-500/20 text-red-500 cursor-pointer text-xs font-bold uppercase tracking-wider">
                                            Delete Asset
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="p-6">
                            <h3 className="text-xl font-display font-black italic text-white mb-2 line-clamp-1">{ad.title}</h3>
                            {ad.link && (
                                <div className="flex items-center gap-2 text-white/40 text-xs mb-4">
                                    <LinkIcon className="w-3 h-3" />
                                    <span className="truncate font-mono opacity-70">{ad.link}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]/60 pt-4 border-t border-white/5">
                                <span>Views: --</span> {/* Analytics placeholder */}
                                <span>Clicks: --</span>
                            </div>
                        </div>
                    </GlassCard>
                ))}

                {/* Empty State */}
                {ads.length === 0 && (
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="aspect-video rounded-[2rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-4 group hover:border-[#D4AF37]/30 hover:bg-white/[0.02] transition-all"
                    >
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                            <Plus className="w-8 h-8 text-white/20 group-hover:text-[#D4AF37]" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-white/20 group-hover:text-white/60">Create First Campaign</p>
                    </button>
                )}
            </div>
        </div>
    );
}
