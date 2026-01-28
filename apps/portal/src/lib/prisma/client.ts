import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

if (!process.env.DATABASE_URL) {
    console.warn("WARNING: DATABASE_URL is not defined in environment variables");
}

// Build connection string with proper SSL mode
const connectionString = process.env.DATABASE_URL || "";

const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false, // Disable SSL for local development on Windows
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // Increased timeout
});

// Log pool errors
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

const adapter = new PrismaPg(pool);

// Use native Prisma driver instead of pg adapter to fix Windows TLS issue
export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
