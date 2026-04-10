import { prisma } from "./src/lib/prisma/client";

async function checkSchema() {
    console.log("Checking columns for 'job_cards'...");
    try {
        const columns = await prisma.$queryRaw`
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'job_cards';
        `;
        console.log("Columns for job_cards:", columns);
    } catch (e: any) {
        console.error("Failed to check job_cards columns:", e.message);
    }

    console.log("\nChecking columns for 'service_tickets'...");
    try {
        const columns = await prisma.$queryRaw`
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'service_tickets';
        `;
        console.log("Columns for service_tickets:", columns);
    } catch (e: any) {
        console.error("Failed to check service_tickets columns:", e.message);
    }
}

checkSchema();
