"use client";

import {
    AreaChart as RechartsAreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { chartTheme, customTooltipStyle } from "./chart-theme";
import { cn } from "@/lib/utils";

interface AreaChartProps {
    data: any[];
    xKey: string;
    yKey: string;
    height?: number;
    className?: string;
    showGrid?: boolean;
    showXAxis?: boolean;
    showYAxis?: boolean;
    color?: string;
    gradientId?: string;
}

export function AreaChart({
    data,
    xKey,
    yKey,
    height = 300,
    className,
    showGrid = true,
    showXAxis = true,
    showYAxis = true,
    color = chartTheme.colors.primary,
    gradientId = "chartGradient",
}: AreaChartProps) {
    return (
        <div className={cn("w-full", className)} style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <RechartsAreaChart data={data}>
                    <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    {showGrid && (
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={chartTheme.colors.grid}
                            vertical={false}
                        />
                    )}

                    {showXAxis && (
                        <XAxis
                            dataKey={xKey}
                            stroke={chartTheme.colors.text.secondary}
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                        />
                    )}

                    {showYAxis && (
                        <YAxis
                            stroke={chartTheme.colors.text.secondary}
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `$${value}`}
                        />
                    )}

                    <Tooltip
                        contentStyle={customTooltipStyle}
                        itemStyle={{ color: chartTheme.colors.text.primary }}
                        cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: "4 4" }}
                    />

                    <Area
                        type="monotone"
                        dataKey={yKey}
                        stroke={color}
                        strokeWidth={2}
                        fill={`url(#${gradientId})`}
                        animationDuration={chartTheme.animation.duration}
                    />
                </RechartsAreaChart>
            </ResponsiveContainer>
        </div>
    );
}
