"use client";

import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie
} from "recharts";

const COLORS = ["#D4AF37", "#9A7B2C", "#6D561F", "#E5C158", "#B8962E"];

export const ReportAreaChart = ({ data, xKey, yKey, color = "#D4AF37" }: { data: Record<string, unknown>[], xKey: string, yKey: string, color?: string }) => (
    <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <XAxis
                    dataKey={xKey}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "rgba(255,255,255,0.2)", fontWeight: 700 }}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "rgba(255,255,255,0.2)", fontWeight: 700 }}
                    tickFormatter={(value) => `৳${value >= 1000 ? (value / 1000) + 'k' : value}`}
                />
                <Tooltip
                    contentStyle={{ backgroundColor: "#0D0D0F", border: "1px solid rgba(212,175,55,0.2)", borderRadius: "12px", fontSize: "11px" }}
                    itemStyle={{ color: "#D4AF37", fontWeight: 900 }}
                />
                <Area
                    type="monotone"
                    dataKey={yKey}
                    stroke={color}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorSales)"
                />
            </AreaChart>
        </ResponsiveContainer>
    </div>
);

export const ReportBarChart = ({ data, xKey, yKey, color = "#D4AF37" }: { data: Record<string, unknown>[], xKey: string, yKey: string, color?: string }) => (
    <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis
                    dataKey={xKey}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "rgba(255,255,255,0.2)", fontWeight: 700 }}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "rgba(255,255,255,0.2)", fontWeight: 700 }}
                />
                <Tooltip
                    contentStyle={{ backgroundColor: "#0D0D0F", border: "1px solid rgba(212,175,55,0.2)", borderRadius: "12px", fontSize: "11px" }}
                    itemStyle={{ color: "#D4AF37", fontWeight: 900 }}
                />
                <Bar dataKey={yKey} fill={color} radius={[6, 6, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    </div>
);

export const ReportPieChart = ({ data }: { data: { name: string, value: number }[] }) => (
    <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{ backgroundColor: "#0D0D0F", border: "1px solid rgba(212,175,55,0.2)", borderRadius: "12px", fontSize: "11px" }}
                />
            </PieChart>
        </ResponsiveContainer>
    </div>
);
