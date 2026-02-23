import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getCurrentTechnician } from '@/lib/auth/get-technician';

type Params = Promise<{ id: string }>;

export async function GET(req: NextRequest, { params }: { params: Params }) {
    try {
        const technician = await getCurrentTechnician();
        if (!technician || !technician.serviceStaffId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const parts = await prisma.parts_usage.findMany({
            where: {
                job_card_id: id,
            },
            include: {
                part_variants: {
                    include: {
                        parts: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc',
            },
        });

        return NextResponse.json({ data: parts });
    } catch (error: any) {
        console.error('Error fetching part usage:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: Params }) {
    try {
        const technician = await getCurrentTechnician();
        if (!technician || !technician.serviceStaffId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { variantId, quantity, unitPrice } = body;

        if (!variantId || !quantity) {
            return NextResponse.json({ error: 'VariantId and quantity required' }, { status: 400 });
        }

        // Verify job exists and belongs to technician
        const job = await prisma.job_cards.findFirst({
            where: {
                id: id,
                technician_id: technician.serviceStaffId
            },
        });

        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        // Insert into parts_usage
        // Note: This assumes auto-deduction from inventory happens via triggers OR is not handled here.
        // Ideally we should check stock.

        // Check stock
        const variant = await prisma.part_variants.findUnique({
            where: { id: variantId },
            include: { parts: true }
        });

        if (!variant) return NextResponse.json({ error: 'Part variant not found' }, { status: 404 });

        // Explicit stock check
        if (!variant.stock_quantity || variant.stock_quantity < quantity) {
            return NextResponse.json({
                error: 'Insufficient stock',
                available: variant.stock_quantity || 0
            }, { status: 400 });
        }

        const price = unitPrice || variant.price;

        const usage = await prisma.parts_usage.create({
            data: {
                job_card_id: id,
                variant_id: variantId,
                quantity: quantity,
                unit_price: price, // Decimal
                total_price: Number(price) * quantity
            },
        });

        return NextResponse.json({ success: true, usage });
    } catch (error: any) {
        console.error('Error adding part usage:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
