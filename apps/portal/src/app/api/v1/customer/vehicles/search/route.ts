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
        const customerId = searchParams.get("customerId");

        if (!customerId) {
            return NextResponse.json({ error: "Missing customerId" }, { status: 400 });
        }

        const data = await prisma.service_vehicles.findMany({
            where: { customer_id: customerId },
            select: { id: true, engine_number: true, chassis_number: true, bike_models: { select: { name: true } } },
        });

        const formatted = data.map(v => ({
            id: v.id,
            reg_no: v.engine_number, // Mapping engine_number as reg_no for frontend compatiability
            model: v.bike_models?.name || 'Unknown'
        }));

        return NextResponse.json({ success: true, data: formatted });
    } catch (error: any) {
        console.error("[VEHICLE_SEARCH]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
