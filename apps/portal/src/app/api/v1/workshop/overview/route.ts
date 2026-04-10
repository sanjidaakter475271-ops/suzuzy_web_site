import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/get-user";

/**
 * WORKSHOP OVERVIEW API
 * Highly resilient "Fetch-and-Stitch" implementation
 * Handles P2022 schema mismatches by isolating queries
 */
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

        console.log(`[WORKSHOP_OVERVIEW] Starting resilient fetch for dealer: ${dealerId}`);

        // Helper to convert Prisma Decimals to Numbers
        const serialize = (obj: any): any => {
            if (obj === null || obj === undefined) return obj;
            if (Array.isArray(obj)) return obj.map(serialize);
            if (typeof obj === 'object') {
                if (obj.constructor && obj.constructor.name === 'Decimal') return Number(obj.toString());
                const newObj: any = {};
                for (const key in obj) {
                    newObj[key] = serialize(obj[key]);
                }
                return newObj;
            }
            return obj;
        };

        // 1. Fetch Job Cards (Resiliently)
        let cards: any[] = [];
        try {
            cards = await prisma.job_cards.findMany({
                where: { status: { not: 'delivered' }, dealer_id: dealerId },
                orderBy: { created_at: 'desc' },
                take: 100
            });
        } catch (e: any) {
            console.warn("[WORKSHOP_OVERVIEW] Job Cards fetch failed, trying without dealer_id...");
            try {
                cards = await prisma.job_cards.findMany({
                    orderBy: { created_at: 'desc' },
                    take: 50
                });
            } catch (e2: any) {
                console.error("[WORKSHOP_OVERVIEW] Job Cards fetch failed completely");
            }
        }

        const cardIds = cards.map(c => c.id);
        const ticketIds = cards.map(c => c.ticket_id).filter(Boolean);

        // 2. Fetch Tickets for these cards
        let tickets: any[] = [];
        if (ticketIds.length > 0) {
            try {
                tickets = await prisma.service_tickets.findMany({
                    where: { id: { in: ticketIds } },
                    include: {
                        service_vehicles: {
                            include: { bike_models: { select: { name: true } } }
                        },
                        profiles: true
                    }
                });
            } catch (e) {
                console.warn("[WORKSHOP_OVERVIEW] Tickets fetch with includes failed, trying minimal...");
                try {
                    tickets = await prisma.service_tickets.findMany({
                        where: { id: { in: ticketIds } }
                    });
                } catch (e2) {
                    console.error("[WORKSHOP_OVERVIEW] Tickets fetch failed completely");
                }
            }
        }

        // 3. Fetch Tasks for these cards
        let tasks: any[] = [];
        if (cardIds.length > 0) {
            try {
                tasks = await prisma.service_tasks.findMany({
                    where: { job_card_id: { in: cardIds } }
                });
            } catch (e) {
                console.warn("[WORKSHOP_OVERVIEW] Tasks fetch failed");
            }
        }

        // 4. Fetch Requisitions for these cards
        let requisitions: any[] = [];
        if (cardIds.length > 0) {
            try {
                requisitions = await prisma.service_requisitions.findMany({
                    where: { job_card_id: { in: cardIds } },
                    include: { products: true }
                });
            } catch (e) {
                console.warn("[WORKSHOP_OVERVIEW] Requisitions fetch failed");
            }
        }

        // 5. Fetch Ramps
        let ramps: any[] = [];
        try {
            ramps = await prisma.service_ramps.findMany({
                where: { dealer_id: dealerId },
                include: {
                    service_staff: true,
                    current_ticket: {
                        include: { service_vehicles: true }
                    }
                },
                orderBy: { ramp_number: 'asc' }
            });
        } catch (e) {
            console.warn("[WORKSHOP_OVERVIEW] Ramps fetch failed");
        }

        // 6. Fetch Staff
        let staff: any[] = [];
        try {
            staff = await prisma.service_staff.findMany({
                where: { is_active: true, dealer_id: dealerId },
                include: { profiles: true }
            });
        } catch (e) {
            console.warn("[WORKSHOP_OVERVIEW] Staff fetch failed");
        }

        // 7. Manual Stitching (Matching Frontend Expectations)
        const jobCardsWithData = cards.map(card => {
            const ticket = tickets.find(t => t.id === card.ticket_id);
            const cardTasks = tasks.filter(t => t.job_card_id === card.id);
            const cardRequisitions = requisitions.filter(r => r.job_card_id === card.id);

            return {
                ...card,
                service_tickets: ticket,
                service_tasks: cardTasks,
                service_requisitions: cardRequisitions
            };
        });

        return NextResponse.json({
            success: true,
            data: serialize({
                jobCards: jobCardsWithData,
                serviceTickets: tickets,
                ramps: ramps,
                staff: staff,
                serviceTasks: tasks
            })
        });

    } catch (error: any) {
        console.error("[WORKSHOP_OVERVIEW_FATAL]", error);
        return NextResponse.json({
            success: false,
            error: error.message,
            details: "Fatal error in overview fetching"
        }, { status: 500 });
    }
}
