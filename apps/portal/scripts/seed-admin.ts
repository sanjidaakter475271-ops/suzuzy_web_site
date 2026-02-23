import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import argon2 from "argon2";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env" });

const connectionString = process.env.DATABASE_URL || "";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function hashPassword(password: string) {
    return await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16, // 64MB
        timeCost: 3,
        parallelism: 1,
    });
}

const ROLES = [
    { name: "super_admin", display_name: "Super Admin", level: 1, role_type: "system" },
    { name: "showroom_admin", display_name: "Showroom Admin", level: 2, role_type: "showroom" },
    { name: "service_admin", display_name: "Service Admin", level: 2, role_type: "service" },
    { name: "dealer_owner", display_name: "Dealer Owner", level: 3, role_type: "dealer" },
    { name: "sales_admin", display_name: "Sales Admin", level: 3, role_type: "sales" },
    { name: "customer", display_name: "Customer", level: 10, role_type: "customer" }
];

async function main() {
    console.log("🚀 Starting database seeding...");

    try {
        // 1. Create Roles
        console.log("Creating roles...");
        for (const role of ROLES) {
            await prisma.roles.upsert({
                where: { name: role.name },
                update: {},
                create: role
            });
        }
        console.log("✅ Roles created.");

        // 2. Find Super Admin Role
        const superAdminRole = await prisma.roles.findUnique({
            where: { name: "super_admin" }
        });

        if (!superAdminRole) throw new Error("Super Admin role not found");

        // 3. Create Super Admin Profile
        const email = "superadmin@gmail.com";
        const password = "passwor123"; // As requested by user
        const hashedPassword = await hashPassword(password);

        // Use a fixed ID to match potential existing auth users or just a fresh one
        const userId = "84930f1b-2d9f-48a3-b4fe-c70e909998f9";

        console.log(`Creating profile for ${email}...`);
        await prisma.profiles.upsert({
            where: { email },
            update: {
                password_hash: hashedPassword,
                role_id: superAdminRole.id,
                status: "approved",
                onboarding_completed: true
            },
            create: {
                id: userId,
                email,
                password_hash: hashedPassword,
                role_id: superAdminRole.id,
                full_name: "Super Admin",
                status: "approved",
                onboarding_completed: true,
                role: "super_admin"
            }
        });

        console.log("✅ Super Admin profile created.");
        console.log("\n✨ Seeding successful!");
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);

    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
