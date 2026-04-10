import { prisma } from "./src/lib/prisma/client";

async function test() {
    const dealerId = "e55d55e5-55e5-45e5-a5e5-555555555555"; // Dummy UUID

    console.log("Testing job_cards.findMany...");
    try {
        await prisma.job_cards.findMany({
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
            take: 10
        });
        console.log("✅ job_cards.findMany works");
    } catch (e) {
        console.error("❌ job_cards.findMany failed:", e.message);
    }

    console.log("Testing service_tickets.findMany...");
    try {
        await prisma.service_tickets.findMany({
            where: {
                status: { not: 'closed' },
                profiles: { dealer_id: dealerId }
            },
            take: 10
        });
        console.log("✅ service_tickets.findMany works");
    } catch (e) {
        console.error("❌ service_tickets.findMany failed:", e.message);
    }

    console.log("Testing service_ramps.findMany...");
    try {
        await prisma.service_ramps.findMany({
            where: { dealer_id: dealerId },
            include: {
                service_staff: true,
                service_tickets_service_ramps_current_ticket_idToservice_tickets: {
                    include: { service_vehicles: true }
                }
            }
        });
        console.log("✅ service_ramps.findMany works");
    } catch (e) {
        console.error("❌ service_ramps.findMany failed:", e.message);
    }
}

test();
