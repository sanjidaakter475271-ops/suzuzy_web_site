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
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        // Build where clause for filtering by role and dealer
        const whereClause: any = {
            dealer_id: user.dealerId,
            OR: [
                { role: 'customer' },
                { service_vehicles: { some: {} } }
            ]
        };

        if (query) {
            whereClause.AND = [
                {
                    OR: [
                        { full_name: { contains: query, mode: 'insensitive' } },
                        { phone: { contains: query } },
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
                    ]
                }
            ];
        }

        const [total, data] = await Promise.all([
            prisma.profiles.count({ where: whereClause }),
            prisma.profiles.findMany({
                where: whereClause,
                select: {
                    id: true,
                    full_name: true,
                    phone: true,
                    email: true,
                    created_at: true,
                    service_vehicles: {
                        select: {
                            id: true,
                            bike_models: { select: { name: true } }
                        }
                    },
                    customer_addresses: {
                        where: { is_default: true },
                        select: { city: true, address_line1: true }
                    }
                },
                orderBy: { created_at: 'desc' },
                skip,
                take: limit
            })
        ]);

        const formattedData = data.map(profile => ({
            id: profile.id,
            name: profile.full_name,
            phone: profile.phone,
            email: profile.email,
            address: profile.customer_addresses[0]
                ? `${profile.customer_addresses[0].address_line1}, ${profile.customer_addresses[0].city}`
                : "No address provided",
            type: 'individual', // Default for now
            vehicles: profile.service_vehicles.map(v => v.bike_models?.name || "Unknown"),
            createdAt: profile.created_at
        }));

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
        console.error("[CRM_CUSTOMERS_LIST_API]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
