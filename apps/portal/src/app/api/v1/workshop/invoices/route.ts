import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/get-user";
import { generateInvoiceNumber } from "@/lib/utils/invoice-number";

// Helper to convert Prisma Decimals to Numbers
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
        if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const dealerId = user.dealerId;
        if (!dealerId) return NextResponse.json({ success: false, error: "Dealer context required" }, { status: 400 });

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');

        const invoices = await prisma.service_invoices.findMany({
            where: {
                dealer_id: dealerId,
                ...(status ? { status } : {})
            },
            include: {
                service_tickets: true,
                profiles: {
                    select: { full_name: true, phone: true }
                },
                service_vehicles: {
                    include: { bike_models: true }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        return NextResponse.json({ success: true, data: serialize(invoices) });
    } catch (error: any) {
        console.error("Invoice fetch error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        const dealerId = user.dealerId;
        if (!dealerId) return NextResponse.json({ success: false, error: "Dealer context required" }, { status: 400 });

        const body = await req.json();
        const { job_card_id, tax_pct = 0, discount_pct = 0, notes } = body;

        if (!job_card_id) {
            return NextResponse.json({ success: false, error: "Job card ID is required" }, { status: 400 });
        }

        // Fetch job card with parts_usage + service_tasks, scoped by dealerId
        const jobCard = await prisma.job_cards.findFirst({
            where: {
                id: job_card_id,
                dealer_id: dealerId
            },
            include: {
                parts_usage: { include: { part_variants: { include: { parts: true } } } },
                service_tasks: true,
                service_tickets: { include: { service_vehicles: { include: { bike_models: true } } } },
            },
        });

        if (!jobCard) {
            return NextResponse.json({ success: false, error: "Job card not found or access denied" }, { status: 404 });
        }

        // Calculate labor items (service_tasks)
        // Note: Currently price is hardcoded to 0 or 300 since there's no price column in service_tasks schema.
        // We might want to use a default or fetch from a catalog if it existed.
        const laborItems = jobCard.service_tasks.map(task => ({
            item_type: 'labor',
            description: `Labor: ${task.name}`,
            quantity: 1,
            unit_price: 300,
            total: 300,
            product_id: null as string | null,
        }));

        // Calculate parts items (parts_usage)
        const partsItems = jobCard.parts_usage.map(part => ({
            item_type: 'parts',
            description: part.part_variants?.parts?.name || 'Part',
            product_id: part.part_variants?.part_id || null,
            quantity: part.quantity,
            unit_price: Number(part.unit_price || 0),
            total: Number(part.total_price || 0),
        }));

        const subtotal = [...laborItems, ...partsItems].reduce((sum, item) => sum + Number(item.total), 0);
        const discount_amount = (subtotal * discount_pct) / 100;
        const tax_amount = ((subtotal - discount_amount) * tax_pct) / 100;
        const grand_total = subtotal - discount_amount + tax_amount;

        const invoice = await prisma.$transaction(async (tx) => {
            const invNumber = await generateInvoiceNumber(dealerId);

            const inv = await tx.service_invoices.create({
                data: {
                    invoice_number: invNumber,
                    dealer_id: dealerId,
                    ticket_id: jobCard.ticket_id,
                    job_card_id: jobCard.id,
                    customer_id: jobCard.service_tickets?.customer_id,
                    vehicle_id: jobCard.service_tickets?.vehicle_id,
                    subtotal,
                    tax_amount,
                    discount_amount,
                    grand_total,
                    due_amount: grand_total,
                    status: 'draft',
                    notes,
                    invoice_items: {
                        create: [...laborItems, ...partsItems].map(item => ({
                            item_type: item.item_type,
                            description: item.description,
                            quantity: item.quantity,
                            unit_price: Number(item.unit_price),
                            total: Number(item.total),
                            product_id: item.product_id
                        }))
                    },
                },
                include: {
                    invoice_items: true
                }
            });

            // Update job card status to 'completed'
            await tx.job_cards.update({
                where: { id: job_card_id },
                data: { status: 'completed' }
            });

            // Handle Job History/Events
            await tx.job_events.create({
                data: {
                    job_card_id: job_card_id,
                    event_type: 'invoice_generated',
                    description: `Invoice ${invNumber} generated for Tk ${grand_total.toFixed(2)}`,
                    actor_id: user.userId,
                    metadata: { invoice_id: inv.id, amount: grand_total }
                }
            });

            return inv;
        });

        return NextResponse.json({ success: true, data: serialize(invoice) });

    } catch (error: any) {
        console.error("Invoice creation error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
