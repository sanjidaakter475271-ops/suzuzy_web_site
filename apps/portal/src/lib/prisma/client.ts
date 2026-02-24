import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

if (!process.env.DATABASE_URL) {
    console.warn("WARNING: DATABASE_URL is not defined in environment variables");
}

// Build connection string
const connectionString = process.env.DATABASE_URL || "";

// Use native Prisma driver by default for better performance and stability on Linux/Render
// The adapter is only used if specified or for specific compatibility needs
const useAdapter = process.env.PRISMA_USE_ADAPTER === "true";

let prismaInstance: PrismaClient;

if (useAdapter) {
    const pool = new Pool({
        connectionString,
        ssl: process.env.NODE_ENV === "production"
            ? { rejectUnauthorized: false }
            : false,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 15000,
    });

    pool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
    });

    const adapter = new PrismaPg(pool);
    prismaInstance = new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
} else {
    // Standard native driver
    prismaInstance = new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
}

export const prisma = globalForPrisma.prisma || prismaInstance;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
