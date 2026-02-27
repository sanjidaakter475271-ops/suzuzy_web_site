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

        // Fetch everything in parallel
        const [cards, tickets, ramps, staff, tasks] = await Promise.all([
            prisma.job_cards.findMany({
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
                    }
                },
                orderBy: { created_at: 'desc' },
                take: 100
            }),
            prisma.service_tickets.findMany({
                where: {
                    status: { not: 'closed' },
                    profiles: { dealer_id: dealerId }
                },
                take: 50
            }),
            prisma.service_ramps.findMany({
                include: {
                    service_staff: true,
                    service_tickets_service_ramps_current_ticket_idToservice_tickets: {
                        include: { service_vehicles: true }
                    }
                },
                orderBy: { ramp_number: 'asc' }
            }),
            prisma.service_staff.findMany({
                where: {
                    is_active: true,
                    dealer_id: dealerId
                },
                include: { profiles: true }
            }),
            prisma.service_tasks.findMany({
                take: 50
            })
        ]);

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
