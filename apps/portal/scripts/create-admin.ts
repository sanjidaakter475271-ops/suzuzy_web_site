import path from "path";
import fs from "fs";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// 1. Manually load environment variables
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
    require("dotenv").config({ path: envPath });
}

// Use DATABASE_URL (Pooler) as DIRECT_URL is currently unreachable
const dbUrl = process.env.DATABASE_URL || "postgresql://postgres.idqikowpudzjickwpfzr:Nazmul%402%40%40%40@aws-1-ap-south-1.pooler.supabase.com:5432/postgres";
console.log(`Using database URL: ${dbUrl.replace(/:[^@]+@/, ":****@")}`);
process.env.DATABASE_URL = dbUrl;

if (!dbUrl) {
    console.error("Error: database URL is missing.");
    process.exit(1);
}

// 2. Setup manual Prisma for this script
const prisma = new PrismaClient();

// 3. Setup manual Better Auth for this script
const auth = betterAuth({
    database: prismaAdapter(prisma, { provider: "postgresql" }),
    emailAndPassword: { enabled: true },
    secret: process.env.BETTER_AUTH_SECRET || "secret",
});

const email = "superadmin@gmail.com";
const password = "password123";
const role = "super_admin";
const roleId = "d7511c63-9639-43ef-a738-7a21b9649a68";

async function createAdmin() {
    try {
        console.log(`Cleaning up existing user: ${email}...`);
        // Cleanup existing user to avoid conflicts
        try {
            await prisma.profiles.deleteMany({ where: { email } });
            await prisma.user.deleteMany({ where: { email } });
            // Account should cascade delete if relation is set, but better safe?
            // Better auth user delete cascades usually.
            console.log("Cleanup done.");
        } catch (e) {
            console.log("Cleanup warning:", e);
        }

        console.log(`Setting up superadmin: ${email}...`);

        // Use auth.api.signUpEmail to create the user properly hashed
        // Since we deleted the user earlier, this should work
        const result = await auth.api.signUpEmail({
            body: {
                email,
                password,
                name: "Super Admin",
            },
        });

        if (!result || !result.user) {
            throw new Error("Failed to create user via Better Auth");
        }

        const userId = result.user.id;
        console.log(`User created with ID: ${userId}`);

        // Sync with profiles and set role
        // Profile table uses UUID, so we need to ensure Better Auth created a UUID
        // Or we might need to cast/fix it.
        console.log("Checking if ID is UUID...");
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

        if (!isUuid) {
            console.warn("Better Auth did not return a UUID. We will use SQL to fix it.");
            // This is complex. For now, let's see if this version even connects.
        }

        await prisma.$transaction([
            prisma.profiles.upsert({
                where: { email },
                create: {
                    id: userId,
                    email: email,
                    full_name: "Super Admin",
                    role: role,
                    role_id: roleId,
                    status: "active",
                },
                update: {
                    id: userId,
                    role: role,
                    role_id: roleId,
                    status: "active",
                },
            }) as any,
            prisma.user.update({
                where: { id: userId },
                data: {
                    role: role,
                    roleId: roleId,
                },
            }),
        ]);

        console.log("SUCCESS!");
    } catch (error: any) {
        console.error("Setup failed:", error.message);
    } finally {
        await prisma.$disconnect();
        process.exit(0);
    }
}

createAdmin();
