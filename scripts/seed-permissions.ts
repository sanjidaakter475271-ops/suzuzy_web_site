import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import path from "path";

// Load environment variables from apps/portal
config({ path: path.resolve(process.cwd(), "apps/portal/.env") });

const prisma = new PrismaClient();

const SYSTEM_PERMISSIONS = [
    // Dashboard
    { name: 'view_dashboard', module: 'dashboard', description: 'View main statistics and intelligence board' },

    // Users & Personnel
    { name: 'view_users', module: 'users', description: 'Access personnel registry' },
    { name: 'create_user', module: 'users', description: 'Authorize new personnel' },
    { name: 'edit_user', module: 'users', description: 'Modify personnel clearance levels' },
    { name: 'delete_user', module: 'users', description: 'Revoke personnel authorization' },

    // Roles & Governance
    { name: 'view_roles', module: 'roles', description: 'View system authority hierarchy' },
    { name: 'create_role', module: 'roles', description: 'Define new authority roles' },
    { name: 'edit_role_permissions', module: 'roles', description: 'Configure role-based privileges' },

    // Dealers & Consortium
    { name: 'view_dealers', module: 'dealers', description: 'View dealer consortium registry' },
    { name: 'approve_dealer', module: 'dealers', description: 'Validate and approve dealer applications' },
    { name: 'suspend_dealer', module: 'dealers', description: 'Freeze dealer operational status' },

    // Business Units
    { name: 'manage_business_units', module: 'business_units', description: 'Full control over branch/unit infrastructure' },

    // Products & Inventory
    { name: 'view_products', module: 'products', description: 'Access global product catalog' },
    { name: 'create_product', module: 'products', description: 'Register new assets/products' },
    { name: 'edit_product', module: 'products', description: 'Update product technical data' },
    { name: 'manage_inventory', module: 'inventory', description: 'Control stock levels and warehouse ops' },

    // Sales & Revenue
    { name: 'view_orders', module: 'orders', description: 'Monitor transaction history' },
    { name: 'create_order', module: 'orders', description: 'Initiate new sales transactions' },
    { name: 'update_order_status', module: 'orders', description: 'Modify phase transitions in sales flow' },

    // Reports & Analytics
    { name: 'view_reports', module: 'reports', description: 'Access deep-dive analytics and metrics' },
    { name: 'export_reports', module: 'reports', description: 'Extract system intelligence data (CSV/PDF)' },

    // System & Settings
    { name: 'manage_settings', module: 'settings', description: 'Configure core platform parameters' },
    { name: 'view_audit_logs', module: 'settings', description: 'Inspect system operational logs' },
];

async function main() {
    console.log("🚀 Initializing Permission Synchronization...");

    try {
        let count = 0;
        for (const perm of SYSTEM_PERMISSIONS) {
            await prisma.permissions.upsert({
                where: { name: perm.name },
                update: {
                    module: perm.module,
                    description: perm.description,
                },
                create: perm,
            });
            count++;
        }
        console.log(`✅ Successfully synchronized ${count} system permissions.`);
    } catch (error) {
        console.error("❌ Permission synchronization failure:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
