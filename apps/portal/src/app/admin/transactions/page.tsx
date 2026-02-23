import { Card, CardHeader, CardTitle, CardContent, Button } from "@/components/ui";
import { Search, Filter, ArrowUpRight, TrendingDown, Calendar, Download } from "lucide-react";
import { RECENT_TRANSACTIONS } from "@/constants/mockData";
import { cn } from "@/lib/utils";
import Breadcrumb from "@/components/Breadcrumb";

export default function TransactionsPage() {
    return (
        <div className="p-6 lg:p-8 space-y-8 animate-fade">
            <Breadcrumb items={[{ label: 'Transactions' }]} />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-ink-heading dark:text-white">Transaction History</h1>
                    <p className="text-ink-muted mt-2">View and manage all your incoming and outgoing payments.</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex items-center bg-white dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-lg px-3 py-2 shadow-sm">
                        <Calendar size={16} className="text-ink-muted mr-2" />
                        <span className="text-xs font-semibold text-ink-heading dark:text-white">Last 30 Days</span>
                    </div>
                    <Button className="gap-2">
                        <Download size={18} /> Export CSV
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                {[
                    { label: "Total Inflow", value: "+$12,450.00", color: "text-success", bg: "bg-success-bg" },
                    { label: "Total Outflow", value: "-$8,200.00", color: "text-danger", bg: "bg-danger-bg" },
                    { label: "Pending", value: "$1,250.00", color: "text-warning", bg: "bg-warning-bg" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-dark-card p-4 rounded-xl border border-surface-border dark:border-dark-border flex items-center justify-between">
                        <span className="text-xs font-bold text-ink-muted uppercase">{stat.label}</span>
                        <span className={cn("text-lg font-black", stat.color)}>{stat.value}</span>
                    </div>
                ))}
            </div>

            <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-surface-border dark:border-dark-border py-4">
                    <div className="flex items-center bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-lg px-3 py-1.5 w-full max-sm:max-w-[200px] max-w-sm">
                        <Search size={16} className="text-ink-muted mr-2" />
                        <input type="text" placeholder="Search transactions..." className="bg-transparent border-none outline-none text-sm w-full text-ink-body dark:text-white" />
                    </div>
                    <Button variant="outline" className="gap-2 px-3 py-1.5 h-auto text-xs font-bold">
                        <Filter size={14} /> Filter
                    </Button>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-surface-page dark:bg-dark-page/50 border-b border-surface-border dark:border-dark-border">
                                <th className="px-6 py-4 text-xs font-bold text-ink-muted uppercase">Transaction</th>
                                <th className="px-6 py-4 text-xs font-bold text-ink-muted uppercase">Category</th>
                                <th className="px-6 py-4 text-xs font-bold text-ink-muted uppercase">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-ink-muted uppercase">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-ink-muted uppercase text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-border dark:divide-dark-border">
                            {RECENT_TRANSACTIONS.map((tx) => (
                                <tr key={tx.id} className="hover:bg-surface-hover/30 dark:hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "p-2 rounded-full",
                                                tx.type === 'income' ? "bg-success-bg text-success" : "bg-surface-page dark:bg-dark-page text-ink-muted"
                                            )}>
                                                {tx.type === 'income' ? <ArrowUpRight size={16} /> : <TrendingDown size={16} />}
                                            </div>
                                            <span className="text-sm font-bold text-ink-heading dark:text-white">{tx.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-ink-muted">{tx.category}</td>
                                    <td className="px-6 py-4 text-sm text-ink-muted">{tx.date}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-0.5 bg-success-bg text-success rounded-full text-[10px] font-bold">Completed</span>
                                    </td>
                                    <td className={cn(
                                        "px-6 py-4 text-sm font-black text-right",
                                        tx.type === 'income' ? "text-success" : "text-danger"
                                    )}>
                                        {tx.amount}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-surface-border dark:border-dark-border flex items-center justify-between">
                    <p className="text-xs text-ink-muted font-medium">Showing 5 of 245 transactions</p>
                    <div className="flex gap-2">
                        <Button variant="outline" className="px-3 py-1 h-auto text-xs" disabled>Previous</Button>
                        <Button variant="outline" className="px-3 py-1 h-auto text-xs">Next</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
