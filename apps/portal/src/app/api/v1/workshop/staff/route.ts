import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/get-user";
import { z } from "zod";

const createSchema = z.object({
    name: z.string().min(1),
    email: z.string().email().optional(),
    designation: z.string().optional(),
    phone: z.string().optional(),
});

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const staff = await prisma.service_staff.findMany({
            where: {
                dealer_id: user.dealerId,
                is_active: true
            },
            include: { profiles: true }
        });

        return NextResponse.json({ success: true, data: staff });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'service_admin' && user.role !== 'super_admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const parsed = createSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
        }

        const { name, email, designation, phone } = parsed.data;

        // Check for duplicates
        if (email) {
            const existing = await prisma.service_staff.findFirst({
                where: { email, dealer_id: user.dealerId, is_active: true }
            });
            if (existing) {
                return NextResponse.json({ error: "Technician with this email already exists" }, { status: 400 });
            }
        }

        const staff = await prisma.service_staff.create({
            data: {
                name,
                email: email || `tech-${Math.random().toString(36).substring(7)}@suzuky.com`,
                designation: designation || "Technician",
                phone: phone || "",
                dealer_id: user.dealerId,
                status: "active", // Created by admin = active immediately
                is_active: true,
                staff_id: `TECH-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
            }
        });

        return NextResponse.json({ success: true, data: staff });
    } catch (error: any) {
        console.error("[STAFF_POST] error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
