import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma/client";

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || (!user.dealerId && user.role !== 'admin')) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const query = searchParams.get("query") || "";

        const whereClause: any = {};
        if (query) {
            whereClause.OR = [
                { full_name: { contains: query, mode: 'insensitive' } },
                { phone: { contains: query } }
            ];
        }

        // Simplistic search, assumes users are just profiles. 
        // In reality, customers are typically profiles that have the role 'customer' but here we just search profiles
        const data = await prisma.profiles.findMany({
            where: whereClause,
            select: { id: true, full_name: true, phone: true },
            take: 10
        });

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error("[CUSTOMER_SEARCH]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
