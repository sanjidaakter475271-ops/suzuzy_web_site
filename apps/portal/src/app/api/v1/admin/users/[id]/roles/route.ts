import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma/client";
import { z } from "zod";

const userRolesSchema = z.object({
    roleIds: z.array(z.string().uuid()),
    dealerId: z.string().uuid().optional(),
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

        const roles = await prisma.profile_roles.findMany({
            where: { profile_id: id },
            include: { roles: true }
        });

        return NextResponse.json(roles);
    } catch (error: any) {
        console.error("[USER_ROLES_GET] Error:", error);
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

        if (!['service_admin', 'super_admin', 'dealer_owner'].includes(user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const parsed = userRolesSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
        }

        const targetDealerId = parsed.data.dealerId || user.dealerId;

        await prisma.$transaction([
            prisma.profile_roles.deleteMany({
                where: {
                    profile_id: id,
                    dealer_id: targetDealerId
                }
            }),
            prisma.profile_roles.createMany({
                data: parsed.data.roleIds.map(rid => ({
                    profile_id: id,
                    role_id: rid,
                    dealer_id: targetDealerId,
                    assigned_by: user.userId
                }))
            })
        ]);

        return NextResponse.json({ success: true, message: "User roles updated" });
    } catch (error: any) {
        console.error("[USER_ROLES_PUT] Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
