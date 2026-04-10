import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/get-user";

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const dealerId = user.dealerId;
        if (!dealerId) {
            return NextResponse.json({ error: "Dealer context required" }, { status: 400 });
        }

        // Fetch everything sequentially to identify the culprit
        console.log("[OVERVIEW_DEBUG] Starting cards fetch...");
        const cards = await prisma.job_cards.findMany({
            where: {
                status: { not: 'delivered' },
                dealer_id: dealerId
            },
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
            orderBy: { created_at: 'desc' },
            take: 100
        });

        console.log("[OVERVIEW_DEBUG] Starting tickets fetch...");
        const tickets = await prisma.service_tickets.findMany({
            where: {
                status: { not: 'closed' },
                profiles: { dealer_id: dealerId }
            },
            take: 50
        });

        console.log("[OVERVIEW_DEBUG] Starting ramps fetch...");
        const ramps = await prisma.service_ramps.findMany({
            where: { dealer_id: dealerId },
            include: {
                service_staff: true,
                service_tickets_service_ramps_current_ticket_idToservice_tickets: {
                    include: { service_vehicles: true }
                }
            },
            orderBy: { ramp_number: 'asc' }
        });

        console.log("[OVERVIEW_DEBUG] Starting staff fetch...");
        const staff = await prisma.service_staff.findMany({
            where: {
                is_active: true,
                OR: [
                    { dealer_id: dealerId },
                    { status: 'pending', dealer_id: null }
                ]
            },
            include: { profiles: true }
        });

        console.log("[OVERVIEW_DEBUG] Starting tasks fetch...");
        const tasks = await prisma.service_tasks.findMany({
            take: 50
        });

        console.log("[OVERVIEW_DEBUG] All fetches completed.");

        // Helper to convert Prisma Decimals to Numbers
        const serialize = (obj: any): any => {
            if (obj === null || obj === undefined) return obj;
            if (Array.isArray(obj)) return obj.map(serialize);
            if (typeof obj === 'object') {
                // Check if it's a Decimal object from Prisma
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

        return NextResponse.json({
            success: true,
            data: serialize({
                jobCards: cards,
                serviceTickets: tickets,
                ramps: ramps,
                staff: staff,
                serviceTasks: tasks
            })
        });

    } catch (error: any) {
        console.error("Workshop overview fetch error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
