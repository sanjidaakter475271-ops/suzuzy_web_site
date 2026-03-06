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

        // 1. Try finding by direct customer_id link
        let data = await prisma.service_vehicles.findMany({
            where: { customer_id: customerId },
            select: { id: true, engine_number: true, chassis_number: true, bike_models: { select: { name: true } } },
        });

        // 2. Fallback: If no direct link found, try finding by phone number matching the customer's profile
        if (data.length === 0) {
            const customer = await prisma.profiles.findUnique({
                where: { id: customerId },
                select: { phone: true }
            });

            if (customer?.phone) {
                const phoneVehicles = await prisma.service_vehicles.findMany({
                    where: { phone_number: customer.phone },
                    select: { id: true, engine_number: true, chassis_number: true, bike_models: { select: { name: true } } },
                });
                data = phoneVehicles;
            }
        }

        const formatted = data.map(v => ({
            id: v.id,
            reg_no: v.engine_number || v.chassis_number || 'N/A', // Mapping engine or chassis as reg_no
            model: v.bike_models?.name || 'Unknown'
        }));

        return NextResponse.json({ success: true, data: formatted });
    } catch (error: any) {
        console.error("[VEHICLE_SEARCH]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
