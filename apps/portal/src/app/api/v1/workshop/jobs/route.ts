import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/get-user";

const serialize = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;
    if (Array.isArray(obj)) return obj.map(serialize);
    if (typeof obj === 'object') {
        if (obj.constructor && obj.constructor.name === 'Decimal') {
            return Number(obj);
        }
        const newObj: any = {};
        for (const key in obj) {
            newObj[key] = serialize(obj[key]);
        }
        return newObj;
    }
    return obj;
};

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const dealerId = user.dealerId;
        if (!dealerId) return NextResponse.json({ error: "Dealer context required" }, { status: 400 });

        const searchParams = new URL(req.url).searchParams;
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '20', 10);
        const skip = (page - 1) * limit;
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        // Build filtering where clause
        const where: any = {
            dealer_id: dealerId
        };

        if (status && status !== 'all') {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { service_tickets: { service_number: { contains: search, mode: 'insensitive' } } },
                { service_tickets: { profiles: { full_name: { contains: search, mode: 'insensitive' } } } },
                { service_tickets: { service_vehicles: { engine_number: { contains: search, mode: 'insensitive' } } } }
            ];
        }

        // Parallel query for paginated results and total count
        const [jobCards, totalItems] = await Promise.all([
            prisma.job_cards.findMany({
                where,
                skip,
                take: limit,
                include: {
                    service_tickets: {
                        include: {
                            service_vehicles: {
                                include: { bike_models: true }
                            },
                            profiles: true
                        }
                    },
                    service_tasks: true,
                    service_requisitions: {
                        include: {
                            products: true
                        }
                    },
                    qc_requests: {
                        where: { status: 'pending' },
                        orderBy: { created_at: 'desc' },
                        take: 1
                    }
                },
                orderBy: { created_at: 'desc' }
            }),
            prisma.job_cards.count({ where })
        ]);

        return NextResponse.json({
            success: true,
            data: serialize(jobCards),
            pagination: {
                total: totalItems,
                page,
                limit,
                totalPages: Math.ceil(totalItems / limit)
            }
        });

    } catch (error: any) {
        console.error("[JOB_CARDS_GET_ERROR]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
