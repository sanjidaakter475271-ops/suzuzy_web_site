import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

if (!process.env.DATABASE_URL) {
    console.warn("WARNING: DATABASE_URL is not defined in environment variables");
}

let prismaInstance: PrismaClient;

// Standard native driver - most reliable for Render (Linux/standard Node)
// PRISMA_USE_ADAPTER and @prisma/adapter-pg are removed as they are not needed
// in standard Node environments and were causing engine type mismatches on build.
prismaInstance = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});

export const prisma = globalForPrisma.prisma || prismaInstance;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
