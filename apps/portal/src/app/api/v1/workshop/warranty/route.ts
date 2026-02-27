import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/get-user";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const dealerId = user.dealerId;
        if (!dealerId) return NextResponse.json({ error: "Dealer context required" }, { status: 400 });

        const claims = await prisma.warranty_claims.findMany({
            where: {
                dealer_id: dealerId
            },
            include: {
                service_vehicles: true,
                profiles: { select: { full_name: true } },
                warranty_claim_parts: true
            },
            orderBy: { created_at: 'desc' }
        });

        return NextResponse.json({ success: true, data: claims });
    } catch (error: unknown) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const dealerId = user.dealerId;
        if (!dealerId) return NextResponse.json({ error: "Dealer context required" }, { status: 400 });

        const body = await req.json();
        const { ticket_id, job_card_id, failure_date, failure_description, claim_type, parts } = body;

        // Fetch vehicle/customer info from ticket
        const ticket = await prisma.service_tickets.findUnique({
            where: { id: ticket_id },
            include: { service_vehicles: true }
        });

        if (!ticket) return NextResponse.json({ error: "Service ticket not found" }, { status: 404 });

        const claimNumber = `WC-${Date.now()}`;

        const claim = await prisma.warranty_claims.create({
            data: {
                claim_number: claimNumber,
                dealer_id: dealerId,
                ticket_id,
                job_card_id,
                vehicle_id: ticket.vehicle_id,
                customer_id: ticket.customer_id,
                claim_type,
                failure_date: new Date(failure_date),
                failure_description,
                status: 'pending',
                warranty_claim_parts: {
                    create: parts.map((p: { part_number: string; description: string; quantity: number; unit_cost: number; causal_part?: boolean }) => ({
                        part_number: p.part_number,
                        description: p.description,
                        quantity: p.quantity,
                        unit_cost: p.unit_cost,
                        causal_part: p.causal_part || false
                    }))
                }
            },
            include: { warranty_claim_parts: true }
        });

        return NextResponse.json({ success: true, data: claim });
    } catch (error: unknown) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
