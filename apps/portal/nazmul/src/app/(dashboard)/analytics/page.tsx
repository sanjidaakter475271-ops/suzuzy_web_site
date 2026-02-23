import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { BarChart3, TrendingUp, Users, Package } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";

export default function AnalyticsPage() {
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
                    <h1 className="text-3xl font-bold text-ink-heading dark:text-white">Advanced Analytics</h1>
                    <p className="text-ink-muted mt-2">Deep dive into your business performance and user metrics.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <Card key={i}>
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-brand-soft rounded-lg text-brand">
                                    <stat.icon size={20} />
                                </div>
                                <span className={`text-xs font-bold ${stat.change.startsWith('+') ? 'text-success' : 'text-danger'}`}>
                                    {stat.change}
                                </span>
                            </div>
                            <p className="text-sm font-medium text-ink-muted">{stat.title}</p>
                            <h3 className="text-2xl font-bold text-ink-heading dark:text-white mt-1">{stat.value}</h3>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>User Behavior</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center border-2 border-dashed border-surface-border dark:border-dark-border rounded-xl">
                            <p className="text-ink-muted text-sm italic">User activity heatmaps and behavior data will appear here.</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Regional Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center border-2 border-dashed border-surface-border dark:border-dark-border rounded-xl">
                            <p className="text-ink-muted text-sm italic">Geographical traffic distribution visualization coming soon.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
