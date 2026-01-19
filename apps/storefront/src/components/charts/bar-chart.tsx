"use client";

import {
    BarChart as RechartsBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { chartTheme, customTooltipStyle } from "./chart-theme";
import { cn } from "@/lib/utils";

interface BarChartProps {
    data: any[];
    xKey: string;
    yKey: string;
    height?: number;
    className?: string;
    layout?: "vertical" | "horizontal";
    barSize?: number;
}

export function BarChart({
    data,
    xKey,
    yKey,
    height = 300,
    className,
    layout = "horizontal",
    barSize = 32,
}: BarChartProps) {
    return (
        <div className={cn("w-full", className)} style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                    data={data}
                    layout={layout}
                    margin={layout === 'vertical' ? { left: 40 } : undefined}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={chartTheme.colors.grid}
                        horizontal={layout === "horizontal"}
                        vertical={layout === "vertical"}
                    />

                    <XAxis
                        type={layout === "vertical" ? "number" : "category"}
                        dataKey={layout === "vertical" ? undefined : xKey}
                        stroke={chartTheme.colors.text.secondary}
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                    />

                    <YAxis
                        type={layout === "vertical" ? "category" : "number"}
                        dataKey={layout === "vertical" ? xKey : undefined}
                        stroke={chartTheme.colors.text.secondary}
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        width={layout === 'vertical' ? 100 : 40}
                    />

                    <Tooltip
                        contentStyle={customTooltipStyle}
                        cursor={{ fill: "rgba(255,255,255,0.05)" }}
                    />

                    <Bar
                        dataKey={yKey}
                        radius={[4, 4, 0, 0]}
                        barSize={barSize}
                        animationDuration={chartTheme.animation.duration}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={index % 2 === 0 ? chartTheme.colors.primary : "#A6851F"}
                                fillOpacity={0.8}
                            />
                        ))}
                    </Bar>
                </RechartsBarChart>
            </ResponsiveContainer>
        </div>
    );
}
