"use client";

import { useState, useEffect, useRef } from "react";
import { format, subDays } from "date-fns";
import {
    Calendar as CalendarIcon,
    Printer,
    Download,
    FileText,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Package,
    Store
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/premium/GlassCard";
import { useReactToPrint } from "react-to-print";

export default function DailyReportsPage() {
    const [date, setDate] = useState<Date>(new Date());
    const [reportData, setReportData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const componentRef = useRef(null);
    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: "Daily Sales Report",
    });

    useEffect(() => {
        fetchReportData(date);
    }, [date]);

    const fetchReportData = async (selectedDate: Date) => {
        setLoading(true);
        try {
            const formattedDate = format(selectedDate, 'yyyy-MM-dd');

            // Fetch stats for selected date
            const { data: stats } = await supabase.rpc('get_sales_stats', {
                start_date: formattedDate,
                end_date: formattedDate
            });

            // Fetch recent sales for the report list
            const { data: sales } = await supabase
                .from('sales')
                .select('sale_number, grand_total, payment_method, customer_name, dealers(name)')
                .gte('created_at', `${formattedDate}T00:00:00`)
                .lte('created_at', `${formattedDate}T23:59:59`)
                .order('created_at', { ascending: false })
                .limit(20);

            // Fetch top products for the day
            const { data: products } = await supabase.rpc('get_top_products', {
                limit_count: 5
            }); // Note: This might need a date filter in the RPC if strictly daily, assumed general for now or needs update

            setReportData({
                summary: stats?.[0] || { total_revenue: 0, sale_count: 0, distinct_dealers: 0 },
                sales: sales || [],
                topProducts: products || []
            });

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] gap-6">

            {/* Controls Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#0D0D0F] p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/5 rounded-xl">
                        <FileText className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div>
                        <h1 className="text-xl font-display font-black text-[#F8F8F8] italic uppercase tracking-tighter">Daily Sales Report</h1>
                        <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Generate End-of-Day Summary</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-[240px] justify-start text-left font-normal bg-white/5 border-white/10 hover:bg-white/10",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4 text-[#D4AF37]" />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-[#1A1A1C] border-white/10 text-white" align="end">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={(d) => d && setDate(d)}
                                initialFocus
                                className="bg-[#1A1A1C]"
                            />
                        </PopoverContent>
                    </Popover>

                    <div className="h-8 w-px bg-white/10" />

                    <Button
                        onClick={() => handlePrint()}
                        variant="outline"
                        className="bg-white/5 border-white/10 hover:bg-white/10 hover:text-[#D4AF37]"
                    >
                        <Printer className="w-4 h-4 mr-2" />
                        Print Report
                    </Button>
                </div>
            </div>

            {/* Report Preview */}
            <div className="flex-1 overflow-y-auto custom-scrollbar flex justify-center bg-[#0D0D0F]">
                <div ref={componentRef} className="w-full max-w-[210mm] min-h-[297mm] bg-white text-black p-12 shadow-xl my-4 print:my-0 print:shadow-none print:p-0 relative overflow-hidden">
                    {/* Watermark */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-black/5 rounded-full blur-3xl pointer-events-none print:hidden" />

                    {/* Header */}
                    <div className="flex justify-between items-start border-b-2 border-black pb-8 mb-8 relative z-10">
                        <div>
                            <h1 className="text-4xl font-display font-black text-black uppercase tracking-tighter">Daily Sales Summary</h1>
                            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-2">{format(date, "EEEE, MMMM do, yyyy")}</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-xl font-bold text-[#D4AF37]">SUZUKI PORTAL</h2>
                            <p className="text-xs text-gray-400 uppercase tracking-widest">Confidence in Motion</p>
                            <p className="text-xs text-gray-400 mt-1">Generated: {format(new Date(), "hh:mm a")}</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="py-20 text-center text-gray-400 animate-pulse">Generating Report Data...</div>
                    ) : (
                        <div className="space-y-12 relative z-10">
                            {/* Key Metrics */}
                            <div className="grid grid-cols-3 gap-8">
                                <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs font-black uppercase text-gray-400 tracking-widest mb-2">Total Revenue</p>
                                    <p className="text-3xl font-display font-black text-black">
                                        ৳{reportData?.summary.total_revenue.toLocaleString() ?? 0}
                                    </p>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs font-black uppercase text-gray-400 tracking-widest mb-2">Transaction Count</p>
                                    <p className="text-3xl font-display font-black text-black">
                                        {reportData?.summary.sale_count ?? 0}
                                    </p>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs font-black uppercase text-gray-400 tracking-widest mb-2">Active Dealers</p>
                                    <p className="text-3xl font-display font-black text-black">
                                        {reportData?.summary.distinct_dealers ?? 0}
                                    </p>
                                </div>
                            </div>

                            {/* Transaction List */}
                            <div>
                                <h3 className="text-sm font-black uppercase text-black border-l-4 border-[#D4AF37] pl-3 mb-6">Recent Transactions</h3>
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-100 border-b border-gray-200">
                                        <tr>
                                            <th className="p-3 font-bold text-gray-600 uppercase text-xs">Sale ID</th>
                                            <th className="p-3 font-bold text-gray-600 uppercase text-xs">Dealer</th>
                                            <th className="p-3 font-bold text-gray-600 uppercase text-xs">Customer</th>
                                            <th className="p-3 font-bold text-gray-600 uppercase text-xs">Method</th>
                                            <th className="p-3 font-bold text-gray-600 uppercase text-xs text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {reportData?.sales.map((sale: any, i: number) => (
                                            <tr key={i}>
                                                <td className="p-3 font-mono text-xs">{sale.sale_number}</td>
                                                <td className="p-3 font-bold">{sale.dealers?.name}</td>
                                                <td className="p-3 text-gray-600">{sale.customer_name}</td>
                                                <td className="p-3 text-gray-500 uppercase text-xs">{sale.payment_method}</td>
                                                <td className="p-3 font-bold text-right">৳{sale.grand_total.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Footer */}
                            <div className="border-t-2 border-black pt-8 mt-12 flex justify-between items-end">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Approved By</p>
                                    <div className="h-12 w-48 border-b border-gray-300 mt-2" />
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">System Certification</p>
                                    <p className="text-[10px] text-gray-300 mt-1 max-w-xs">
                                        This document was generated automatically by the Suzuki Portal Sales Admin System.
                                        Data is real-time and immutable at the time of printing.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
