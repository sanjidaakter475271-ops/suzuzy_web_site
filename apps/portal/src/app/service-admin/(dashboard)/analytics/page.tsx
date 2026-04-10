'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Package, ArrowUpRight, ArrowDownRight } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";

export default function AnalyticsPage() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    const stats = [
        { title: "Avg. Session Duration", value: "4m 32s", change: "+12.1%", isPositive: true, icon: BarChart3 },
        { title: "Conversion Rate", value: "3.24%", change: "+2.4%", isPositive: true, icon: TrendingUp },
        { title: "Bounce Rate", value: "42.1%", change: "-5.2%", isPositive: true, icon: Users }, // Decrease in bounce rate is positive
        { title: "Sessions per User", value: "1.8", change: "-0.3%", isPositive: false, icon: Package },
    ];

    return (
        <div className="p-6 lg:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Breadcrumb items={[{ label: 'Analytics' }]} />

            <div className="flex justify-between items-end">
                <div className="space-y-1.5">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Advanced Analytics</h1>
                    <p className="text-muted-foreground text-sm">
                        Deep dive into your business performance and user metrics.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="animate-pulse h-[132px] rounded-xl" />
                    ))
                ) : (
                    stats.map((stat, i) => (
                        <Card key={i} className="group rounded-xl border bg-card text-card-foreground shadow-sm hover:-translate-y-1 hover:scale-[1.02] hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/15 transition-all duration-300 ease-out cursor-pointer">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between space-y-0 pb-2">
                                    <p className="text-sm font-medium text-muted-foreground group-hover:text-orange-600/80 transition-colors">
                                        {stat.title}
                                    </p>
                                    <div className="p-2 bg-primary/10 group-hover:bg-orange-500/10 rounded-lg transition-colors duration-300">
                                        <stat.icon className="h-4 w-4 text-primary group-hover:text-orange-500 transition-colors duration-300" />
                                    </div>
                                </div>
                                <div className="flex items-baseline space-x-3">
                                    <h2 className="text-3xl font-bold font-sans tracking-tight group-hover:text-orange-500 transition-colors duration-300">{stat.value}</h2>
                                </div>
                                <p className={`flex items-center mt-2 text-xs font-medium ${stat.isPositive ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'}`}>
                                    {stat.isPositive ? (
                                        <ArrowUpRight className="mr-1 h-3 w-3" />
                                    ) : (
                                        <ArrowDownRight className="mr-1 h-3 w-3" />
                                    )}
                                    {stat.change}
                                    <span className="text-muted-foreground ml-1">from last month</span>
                                </p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {isLoading ? (
                    <>
                        <div className="h-[400px] bg-muted/50 rounded-xl animate-pulse" />
                        <div className="h-[400px] bg-muted/50 rounded-xl animate-pulse" />
                    </>
                ) : (
                    <>
                        <Card className="rounded-xl overflow-hidden flex flex-col">
                            <CardHeader className="border-b bg-muted/20 px-6 py-5">
                                <CardTitle className="text-base font-semibold">User Behavior</CardTitle>
                                <p className="text-sm text-muted-foreground">Activity trends over the last 30 days</p>
                            </CardHeader>
                            <CardContent className="p-6 flex-1 flex items-center justify-center">
                                <div className="w-full h-full min-h-[250px] flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/30">
                                    <BarChart3 className="w-10 h-10 text-muted-foreground/30 mb-3" />
                                    <p className="text-sm font-medium text-muted-foreground">User activity heatmaps pending</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl overflow-hidden flex flex-col">
                            <CardHeader className="border-b bg-muted/20 px-6 py-5">
                                <CardTitle className="text-base font-semibold">Regional Distribution</CardTitle>
                                <p className="text-sm text-muted-foreground">Customer locations and density</p>
                            </CardHeader>
                            <CardContent className="p-6 flex-1 flex items-center justify-center">
                                <div className="w-full h-full min-h-[250px] flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/30">
                                    <TrendingUp className="w-10 h-10 text-muted-foreground/30 mb-3" />
                                    <p className="text-sm font-medium text-muted-foreground">Geographical distribution coming soon</p>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </div>
    );
}
