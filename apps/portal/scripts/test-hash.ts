import { betterAuth } from "better-auth";
import { PrismaClient } from "@prisma/client";
import { prismaAdapter } from "better-auth/adapters/prisma";

// Mock prisma to avoid connection errors, we just want the auth instance
const prisma = new PrismaClient();
const auth = betterAuth({
    database: prismaAdapter(prisma, { provider: "postgresql" }),
    emailAndPassword: { enabled: true }
});

async function generate() {
    try {
        // @ts-ignore - accessing internal or using public api if available
        const hash = await auth.password.hash("password123");
        console.log("HASH:" + hash);
    } catch (e) {
        console.log("Error hashing:", e);
        // Fallback or try to find where hash is
    }
}
generate();
