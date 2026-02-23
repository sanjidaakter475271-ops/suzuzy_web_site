import { prisma } from "../apps/portal/src/lib/prisma/client";
import "dotenv/config";
import path from "path";
import fs from "fs";

// Manually load env from apps/portal if not found
const portalEnvPath = path.resolve(process.cwd(), "apps/portal/.env");
if (fs.existsSync(portalEnvPath)) {
    require("dotenv").config({ path: portalEnvPath });
}

async function checkDb() {
    try {
        const dealersCount = await prisma.dealers.count();
        console.log(`Dealers count: ${dealersCount}`);

        const dealers = await prisma.dealers.findMany({ take: 5 });
        console.log("Dealers samples:", JSON.stringify(dealers, null, 2));

        const roles = await prisma.roles.findMany({ orderBy: { level: 'asc' } });
        console.log("Roles count:", roles.length);
        console.table(roles.map(r => ({ name: r.name, level: r.level, type: r.role_type })));

    } catch (error) {
        console.error("Error checking DB:", error);
    } finally {
        await prisma.$disconnect();
    }
}

checkDb();
