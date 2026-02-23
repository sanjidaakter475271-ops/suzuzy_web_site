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

        const dealers = await prisma.dealers.findMany({
            orderBy: {
                created_at: 'desc'
            }
        });

        return NextResponse.json(dealers);
    } catch (error: any) {
        console.error("Dealer List Fetch Error:", error);
        return NextResponse.json({ error: "System registry unavailable" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get("access_token")?.value;
        const payload = token ? await verifyToken(token) : null;

        if (!payload || payload.role !== "super_admin") {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        const body = await req.json();
        const { business_name, email, phone, address_line1, city } = body;

        const slug = business_name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Math.random().toString(36).substring(2, 7);

        const dealer = await prisma.dealers.create({
            data: {
                business_name,
                slug,
                email,
                phone,
                address_line1,
                city,
                status: 'active',
                subscription_status: 'active'
            }
        });

        return NextResponse.json(dealer);
    } catch (error: any) {
        console.error("Dealer Enlistment Error:", error);
        return NextResponse.json({ error: "Consortia deployment failure" }, { status: 500 });
    }
}
