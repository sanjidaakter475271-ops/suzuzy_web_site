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
import { MenuGroup } from '../types';

export const SIDEBAR_MENU: MenuGroup[] = [
    {
        groupTitle: "MAIN",
        items: [
            { title: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
            { title: "Analytics", icon: LineChart, path: "/analytics" },
        ],
    },
    {
        groupTitle: "SERVICE CENTER",
        items: [
            {
                title: "Workshop",
                icon: Hammer,
                subItems: [
                    { title: "Ramp View", path: "/workshop/ramp-view" },
                    { title: "Job Cards", path: "/workshop/job-cards" },
                    { title: "Status Board", path: "/workshop/status-board" },
                    { title: "Technicians", path: "/workshop/technicians" },
                    { title: "QC Checklist", path: "/workshop/qc" },
                ]
            },
        ],
    },
    {
        groupTitle: "CUSTOMER",
        items: [
            { title: "Customer Portal", icon: Users, path: "/customer/portal" },
        ],
    },
    {
        groupTitle: "APPOINTMENTS",
        items: [
            {
                title: "Appointments",
                icon: Calendar,
                subItems: [
                    { title: "New Appointment", path: "/appointments/new" },
                    { title: "Today's Queue", path: "/appointments/queue" },
                    { title: "Online Booking", path: "/appointments/online" },
                    { title: "Reschedule/Cancel", path: "/appointments/reschedule" },
                    { title: "Reminders", path: "/appointments/reminders" },
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
                    { title: "Customer List", path: "/crm/customers" },
                    { title: "Vehicle List", path: "/crm/vehicles" },
                    { title: "Complaints", path: "/crm/complaints" },
                    { title: "Reminder Logs", path: "/crm/reminders" },
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
                    { title: "POS Mode", path: "/pos/terminal" },
                    { title: "Counter Sell", path: "/pos/counter-sell" },
                    { title: "Service Billing", path: "/pos/service-billing" },
                    { title: "Quotations", path: "/pos/quotations" },
                    { title: "Sales Records", path: "/pos/sales" },
                    { title: "Invoice List", path: "/pos/invoices" },
                    { title: "Returns", path: "/pos/returns" },
                    { title: "Daily Closing", path: "/pos/closing" },
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
                    { title: "Product List", path: "/inventory/products" },
                    { title: "Stock Adjustment", path: "/inventory/stock-adjustment" },
                    { title: "Low Stock Alerts", path: "/inventory/low-stock" },
                    { title: "Parts Issue", path: "/inventory/parts-issue" },
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
                    { title: "Financial Overview", path: "/finance" },
                    { title: "Manage Finance", path: "/finance/manage" },
                    { title: "CashBook Report", path: "/finance/cashbook" },
                    { title: "Daily Sales", path: "/finance/daily-sales" },
                    { title: "Expenses", path: "/finance/expenses" },
                    { title: "Deposits/Withdraw", path: "/finance/deposits" },
                    { title: "Combined Reports", path: "/finance/reports" },
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
                    { title: "Users List", path: "/users" },
                    { title: "Roles & Permissions", path: "/users/roles" },
                    { title: "Activity Logs", path: "/users/activity" },
                    { title: "Login History", path: "/users/login-history" },
                ]
            },
            {
                title: "Security & OTP",
                icon: Lock,
                subItems: [
                    { title: "OTP Dashboard", path: "/security" },
                    { title: "Delivery OTP", path: "/security/delivery-otp" },
                    { title: "Discount OTP", path: "/security/discount-otp" },
                    { title: "Security Logs", path: "/security/logs" },
                ]
            },
            {
                title: "Settings",
                icon: Settings,
                subItems: [
                    { title: "Company Profile", path: "/settings/company" },
                    { title: "Invoice Settings", path: "/settings/invoice" },
                    { title: "VAT Settings", path: "/settings/tax" },
                    { title: "Service Rules", path: "/settings/service-rules" },
                    { title: "Notifications", path: "/settings/notifications" },
                    { title: "Backup", path: "/settings/backup" },
                ]
            },
        ],
    },
    {
        groupTitle: "ACCOUNT",
        items: [
            { title: "Profile", icon: UserCircle, path: "/profile" },
            { title: "Help", icon: HelpCircle, path: "/help" },
        ]
    }
];
