import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma/client";

// Local recursive Decimal-to-Number serializer
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

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        const dealerId = user.dealerId;
        if (!dealerId) return NextResponse.json({ success: false, error: "Dealer context required" }, { status: 400 });

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'pending';

        const queue = await prisma.qc_requests.findMany({
            where: {
                status,
                job_cards: {
                    dealer_id: dealerId
                }
            },
            include: {
                job_cards: {
                    include: {
                        service_tickets: {
                            include: {
                                service_vehicles: true,
                                profiles: true
                            }
                        }
                    }
                },
                requester: {
                    select: { full_name: true }
                }
            },
            orderBy: { created_at: 'asc' }
        });

        return NextResponse.json({ success: true, data: serialize(queue) });
    } catch (error: any) {
        console.error("[QC_QUEUE_GET] Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
