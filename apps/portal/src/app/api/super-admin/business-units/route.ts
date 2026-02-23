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

        const units = await prisma.business_units.findMany({
            include: {
                _count: {
                    select: {
                        business_unit_users: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        return NextResponse.json(units);
    } catch (error: any) {
        console.error("Business Units List Fetch Error:", error);
        return NextResponse.json({ error: "Failed to retrieve organizational registry" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get("access_token")?.value;
        const payload = token ? await verifyToken(token) : null;

        if (!payload || payload.role !== "super_admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await req.json();
        const { name, code, unit_type } = body;

        if (!name || !code || !unit_type) {
            return NextResponse.json({ error: "Missing required unit parameters" }, { status: 400 });
        }

        const unit = await prisma.business_units.create({
            data: {
                name,
                code: code.toUpperCase(),
                unit_type,
                is_active: true
            }
        });

        return NextResponse.json(unit);
    } catch (error: any) {
        console.error("Business Unit Creation Error:", error);
        return NextResponse.json({ error: "Unit initialization failure" }, { status: 500 });
    }
}
