import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local for local execution
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("DATABASE_URL is not defined. Please check your .env.local file.");
    process.exit(1);
}

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Import from compiled entity-registry would be complex. Define entities here.
const ENTITIES = [
    'products', 'product_variants', 'categories', 'sales', 'service_tickets',
    'service_staff', 'purchase_orders', 'vendors', 'brands', 'inventory_batches',
    'sub_orders', 'payment_transactions', 'support_tickets', 'ticket_messages',
    'banners', 'dealer_ads', 'dealer_notifications', 'bike_models', 'orders',
    'payments', 'shipments', 'wishlists', 'reviews', 'return_requests',
    'notifications', 'user_loyalty', 'referrals', 'service_tasks'
];

async function main() {
    console.log("Seeding permissions...");

    const roles = [
        'super_admin',
        'showroom_admin', 'sell_showroom_admin', 'sells_stuff',
        'service_admin', 'sell_service_admin', 'service_stuff',
        'dealer_owner', 'dealer_manager', 'dealer_staff', 'sub_dealer', 'dealer',
        'support', 'accountant', 'admin',
        'sales_admin', 'customer', 'technician'
    ];

    // Create Roles
    for (const roleName of roles) {
        await prisma.roles.upsert({
            where: { name: roleName },
            update: {},
            create: {
                name: roleName,
                display_name: roleName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                level: 1
            }
        });
        console.log(`Ensured role: ${roleName}`);
    }

    // Create Permissions from Registry
    for (const key of ENTITIES) {
        const operations = ['list', 'create', 'read', 'update', 'delete'];

        for (const op of operations) {
            const permName = `${key}:${op}`;

            const permission = await prisma.permissions.upsert({
                where: { name: permName },
                update: {},
                create: {
                    name: permName,
                    module: key,
                    description: `Allow ${op} on ${key}`
                }
            });
            console.log(`Ensured permission: ${permName}`);

            // By default, assign ALL permissions to super_admin
            const superAdminRole = await prisma.roles.findUnique({ where: { name: 'super_admin' } });
            if (superAdminRole) {
                await prisma.role_permissions.upsert({
                    where: {
                        role_id_permission_id: {
                            role_id: superAdminRole.id,
                            permission_id: permission.id
                        }
                    },
                    update: {},
                    create: {
                        role_id: superAdminRole.id,
                        permission_id: permission.id
                    }
                });
            }
        }
    }

    console.log("Permissions seeded successfully!");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
