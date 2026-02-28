import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { verifyToken } from "@/lib/auth/jwt";

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("access_token")?.value;
        const payload = token ? await verifyToken(token) : null;

        if (!payload || payload.role !== "super_admin") {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        const permissions = await prisma.permissions.findMany({
            orderBy: [
                { module: 'asc' },
                { action: 'asc' }
            ]
        });

        return NextResponse.json(permissions);
    } catch (error: any) {
        console.error("Permissions Fetch Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get("access_token")?.value;
        const payload = token ? await verifyToken(token) : null;
        if (!payload || payload.role !== "super_admin") {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        const { module, action, resource, description } = await req.json();

        if (!module || !action || !resource) {
            return NextResponse.json({ error: "Module, action, and resource are required" }, { status: 400 });
        }

        const existing = await prisma.permissions.findUnique({
            where: {
                module_action_resource: {
                    module,
                    action,
                    resource
                }
            }
        });

        if (existing) {
            return NextResponse.json({ error: "Permission already exists" }, { status: 409 });
        }

        const newPerm = await prisma.permissions.create({
            data: {
                module,
                action,
                resource,
                description
            }
        });

        return NextResponse.json(newPerm, { status: 201 });
    } catch (error: any) {
        console.error("Permission Creation Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
