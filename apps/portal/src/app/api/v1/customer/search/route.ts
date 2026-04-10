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

        // Build a robust where clause for multi-field search
        // Scoped to the current dealer
        const whereClause: any = {
            dealer_id: user.dealerId,
        };

        if (query) {
            whereClause.OR = [
                { full_name: { contains: query, mode: 'insensitive' } },
                { phone: { contains: query } },
                { email: { contains: query, mode: 'insensitive' } },
                {
                    service_vehicles: {
                        some: {
                            OR: [
                                { engine_number: { contains: query, mode: 'insensitive' } },
                                { chassis_number: { contains: query, mode: 'insensitive' } },
                                { reg_no: { contains: query, mode: 'insensitive' } },
                            ]
                        }
                    }
                }
            ];
        }

        const data = await prisma.profiles.findMany({
            where: whereClause,
            select: {
                id: true,
                full_name: true,
                phone: true,
                email: true,
                service_vehicles: {
                    select: {
                        id: true,
                        engine_number: true,
                        chassis_number: true,
                        reg_no: true,
                        bike_models: {
                            select: {
                                name: true
                            }
                        }
                    },
                    take: 5
                }
            },
            take: 15
        });

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error("[CUSTOMER_SEARCH]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
