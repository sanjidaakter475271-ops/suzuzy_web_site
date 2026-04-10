import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma/client";

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Only block if role REQUIRES dealerId but it's missing
        if (user.isDealerScoped && !user.dealerId) {
            return NextResponse.json({ error: "Unauthorized: Dealer ID required" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const query = searchParams.get("query") || "";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "12");
        const skip = Math.max(0, (page - 1) * limit);

        // Build robust where clause
        const andConditions: any[] = [];

        // Apply dealer scoping if user has a dealerId
        if (user.dealerId) {
            andConditions.push({
                profiles: {
                    dealer_id: user.dealerId
                }
            });
        }

        // Apply search query
        if (query) {
            andConditions.push({
                OR: [
                    { engine_number: { contains: query, mode: 'insensitive' } },
                    { chassis_number: { contains: query, mode: 'insensitive' } },
                    { reg_no: { contains: query, mode: 'insensitive' } },
                    { phone_number: { contains: query } },
                    { customer_name: { contains: query, mode: 'insensitive' } },
                    { profiles: { full_name: { contains: query, mode: 'insensitive' } } }
                ]
            });
        }

        const whereClause = andConditions.length > 0 ? { AND: andConditions } : {};

        const [total, vehicles] = await Promise.all([
            prisma.service_vehicles.count({ where: whereClause }),
            prisma.service_vehicles.findMany({
                where: whereClause,
                include: {
                    bike_models: {
                        select: { name: true, code: true }
                    },
                    profiles: {
                        select: { full_name: true, phone: true }
                    },
                    customer_service_plans: {
                        where: { is_active: true },
                        take: 1
                    },
                    service_history: {
                        orderBy: { service_date: 'desc' },
                        take: 1,
                        select: { service_date: true, mileage: true }
                    }
                },
                orderBy: { created_at: 'desc' },
                skip,
                take: limit
            })
        ]);

        const formattedData = vehicles.map(v => {
            const latestHistory = v.service_history[0];
            const activePlan = v.customer_service_plans[0];

            return {
                id: v.id,
                customerId: v.customer_id,
                ownerName: v.profiles?.full_name || v.customer_name || "Unknown",
                ownerPhone: v.profiles?.phone || v.phone_number,
                model: v.bike_models?.name || "Unknown",
                modelCode: v.bike_models?.code || null,
                engineNo: v.engine_number,
                chassisNo: v.chassis_number,
                regNo: v.reg_no,
                color: v.color,
                purchaseDate: v.date_of_purchase,
                lastServiceDate: latestHistory?.service_date || null,
                lastMileage: latestHistory?.mileage ? Number(latestHistory.mileage) : 0,
                servicePlan: activePlan ? {
                    total: Number(activePlan.total_free_services),
                    used: Number(activePlan.used_free_services),
                    remaining: Number(activePlan.total_free_services) - Number(activePlan.used_free_services)
                } : null
            };
        });

        return NextResponse.json({
            success: true,
            data: formattedData,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error: any) {
        console.error("[CRM_VEHICLES_LIST_API]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
