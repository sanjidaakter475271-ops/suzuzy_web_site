import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma/client";
import { z } from "zod";

const roleSchema = z.object({
    name: z.string().min(1).max(50),
    display_name: z.string().min(1).max(100),
    description: z.string().optional(),
    level: z.number().int().default(0),
    role_type: z.string().optional(),
});

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // RBAC check: only admins can manage roles
        if (!['service_admin', 'super_admin', 'dealer_owner'].includes(user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const roles = await prisma.roles.findMany({
            orderBy: { level: 'asc' },
            include: {
                _count: {
                    select: { profiles: true, role_permissions: true }
                }
            }
        });

        return NextResponse.json(roles);
    } catch (error: any) {
        console.error("[ROLES_GET] Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        if (!['service_admin', 'super_admin'].includes(user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const parsed = roleSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({
                error: "Validation failed",
                details: parsed.error.flatten()
            }, { status: 400 });
        }

        const role = await prisma.roles.create({
            data: {
                ...parsed.data,
                is_system_role: false,
            }
        });

        return NextResponse.json(role, { status: 201 });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "Role with this name already exists" }, { status: 409 });
        }
        console.error("[ROLES_POST] Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
