'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { BarChart3, TrendingUp, Users, Package } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";

export default function AnalyticsPage() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    const stats = [
        { title: "Avg. Session Duration", value: "4m 32s", change: "+12.1%", icon: BarChart3 },
        { title: "Conversion Rate", value: "3.24%", change: "+2.4%", icon: TrendingUp },
        { title: "Bounce Rate", value: "42.1%", change: "-5.2%", icon: Users },
        { title: "Sessions per User", value: "1.8", change: "+0.3%", icon: Package },
    ];

    return (
        <div className="p-6 lg:p-8 space-y-8 animate-fade">
            <Breadcrumb items={[{ label: 'Analytics' }]} />

            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-ink-heading dark:text-white uppercase tracking-tight">Advanced Analytics</h1>
                    <p className="text-ink-muted mt-2 font-medium italic">Deep dive into your business performance and user metrics.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="animate-pulse h-32" />
                    ))
                ) : (
                    stats.map((stat, i) => (
                        <Card key={i} className="rounded-[1.5rem] border border-surface-border dark:border-white/5 shadow-sm hover:shadow-lg transition-all duration-500">
                            <CardContent className="pt-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-brand/10 rounded-lg text-brand">
                                        <stat.icon size={20} />
                                    </div>
                                    <span className={`text-xs font-bold ${stat.change.startsWith('+') ? 'text-success' : 'text-danger'}`}>
                                        {stat.change}
                                    </span>
                                </div>
                                <p className="text-[10px] font-black uppercase text-ink-muted tracking-widest">{stat.title}</p>
                                <h3 className="text-2xl font-black text-ink-heading dark:text-white mt-1 italic tracking-tighter">{stat.value}</h3>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {isLoading ? (
                    <>
                        <div className="h-80 bg-white dark:bg-dark-card rounded-[2.5rem] border border-surface-border dark:border-white/5 animate-pulse" />
                        <div className="h-80 bg-white dark:bg-dark-card rounded-[2.5rem] border border-surface-border dark:border-white/5 animate-pulse" />
                    </>
                ) : (
                    <>
                        <Card className="rounded-[2.5rem] border border-surface-border dark:border-white/5 overflow-hidden">
                            <CardHeader className="p-8 border-b border-surface-border dark:border-white/5">
                                <CardTitle className="text-lg font-black uppercase tracking-tight italic">User Behavior</CardTitle>
                            </CardHeader>
                            <CardContent className="p-10">
                                <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-surface-border dark:border-white/5 rounded-3xl bg-surface-page/50 dark:bg-dark-page/50">
                                    <BarChart3 className="w-12 h-12 text-brand opacity-20 mb-4" />
                                    <p className="text-ink-muted text-xs font-bold uppercase tracking-widest">User activity heatmaps pending</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="rounded-[2.5rem] border border-surface-border dark:border-white/5 overflow-hidden">
                            <CardHeader className="p-8 border-b border-surface-border dark:border-white/5">
                                <CardTitle className="text-lg font-black uppercase tracking-tight italic">Regional Distribution</CardTitle>
                            </CardHeader>
                            <CardContent className="p-10">
                                <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-surface-border dark:border-white/5 rounded-3xl bg-surface-page/50 dark:bg-dark-page/50">
                                    <TrendingUp className="w-12 h-12 text-brand opacity-20 mb-4" />
                                    <p className="text-ink-muted text-xs font-bold uppercase tracking-widest">Geographical distribution coming soon</p>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </div>
    );
}
