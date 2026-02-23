import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { verifyToken } from "@/lib/auth/jwt";

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("access_token")?.value;
        const payload = token ? await verifyToken(token) : null;

        if (!payload || payload.role !== "super_admin") {
            return NextResponse.json({ error: "Unauthorized access to authority registry" }, { status: 403 });
        }

        const roles = await prisma.roles.findMany({
            include: {
                _count: {
                    select: {
                        profiles: true,
                        role_permissions: true
                    }
                }
            },
            orderBy: {
                level: 'asc'
            }
        });

        return NextResponse.json(roles);
    } catch (error: any) {
        console.error("Super Admin Role Fetch Error:", error);
        return NextResponse.json({ error: "Critical failure in authority registry retrieval" }, { status: 500 });
    }
}
