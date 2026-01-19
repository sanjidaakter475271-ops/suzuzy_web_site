"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    MapPin,
    Globe,
    Phone,
    Mail,
    Star,
    CheckCircle2,
    MessageCircle,
    Share2,
    Calendar,
    ShoppingBag,
    ShieldCheck,
    Megaphone,
    ArrowRight
} from "lucide-react";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion } from "framer-motion";

// Premium UI Components Inline (to avoid dependency issues if not shared)
const GlassCard = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={`bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl ${className}`} {...props}>
        {children}
    </div>
);

const MetallicText = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <span className={`bg-gradient-to-b from-[#F8F8F8] via-[#E2E2E2] to-[#A1A1AA] bg-clip-text text-transparent drop-shadow-sm ${className}`}>
        {children}
    </span>
);

export default function DealerProfilePage() {
    const params = useParams();
    const slug = params?.slug as string;

    const [dealer, setDealer] = useState<any>(null);
    const [ads, setAds] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [activeTab, setActiveTab] = useState("home");

    useEffect(() => {
        if (slug) fetchDealerData();
    }, [slug]);

    const fetchDealerData = async () => {
        setLoading(true);
        // 1. Fetch Dealer
        const { data: dealerData, error } = await supabase
            .from('dealers')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error || !dealerData) {
            setLoading(false);
            return;
        }

        setDealer(dealerData);

        // 2. Fetch Active Ads
        const { data: adsData } = await supabase
            .from('dealer_ads')
            .select('*')
            .eq('dealer_id', dealerData.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false });

        setAds(adsData || []);

        // 3. Fetch Featured Products (Active)
        const { data: prodData } = await supabase
            .from('products')
            .select('*')
            .eq('dealer_id', dealerData.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(10);

        setProducts(prodData || []);

        // 4. Fetch Reviews
        const { data: reviewData } = await supabase
            .from('dealer_reviews')
            .select('*, profiles(full_name, avatar_url)')
            .eq('dealer_id', dealerData.id)
            .order('created_at', { ascending: false });

        setReviews(reviewData || []);

        setLoading(false);
    };

    const handleReviewSubmit = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            toast.error("Please sign in to write a review");
            return;
        }

        setSubmittingReview(true);
        const { error } = await supabase.from('dealer_reviews').insert({
            dealer_id: dealer.id,
            user_id: user.id,
            rating: reviewForm.rating,
            comment: reviewForm.comment
        });

        if (error) {
            toast.error("Failed to post review");
        } else {
            toast.success("Review posted successfully!");
            setReviewForm({ rating: 5, comment: '' });
            fetchDealerData(); // Refresh
        }
        setSubmittingReview(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0D0D0F] flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!dealer) {
        return (
            <div className="min-h-screen bg-[#0D0D0F] flex flex-col items-center justify-center text-white space-y-4">
                <ShieldCheck className="w-16 h-16 text-[#D4AF37]/50" />
                <h1 className="text-2xl font-display font-bold">Dealer Not Found</h1>
                <Link href="/" className="text-[#D4AF37] hover:underline">Return Home</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0D0D0F] text-[#F8F8F8] pb-20 selection:bg-[#D4AF37]/30">
            {/* Background Texture */}
            <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none z-0" />

            {/* Hero Cover */}
            <div className="relative z-10 w-full">
                <div className="h-[300px] md:h-[450px] w-full relative overflow-hidden group">
                    {dealer.cover_photo_url ? (
                        <Image
                            src={dealer.cover_photo_url}
                            alt="Cover"
                            fill
                            className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000"
                            priority
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-[#1A1A1C] to-[#0D0D0F]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0F] via-[#0D0D0F]/60 to-transparent" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    {/* Profile Header Block */}
                    <div className="flex flex-col md:flex-row items-end -mt-20 md:-mt-32 pb-8 gap-8">
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.6 }}
                            className="relative"
                        >
                            <div className="w-32 h-32 md:w-48 md:h-48 rounded-3xl border border-white/10 bg-[#1A1A1C] shadow-2xl overflow-hidden relative z-10 p-1">
                                <Avatar className="w-full h-full rounded-2xl">
                                    <AvatarImage src={dealer.logo_url} className="object-cover" />
                                    <AvatarFallback className="text-5xl font-black bg-[#1A1A1C] text-[#D4AF37]">
                                        {dealer.business_name[0]}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            {dealer.status === 'verified' && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="absolute -bottom-2 -right-2 md:bottom-2 md:right-2 z-20 bg-gradient-to-br from-[#D4AF37] to-[#B8962E] text-black rounded-full p-2 border-4 border-[#0D0D0F] shadow-lg"
                                    title="Verified Dealer"
                                >
                                    <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
                                </motion.div>
                            )}
                        </motion.div>

                        <div className="flex-1 text-center md:text-left mb-2 md:mb-6 space-y-2">
                            <motion.h1
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-4xl md:text-5xl font-display font-black tracking-tight"
                            >
                                <MetallicText>{dealer.business_name}</MetallicText>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-white/60 font-medium text-lg max-w-2xl mx-auto md:mx-0"
                            >
                                {dealer.description || "Authorized Retail Partner"}
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 mt-3 text-sm text-white/50 font-bold tracking-wide uppercase"
                            >
                                <div className="flex items-center gap-1.5 hover:text-[#D4AF37] transition-colors cursor-default">
                                    <MapPin className="w-4 h-4 text-[#D4AF37]" />
                                    {dealer.city}, {dealer.district}
                                </div>
                                {dealer.website && (
                                    <a href={dealer.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[#D4AF37] transition-colors">
                                        <Globe className="w-4 h-4 text-[#D4AF37]" />
                                        Website
                                    </a>
                                )}
                                <div className="flex items-center gap-1.5 text-[#D4AF37]">
                                    <Star className="w-4 h-4 fill-current" />
                                    {Number(dealer.average_rating || 5.0).toFixed(1)} <span className="text-white/50">Rating</span>
                                </div>
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex gap-3 w-full md:w-auto mb-2 md:mb-6"
                        >
                            <Button className="flex-1 md:flex-none h-12 px-8 bg-[#D4AF37] text-black font-black uppercase tracking-widest hover:bg-[#B8962E] transition-all rounded-xl">
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Contact
                            </Button>
                            <Button variant="outline" className="h-12 w-12 p-0 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-[#D4AF37] rounded-xl transition-colors">
                                <Share2 className="w-5 h-5" />
                            </Button>
                        </motion.div>
                    </div>

                    <Separator className="bg-white/10 mb-8" />

                    {/* Navigation Tabs */}
                    <div className="flex gap-8 overflow-x-auto pb-4 mb-2 scrollbar-hide">
                        {["home", "inventory", "reviews", "about"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`text-sm font-bold uppercase tracking-widest px-2 pb-2 transition-all whitespace-nowrap border-b-2 ${activeTab === tab
                                    ? "text-[#D4AF37] border-[#D4AF37]"
                                    : "text-white/40 border-transparent hover:text-white hover:border-white/20"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 relative z-10 w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Sidebar (About & Info) */}
                    <div className="space-y-6">
                        <GlassCard className="p-6">
                            <h3 className="font-display font-bold text-lg mb-6 text-white flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                                Verification
                            </h3>
                            <div className="space-y-5 text-sm font-medium text-white/70">
                                <div className="flex items-start gap-3 group">
                                    <div className="p-2 bg-white/5 rounded-lg text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-colors">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white/40 text-xs uppercase tracking-wider mb-1">HQ Location</p>
                                        <p>{dealer.address_line1}</p>
                                        <p>{dealer.city}, {dealer.district}</p>
                                    </div>
                                </div>
                                <Separator className="bg-white/5" />
                                <div className="flex items-start gap-3 group">
                                    <div className="p-2 bg-white/5 rounded-lg text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-colors">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Partnership</p>
                                        <p>Member Since {format(new Date(dealer.created_at), 'MMMM yyyy')}</p>
                                    </div>
                                </div>
                                <Separator className="bg-white/5" />
                                {dealer.phone && (
                                    <div className="flex items-start gap-3 group">
                                        <div className="p-2 bg-white/5 rounded-lg text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-colors">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Direct Line</p>
                                            <p className="font-mono text-[#D4AF37]">{dealer.phone}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </GlassCard>

                        {/* Social Links */}
                        {dealer.social_links && Object.keys(dealer.social_links).length > 0 && (
                            <GlassCard className="p-6">
                                <h3 className="font-display font-bold text-lg mb-4 text-white">Digital Presence</h3>
                                <div className="flex flex-col gap-3">
                                    {Object.entries(dealer.social_links).map(([platform, url]: [string, any]) => (
                                        url && (
                                            <a
                                                key={platform}
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 text-white/60 hover:text-white transition-colors bg-white/5 p-3 rounded-xl hover:bg-white/10 group"
                                            >
                                                <Globe className="w-4 h-4 text-[#D4AF37] group-hover:scale-110 transition-transform" />
                                                <span className="font-bold text-sm capitalize tracking-wide">{platform}</span>
                                                <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </a>
                                        )
                                    ))}
                                </div>
                            </GlassCard>
                        )}
                    </div>

                    {/* Middle Feed (Ads & Posts) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Ads Carousel / Feed */}
                        {ads.map((ad) => (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={ad.id}
                            >
                                <GlassCard className="overflow-hidden group">
                                    <div className="p-4 flex items-center justify-between border-b border-white/5">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-10 h-10 border border-white/10">
                                                <AvatarImage src={dealer.logo_url} />
                                                <AvatarFallback>{dealer.business_name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h4 className="font-bold text-white text-sm leading-tight flex items-center gap-2">
                                                    {dealer.business_name}
                                                    <span className="text-[10px] bg-[#D4AF37]/20 text-[#D4AF37] px-1.5 py-0.5 rounded border border-[#D4AF37]/30 uppercase tracking-wider">
                                                        Sponsored
                                                    </span>
                                                </h4>
                                                <p className="text-xs text-white/40 font-medium mt-0.5">
                                                    Posted on {format(new Date(ad.created_at), 'MMMM d')}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white cursor-pointer transition-colors">
                                            <Share2 className="w-4 h-4" />
                                        </div>
                                    </div>

                                    <div className="px-5 py-4">
                                        <p className="text-white/90 text-lg font-display leading-relaxed">{ad.title}</p>
                                    </div>

                                    {ad.image_url && (
                                        <div className="relative aspect-video bg-[#0D0D0F]">
                                            <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 hover:opacity-100" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0F] via-transparent to-transparent opacity-60" />
                                        </div>
                                    )}

                                    {ad.link && (
                                        <div className="bg-white/5 p-4 flex justify-between items-center border-t border-white/5 backdrop-blur-3xl">
                                            <span className="text-xs text-[#D4AF37] uppercase font-black tracking-widest flex items-center gap-2">
                                                <Megaphone className="w-4 h-4" />
                                                Limited Time Offer
                                            </span>
                                            <Button size="sm" className="h-9 px-6 bg-white text-black font-bold uppercase text-xs tracking-widest hover:bg-[#D4AF37] transition-colors" asChild>
                                                <a href={ad.link} target="_blank">View Details</a>
                                            </Button>
                                        </div>
                                    )}
                                </GlassCard>
                            </motion.div>
                        ))}

                        {/* Recent Products Feed */}
                        <GlassCard className="p-8">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="font-display font-black text-2xl text-white italic">Featured <MetallicText>Inventory</MetallicText></h3>
                                <Link href="#" className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest hover:underline flex items-center gap-1">
                                    View Full Catalog <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {products.map((product) => (
                                    <Link href={`/product/${product.id}`} key={product.id} className="group block bg-[#0D0D0F] rounded-2xl border border-white/5 overflow-hidden hover:border-[#D4AF37]/50 transition-all hover:shadow-[0_0_30px_-5px_rgba(212,175,55,0.2)]">
                                        <div className="aspect-[4/3] bg-[#1A1A1C] relative overflow-hidden">
                                            {/* Placeholder for product image logic */}
                                            <div className="absolute inset-0 flex items-center justify-center text-white/10 group-hover:text-[#D4AF37]/20 transition-colors">
                                                <ShoppingBag className="w-12 h-12" />
                                            </div>
                                            <div className="absolute top-3 right-3 bg-[#D4AF37] text-black text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">
                                                In Stock
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            <h4 className="font-bold text-white text-lg truncate mb-1 group-hover:text-[#D4AF37] transition-colors">{product.name}</h4>
                                            <div className="flex justify-between items-center">
                                                <p className="text-white/40 text-xs font-medium uppercase tracking-wider">Starting From</p>
                                                <p className="text-[#D4AF37] font-black text-lg">${product.price?.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                                {products.length === 0 && (
                                    <div className="col-span-full py-16 text-center border-2 border-dashed border-white/10 rounded-2xl">
                                        <p className="text-white/40 italic">New inventory is arriving soon.</p>
                                    </div>
                                )}
                            </div>
                        </GlassCard>

                        {/* Reviews Section */}
                        <GlassCard className="p-8" id="reviews">
                            <h3 className="font-display font-black text-2xl text-white italic mb-8">Client <MetallicText>Testimonials</MetallicText></h3>

                            {/* Write Review Input */}
                            <div className="flex gap-4 mb-10">
                                <Avatar className="w-12 h-12 border border-white/10">
                                    <AvatarFallback className="bg-[#1A1A1C] text-white font-bold">ME</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-4">
                                    <div className="bg-[#0D0D0F] rounded-2xl p-4 border border-white/10 focus-within:border-[#D4AF37]/50 transition-all">
                                        <Textarea
                                            placeholder={`Share your experience with ${dealer.business_name}...`}
                                            className="bg-transparent border-none p-0 focus-visible:ring-0 resize-none min-h-[80px] text-white placeholder:text-white/30"
                                            value={reviewForm.comment}
                                            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                        />
                                        <Separator className="bg-white/10 my-3" />
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <button
                                                        key={s}
                                                        onClick={() => setReviewForm({ ...reviewForm, rating: s })}
                                                        className={`w-6 h-6 flex items-center justify-center transition-transform hover:scale-110 ${reviewForm.rating >= s ? 'text-[#D4AF37]' : 'text-white/10'}`}
                                                    >
                                                        <Star className="w-5 h-5 fill-current" />
                                                    </button>
                                                ))}
                                            </div>
                                            <Button
                                                size="sm"
                                                onClick={handleReviewSubmit}
                                                disabled={submittingReview}
                                                className="bg-white text-black hover:bg-[#D4AF37] font-bold uppercase text-xs tracking-widest transition-colors h-9 px-6"
                                            >
                                                Post Review
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Reviews List */}
                            <div className="space-y-6">
                                {reviews.map((review) => (
                                    <div key={review.id} className="flex gap-4 group">
                                        <Avatar className="w-10 h-10 border border-white/10">
                                            <AvatarImage src={review.profiles?.avatar_url} />
                                            <AvatarFallback className="bg-[#1A1A1C] text-[#D4AF37] font-bold">{review.profiles?.full_name?.[0] || 'U'}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 bg-white/5 hover:bg-white/10 transition-colors rounded-2xl p-5 border border-white/5 hover:border-white/10">
                                            <div className="flex justify-between items-start mb-2">
                                                <h5 className="font-bold text-sm text-white">{review.profiles?.full_name || 'Anonymous User'}</h5>
                                                <span className="text-xs text-white/40">{format(new Date(review.created_at), 'MMM d, yyyy')}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-[#D4AF37] mb-3">
                                                {Array.from({ length: review.rating }).map((_, i) => (
                                                    <Star key={i} className="w-3 h-3 fill-current" />
                                                ))}
                                            </div>
                                            <p className="text-sm text-white/80 leading-relaxed font-medium">{review.comment}</p>
                                        </div>
                                    </div>
                                ))}
                                {reviews.length === 0 && (
                                    <div className="py-12 text-center text-white/30 italic">
                                        No reviews yet. Be the first to verify this dealer.
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>
        </div>
    );
}
