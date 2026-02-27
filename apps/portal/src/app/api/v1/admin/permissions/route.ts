import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma/client";

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // RBAC check: only admins can manage permissions
        if (!['service_admin', 'super_admin', 'dealer_owner'].includes(user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const permissions = await prisma.permissions.findMany({
            orderBy: [{ module: 'asc' }, { resource: 'asc' }, { action: 'asc' }]
        });

        return NextResponse.json(permissions);
    } catch (error: any) {
        console.error("[PERMISSIONS_GET] Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
