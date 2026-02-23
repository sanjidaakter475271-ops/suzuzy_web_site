import {
    LayoutDashboard,
    LineChart,
    Hammer,
    Table,
    Users,
    ClipboardList,
    ShieldCheck,
    Calendar,
    UserPlus,
    History,
    Bell,
    Car,
    MessageSquare,
    Monitor,
    ShoppingCart,
    FileText,
    RotateCcw,
    Archive,
    Package,
    Warehouse,
    AlertTriangle,
    ArrowUpRight,
    DollarSign,
    Shield,
    Activity,
    UserCircle,
    Settings,
    HelpCircle,
    Clock,
    Lock
} from 'lucide-react';
import { MenuGroup } from '@/types/service-admin';

export const SIDEBAR_MENU: MenuGroup[] = [
    {
        groupTitle: "MAIN",
        items: [
            { title: "Dashboard", icon: LayoutDashboard, path: "/service-admin/dashboard" },
            { title: "Analytics", icon: LineChart, path: "/service-admin/analytics" },
        ],
    },
    {
        groupTitle: "SERVICE CENTER",
        items: [
            {
                title: "Workshop",
                icon: Hammer,
                subItems: [
                    { title: "Ramp View", path: "/service-admin/workshop/ramp-view" },
                    { title: "Job Cards", path: "/service-admin/workshop/job-cards" },
                    { title: "Status Board", path: "/service-admin/workshop/status-board" },
                    { title: "Technicians", path: "/service-admin/workshop/technicians" },
                    { title: "QC Checklist", path: "/service-admin/workshop/qc" },
                ]
            },
        ],
    },
    {
        groupTitle: "CUSTOMER",
        items: [
            { title: "Customer Portal", icon: Users, path: "/service-admin/customer/portal" },
        ],
    },
    {
        groupTitle: "APPOINTMENTS",
        items: [
            {
                title: "Appointments",
                icon: Calendar,
                subItems: [
                    { title: "New Appointment", path: "/service-admin/appointments/new" },
                    { title: "Today's Queue", path: "/service-admin/appointments/queue" },
                    { title: "Online Booking", path: "/service-admin/appointments/online" },
                    { title: "Reschedule/Cancel", path: "/service-admin/appointments/reschedule" },
                    { title: "Reminders", path: "/service-admin/appointments/reminders" },
                ]
            },
        ],
    },
    {
        groupTitle: "CRM",
        items: [
            {
                title: "Customers & Vehicles",
                icon: Users,
                subItems: [
                    { title: "Customer List", path: "/service-admin/crm/customers" },
                    { title: "Vehicle List", path: "/service-admin/crm/vehicles" },
                    { title: "Complaints", path: "/service-admin/crm/complaints" },
                    { title: "Reminder Logs", path: "/service-admin/crm/reminders" },
                ]
            },
        ],
    },
    {
        groupTitle: "POINT OF SALE", // eikhen customer account theke reques ashte pare ba admin nije new job card add korte pare . amar pos sytem eivabe anate hobe
        items: [
            {
                title: "POS System",
                icon: Monitor,
                subItems: [
                    { title: "POS Mode", path: "/service-admin/pos/terminal" },
                    { title: "Counter Sell", path: "/service-admin/pos/counter-sell" },
                    { title: "Service Billing", path: "/service-admin/pos/service-billing" },
                    { title: "Quotations", path: "/service-admin/pos/quotations" },
                    { title: "Sales Records", path: "/service-admin/pos/sales" },
                    { title: "Invoice List", path: "/service-admin/pos/invoices" },
                    { title: "Returns", path: "/service-admin/pos/returns" },
                    { title: "Daily Closing", path: "/service-admin/pos/closing" },
                ]
            },
        ],
    },
    {
        groupTitle: "INVENTORY",
        items: [
            {
                title: "Inventory",
                icon: Package,
                subItems: [
                    { title: "Product List", path: "/service-admin/inventory/products" },
                    { title: "Stock Adjustment", path: "/service-admin/inventory/stock-adjustment" },
                    { title: "Low Stock Alerts", path: "/service-admin/inventory/low-stock" },
                    { title: "Parts Issue", path: "/service-admin/inventory/parts-issue" },
                ]
            },
        ],
    },
    {
        groupTitle: "FINANCE",
        items: [
            {
                title: "Finance",
                icon: DollarSign,
                subItems: [
                    { title: "Financial Overview", path: "/service-admin/finance" },
                    { title: "Manage Finance", path: "/service-admin/finance/manage" },
                    { title: "CashBook Report", path: "/service-admin/finance/cashbook" },
                    { title: "Daily Sales", path: "/service-admin/finance/daily-sales" },
                    { title: "Expenses", path: "/service-admin/finance/expenses" },
                    { title: "Deposits/Withdraw", path: "/service-admin/finance/deposits" },
                    { title: "Combined Reports", path: "/service-admin/finance/reports" },
                ]
            },
        ],
    },
    {
        groupTitle: "ADMINISTRATION",
        items: [
            {
                title: "Users",
                icon: Shield,
                subItems: [
                    { title: "Users List", path: "/service-admin/users" },
                    { title: "Roles & Permissions", path: "/service-admin/users/roles" },
                    { title: "Activity Logs", path: "/service-admin/users/activity" },
                    { title: "Login History", path: "/service-admin/users/login-history" },
                ]
            },
            {
                title: "Security & OTP",
                icon: Lock,
                subItems: [
                    { title: "OTP Dashboard", path: "/service-admin/security" },
                    { title: "Delivery OTP", path: "/service-admin/security/delivery-otp" },
                    { title: "Discount OTP", path: "/service-admin/security/discount-otp" },
                    { title: "Security Logs", path: "/service-admin/security/logs" },
                ]
            },
            {
                title: "Settings",
                icon: Settings,
                subItems: [
                    { title: "Company Profile", path: "/service-admin/settings/company" },
                    { title: "Invoice Settings", path: "/service-admin/settings/invoice" },
                    { title: "VAT Settings", path: "/service-admin/settings/tax" },
                    { title: "Service Rules", path: "/service-admin/settings/service-rules" },
                    { title: "Notifications", path: "/service-admin/settings/notifications" },
                    { title: "Backup", path: "/service-admin/settings/backup" },
                ]
            },
        ],
    },
    {
        groupTitle: "ACCOUNT",
        items: [
            { title: "Profile", icon: UserCircle, path: "/service-admin/profile" },
            { title: "Help", icon: HelpCircle, path: "/service-admin/help" },
        ]
    }
];
