import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { verifyToken } from "@/lib/auth/jwt";

import { SYSTEM_PERMISSIONS } from "@/lib/auth/permission-utils";

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get("access_token")?.value;
        const payload = token ? await verifyToken(token) : null;

        if (!payload || payload.role !== "super_admin") {
            return NextResponse.json({ error: "Unauthorized permission synchronization" }, { status: 403 });
        }

        const results = [];
        for (const perm of SYSTEM_PERMISSIONS) {
            const upserted = await prisma.permissions.upsert({
                where: {
                    name: perm.name
                },
                update: {
                    module: perm.module,
                    action: perm.action,
                    resource: perm.resource,
                    description: perm.description,
                },
                create: perm,
            });
            results.push(upserted);
        }

        return NextResponse.json({
            success: true,
            message: "System permissions synchronized successfully",
            count: results.length
        });
    } catch (error: any) {
        console.error("Permission Sync Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
