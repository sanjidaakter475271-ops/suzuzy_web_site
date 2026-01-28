import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../src/lib/auth/password";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL || "";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const email = process.argv[2];
    const password = process.argv[3];

    if (!email || !password) {
        console.error("Usage: npx tsx scripts/reset-password.ts <email> <password>");
        process.exit(1);
    }

    console.log(`Resetting password for ${email}...`);

    try {
        const user = await prisma.profiles.findUnique({
            where: { email },
        });

        if (!user) {
            console.error("User not found!");
            process.exit(1);
        }

        const hashedPassword = await hashPassword(password);

        await prisma.profiles.update({
            where: { id: user.id },
            data: {
                password_hash: hashedPassword,
                failed_login_attempts: 0,
                locked_until: null,
            },
        });

        console.log("Password reset successfully!");
        console.log("Try logging in with the new password.");

    } catch (error) {
        console.error("Error resetting password:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
