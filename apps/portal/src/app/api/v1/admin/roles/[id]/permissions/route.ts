import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma/client";
import { z } from "zod";

const permissionsSchema = z.object({
    permissionIds: z.array(z.string().uuid()),
});

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        if (!['service_admin', 'super_admin', 'dealer_owner'].includes(user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const rolePermissions = await prisma.role_permissions.findMany({
            where: { role_id: id },
            include: { permissions: true }
        });

        return NextResponse.json(rolePermissions.map(rp => rp.permissions));
    } catch (error: any) {
        console.error("[ROLE_PERMISSIONS_GET] Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        if (!['service_admin', 'super_admin'].includes(user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const parsed = permissionsSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
        }

        // Atomic update: delete old, add new
        await prisma.$transaction([
            prisma.role_permissions.deleteMany({ where: { role_id: id } }),
            prisma.role_permissions.createMany({
                data: parsed.data.permissionIds.map(pid => ({
                    role_id: id,
                    permission_id: pid
                }))
            })
        ]);

        return NextResponse.json({ success: true, message: "Permissions updated" });
    } catch (error: any) {
        console.error("[ROLE_PERMISSIONS_PUT] Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
