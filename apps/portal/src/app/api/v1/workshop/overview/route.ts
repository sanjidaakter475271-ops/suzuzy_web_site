import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/get-user";

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        // Fetch everything in parallel
        const [cards, tickets, ramps, staff, tasks] = await Promise.all([
            prisma.job_cards.findMany({
                where: {
                    status: { not: 'delivered' },
                    ...(user.dealerId ? { dealer_id: user.dealerId } : {})
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
                    ...(user.dealerId ? { profiles: { dealer_id: user.dealerId } } : {})
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
                    ...(user.dealerId ? { dealer_id: user.dealerId } : {})
                },
                include: { profiles: true }
            }),
            prisma.service_tasks.findMany({
                take: 50
            })
        ]);

        return NextResponse.json({
            success: true,
            data: {
                jobCards: cards,
                serviceTickets: tickets,
                ramps: ramps,
                staff: staff,
                serviceTasks: tasks
            }
        });

    } catch (error: any) {
        console.error("Workshop overview fetch error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
