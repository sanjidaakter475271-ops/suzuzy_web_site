import { prisma } from "../apps/portal/src/lib/prisma/client";
import "dotenv/config";
import path from "path";
import fs from "fs";

// Manually load env from apps/portal if not found
const portalEnvPath = path.resolve(process.cwd(), "apps/portal/.env");
if (fs.existsSync(portalEnvPath)) {
    require("dotenv").config({ path: portalEnvPath });
}

async function listRoles() {
    try {
        const roles = await prisma.roles.findMany({
            orderBy: { level: 'asc' }
        });
        console.log("Current Roles in Database:");
        console.table(roles.map(r => ({ name: r.name, level: r.level, type: r.role_type })));
    } catch (error) {
        console.error("Error listing roles:", error);
    } finally {
        await prisma.$disconnect();
    }
}

listRoles();
