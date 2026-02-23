import { Card, CardHeader, CardTitle, CardContent, Button } from "@/components/ui";
import { Warehouse as WarehouseIcon, MapPin, Truck, Package, Box } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";

const WAREHOUSES_MOCK = [
    { id: 1, name: "Main Central Warehouse", location: "Dhaka, BD", capacity: "85%", manager: "Rezaul Karim", status: "Full" },
    { id: 2, name: "Regional Hub - Chittagong", location: "Chittagong, BD", capacity: "42%", manager: "Ahmed Ullah", status: "Operating" },
    { id: 3, name: "Sorting Center - Sylhet", location: "Sylhet, BD", capacity: "15%", manager: "Samiul Islam", status: "Space Available" },
];

export default function WarehousePage() {
    return (
        <div className="p-6 lg:p-8 space-y-8 animate-fade">
            <Breadcrumb items={[{ label: 'Warehouse' }]} />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-ink-heading dark:text-white flex items-center gap-3">
                        Warehouse Management
                    </h1>
                    <p className="text-ink-muted mt-2">Monitor storage capacity, logistics, and stock distribution across locations.</p>
                </div>
                <Button className="gap-2">
                    <Truck size={18} /> Plan Shipment
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: "Total Units", value: "24,500", icon: Package, color: "text-brand" },
                    { title: "Active Locations", value: "12", icon: MapPin, color: "text-info" },
                    { title: "Incoming Orders", value: "84", icon: Truck, color: "text-success" },
                    { title: "Outbound Today", value: "156", icon: Box, color: "text-warning" },
                ].map((stat, i) => (
                    <Card key={i}>
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-2 bg-surface-page dark:bg-dark-page rounded-lg ${stat.color}`}>
                                    <stat.icon size={20} />
                                </div>
                            </div>
                            <p className="text-sm font-medium text-ink-muted">{stat.title}</p>
                            <h3 className="text-2xl font-bold text-ink-heading dark:text-white mt-1">{stat.value}</h3>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {WAREHOUSES_MOCK.map((wh) => (
                    <Card key={wh.id} className="hover:border-brand transition-colors cursor-pointer group">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <WarehouseIcon size={18} className="text-ink-muted group-hover:text-brand transition-colors" />
                                {wh.name}
                            </CardTitle>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${wh.status === 'Full' ? 'bg-danger-bg text-danger' :
                                    wh.status === 'Space Available' ? 'bg-success-bg text-success' : 'bg-brand-soft text-brand'
                                }`}>
                                {wh.status}
                            </span>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-sm text-ink-muted">
                                    <MapPin size={14} /> {wh.location}
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs font-semibold">
                                        <span className="text-ink-body dark:text-gray-300">Usage Capacity</span>
                                        <span className="text-ink-heading dark:text-white">{wh.capacity}</span>
                                    </div>
                                    <div className="h-2 w-full bg-surface-border dark:bg-dark-border rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${parseInt(wh.capacity) > 80 ? 'bg-danger' : 'bg-brand'}`}
                                            style={{ width: wh.capacity }}
                                        />
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-surface-border dark:border-dark-border flex justify-between items-center text-xs">
                                    <span className="text-ink-muted font-medium">Manager: {wh.manager}</span>
                                    <Button variant="outline" className="px-3 py-1.5 h-auto text-[10px] uppercase font-bold tracking-wider">Details</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
