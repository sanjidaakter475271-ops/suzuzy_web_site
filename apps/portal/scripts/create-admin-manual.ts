import path from "path";
import fs from "fs";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

// 1. Manually load environment variables
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
    require("dotenv").config({ path: envPath });
}

// Use DIRECT_URL for scripts to avoid pooler issues
const dbUrl = process.env.DIRECT_URL || "postgresql://postgres:Nazmul%402%40%40%40@db.idqikowpudzjickwpfzr.supabase.co:5432/postgres";

// 2. Setup manual Prisma for this script
const prisma = new PrismaClient({
    datasourceUrl: dbUrl,
});

const email = "superadmin@gmail.com";

async function createAdmin() {
    try {
        console.log(`Setting up superadmin: ${email}...`);

        const userId = randomUUID();
        const role = "super_admin";
        const roleId = "d7511c63-9639-43ef-a738-7a21b9649a68";

        console.log("Creating user via direct Prisma...");

        await prisma.$transaction([
            prisma.user.upsert({
                where: { email },
                create: {
                    id: userId,
                    email: email,
                    name: "Super Admin",
                    emailVerified: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    role: role,
                    roleId: roleId,
                    image: null
                },
                update: {
                    role: role,
                    roleId: roleId,
                }
            }),
            prisma.profiles.upsert({
                where: { email },
                create: {
                    id: userId,
                    email: email,
                    full_name: "Super Admin",
                    role: role,
                    role_id: roleId,
                    status: "approved",
                    created_at: new Date(),
                    updated_at: new Date()
                },
                update: {
                    role: role,
                    role_id: roleId,
                    status: "approved",
                    updated_at: new Date()
                },
            })
        ]);

        console.log("SUCCESS! Created profile and user record.");
    } catch (error: any) {
        console.error("Setup failed:", error.message);
    } finally {
        await prisma.$disconnect();
        process.exit(0);
    }
}

createAdmin();
