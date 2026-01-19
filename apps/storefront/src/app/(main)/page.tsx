'use client';

import Image from "next/image";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Bike, Star, Users, CheckCircle2, Menu, X, Globe, Lock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { GlassCard } from '@/components/ui/premium/GlassCard';
import { MetallicText } from '@/components/ui/premium/MetallicText';
import { GradientButton } from '@/components/ui/premium/GradientButton';
import { AnimatedSection } from '@/components/ui/premium/AnimatedSection';
import { useState, useEffect } from "react";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } }
  } as const;

  return (
    <div className="flex flex-col bg-[#0D0D0F]">
      {/* Hero Section */}
      <section className="relative pt-40 pb-20 lg:pt-64 lg:pb-32 overflow-hidden min-h-screen flex items-center">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#D4AF37]/10 blur-[150px] rounded-full -mr-96 -mt-96 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#DC2626]/5 blur-[120px] rounded-full -ml-48 -mb-48" />

        <div className="max-w-7xl mx-auto px-6 sm:px-10 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="text-center lg:text-left"
            >
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-[#D4AF37] font-bold text-sm mb-10 shadow-2xl backdrop-blur-md">
                <Globe className="w-4 h-4 animate-spin-slow" />
                <span className="uppercase tracking-[0.2em]">{"Bangladesh's Most Exclusive Hub"}</span>
              </motion.div>

              <motion.h1 variants={itemVariants} className="text-6xl lg:text-8xl xl:text-9xl font-display font-black leading-[0.9] mb-10 text-white">
                RIDE <br />
                <MetallicText className="text-8xl lg:text-[10rem]">DISTINCTION</MetallicText>
              </motion.h1>

              <motion.p variants={itemVariants} className="text-xl lg:text-2xl text-white/50 mb-12 max-w-xl font-medium leading-relaxed">
                Enter the realm of premium motorcycle trading. Experience transparency, luxury, and unmatched service in a curated marketplace.
              </motion.p>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                <Link href="/bikes">
                  <GradientButton className="h-16 px-10 text-xl w-full sm:w-auto">
                    Explore Collection <ArrowRight className="w-6 h-6" />
                  </GradientButton>
                </Link>
                <Link href="/register">
                  <Button variant="outline" className="h-16 px-10 border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xl font-bold backdrop-blur-md w-full sm:w-auto">
                    List Your Showroom
                  </Button>
                </Link>
              </motion.div>

              <motion.div variants={itemVariants} className="mt-20 flex flex-wrap items-center justify-center lg:justify-start gap-12">
                <div className="flex flex-col">
                  <span className="text-4xl font-display font-black text-white italic">500+</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">Verified Dealers</span>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="flex flex-col">
                  <span className="text-4xl font-display font-black text-white italic">10K+</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">Active Listings</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="hidden lg:block relative"
            >
              <GlassCard className="aspect-[4/5] max-w-lg mx-auto p-2 border-[#D4AF37]/20 group">
                <div className="relative w-full h-full rounded-[28px] overflow-hidden bg-[#0D0D0F]">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="flex flex-col items-center justify-center h-full p-12 text-center">
                    <motion.div
                      animate={{ y: [0, -20, 0] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" as const }}
                    >
                      <Bike className="w-40 h-40 text-[#D4AF37] mb-8" />
                    </motion.div>
                    <p className="text-xs font-bold uppercase tracking-[0.5em] text-[#D4AF37] mb-2">Exclusive Membership</p>
                    <h3 className="text-3xl font-display font-black italic text-white mb-6 tracking-wider">ELITE RIDER CIRCLE</h3>
                    <p className="text-white/40 leading-relaxed">Early access to limited editions and specialized dealer services.</p>
                  </div>
                </div>
              </GlassCard>

              {/* Abstract Floating Shapes */}
              <div className="absolute -z-10 -top-10 -right-10 w-40 h-40 border border-[#D4AF37]/20 rounded-full animate-pulse" />
              <div className="absolute -z-10 -bottom-20 -left-20 w-80 h-80 border-2 border-white/5 rounded-full" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust & Brands */}
      <section className="py-20 bg-white/5 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/20 mb-12">Authorized Dealer Network</p>
          <div className="flex flex-wrap justify-center gap-16 md:gap-32 opacity-20 hover:opacity-100 transition-opacity duration-700 grayscale grayscale-0">
            <Link href="/brands/yamaha" className="text-3xl font-black italic hover:text-[#D4AF37] cursor-default transition-colors">YAMAHA</Link>
            <Link href="/brands/honda" className="text-3xl font-black italic hover:text-[#D4AF37] cursor-default transition-colors">HONDA</Link>
            <Link href="/brands/suzuki" className="text-3xl font-black italic hover:text-[#D4AF37] cursor-default transition-colors">SUZUKI</Link>
            <Link href="/brands/kawasaki" className="text-3xl font-black italic hover:text-[#D4AF37] cursor-default transition-colors">KAWASAKI</Link>
            <Link href="/brands/bmw" className="text-3xl font-black italic hover:text-[#D4AF37] cursor-default transition-colors">BMW</Link>
          </div>
        </div>
      </section>

      {/* Feature Highlight */}
      <section className="py-32 lg:py-48 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 relative z-10">
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                title: "VERIFIED DEALERS",
                desc: "Every partner undergoes rigorous verification for professional integrity.",
                icon: <ShieldCheck className="w-10 h-10 text-[#D4AF37]" />,
                accent: "rgba(212, 175, 55, 0.1)"
              },
              {
                title: "PREMIUM LISTINGS",
                desc: "Discover high-performance bikes from globally recognized motorcycle brands.",
                icon: <Bike className="w-10 h-10 text-white" />,
                accent: "rgba(255, 255, 255, 0.05)"
              },
              {
                title: "SECURE PAYMENTS",
                desc: "Seamless bKash integration for safe and rapid transaction completion.",
                icon: <ArrowRight className="w-10 h-10 text-[#DC2626]" />,
                accent: "rgba(220, 38, 38, 0.1)"
              }
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="group p-12 rounded-[40px] bg-white/5 border border-white/5 hover:border-[#D4AF37]/30 transition-all duration-500 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 blur-[80px] -mr-16 -mt-16 transition-all duration-500 group-hover:bg-[#D4AF37]/20" />
                <div className="mb-8 p-6 bg-white/5 w-fit rounded-3xl group-hover:scale-110 transition-transform duration-500 border border-white/10">
                  {f.icon}
                </div>
                <h3 className="text-2xl font-display font-black italic mb-6 tracking-widest text-white">{f.title}</h3>
                <p className="text-white/40 leading-relaxed font-medium group-hover:text-white/60 transition-colors">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-b from-transparent to-[#0D0D0F] relative">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="mb-20">
            <h2 className="text-5xl lg:text-7xl font-display font-black mb-10 italic">READY TO <MetallicText>ELEVATE?</MetallicText></h2>
            <p className="text-xl text-white/40 max-w-2xl mx-auto mb-12 italic">Join thousands of riders who have chosen transparency and luxury.</p>
            <Link href="/register">
              <GradientButton className="h-16 px-12 text-xl shadow-2xl w-full sm:w-auto">Create Your Account Now</GradientButton>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
