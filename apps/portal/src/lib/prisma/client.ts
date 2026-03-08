import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

if (!process.env.DATABASE_URL) {
    console.warn("WARNING: DATABASE_URL is not defined in environment variables");
}

function createPrismaClient(): PrismaClient {
    const connectionString = process.env.DATABASE_URL || "";

    // Explicit Pool configuration for better control and stability in production
    const pool = new pg.Pool({
        connectionString,
        max: 20, // Limit connections to prevent overwhelming the DB
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 30000,
    });

    pool.on('error', (err) => {
        console.error('[PRISMA_POOL] Unexpected pool error:', err.message);
    });

    const adapter = new PrismaPg(pool);

    return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
