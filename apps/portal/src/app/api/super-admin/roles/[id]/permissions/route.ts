import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { verifyToken } from "@/lib/auth/jwt";

// GET assigned permissions for a role
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const token = req.cookies.get("access_token")?.value;
        const payload = token ? await verifyToken(token) : null;

        if (!payload || payload.role !== "super_admin") {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        const rolePermissions = await prisma.role_permissions.findMany({
            where: { role_id: id },
            select: { permission_id: true }
        });

        return NextResponse.json(rolePermissions.map(rp => rp.permission_id));
    } catch (error: any) {
        console.error("Role Permissions Fetch Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// UPDATE (Sync) permissions for a role
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { permissionIds } = await req.json();

        const token = req.cookies.get("access_token")?.value;
        const payload = token ? await verifyToken(token) : null;

        if (!payload || payload.role !== "super_admin") {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        if (!Array.isArray(permissionIds)) {
            return NextResponse.json({ error: "Invalid permission list" }, { status: 400 });
        }

        await prisma.$transaction(async (tx) => {
            // 1. Delete all existing
            await tx.role_permissions.deleteMany({
                where: { role_id: id }
            });

            // 2. Insert new ones
            if (permissionIds.length > 0) {
                await tx.role_permissions.createMany({
                    data: permissionIds.map(permId => ({
                        role_id: id,
                        permission_id: permId
                    }))
                });
            }
        });

        return NextResponse.json({ success: true, message: "Role privileges updated" });
    } catch (error: any) {
        console.error("Role Permissions Update Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
