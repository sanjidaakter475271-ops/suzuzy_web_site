import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getCurrentTechnician } from '@/lib/auth/get-technician';
import { broadcastEvent } from "@/lib/socket-server";
import crypto from "crypto";

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

/**
 * GET: Fetch technician's requisitions, grouped by requisition_group_id
 */
export async function GET(_req: NextRequest) {
    try {
        const technician = await getCurrentTechnician();
        if (!technician || !technician.serviceStaffId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const requisitions = await prisma.service_requisitions.findMany({
            where: {
                staff_id: technician.serviceStaffId
            },
            include: {
                products: true,
                job_cards: {
                    include: {
                        service_tickets: {
                            include: {
                                service_vehicles: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        const grouped = Object.values(
            requisitions.reduce((acc: any, item) => {
                const gid = item.requisition_group_id || item.id;
                if (!acc[gid]) {
                    acc[gid] = {
                        id: gid,
                        job_card_id: item.job_card_id,
                        status: item.status,
                        created_at: item.created_at,
                        job_cards: item.job_cards,
                        items: []
                    };
                }
                acc[gid].items.push({
                    id: item.id,
                    product_id: item.product_id,
                    quantity: item.quantity,
                    unit_price: Number(item.unit_price || 0),
                    total_price: Number(item.total_price || 0),
                    status: item.status,
                    notes: item.notes,
                    part_name: item.products?.name || 'Unknown Part',
                    sku: item.products?.sku || '',
                    brand: item.products?.brand || ''
                });

                if (item.status === 'rejected') acc[gid].status = 'rejected';
                else if (item.status === 'pending' && acc[gid].status !== 'rejected') acc[gid].status = 'pending';
                return acc;
            }, {})
        );

        return NextResponse.json({ success: true, data: serialize(grouped) });
    } catch (error: unknown) {
        console.error('Error fetching technician requisitions:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * POST: Create new requisition(s) for a job card
 */
export async function POST(req: NextRequest) {
    try {
        const technician = await getCurrentTechnician();
        if (!technician || !technician.serviceStaffId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { jobId, items } = body;

        if (!jobId || !items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ success: false, error: 'JobId and items array required' }, { status: 400 });
        }

        const job = await prisma.job_cards.findUnique({
            where: { id: jobId },
            include: {
                service_tickets: true
            }
        });

        if (!job || job.dealer_id !== technician.dealerId) {
            return NextResponse.json({ success: false, error: 'Job card not found or access denied' }, { status: 404 });
        }

        const jobNo = job.service_tickets?.service_number || "N/A";
        const group_id = crypto.randomUUID();

        const created = await prisma.$transaction(async (tx) => {
            const results = [];
            for (const item of items) {
                const productId = item.productId || item.variantId;
                const product = await tx.products.findUnique({
                    where: { id: productId },
                    select: { id: true, base_price: true, sale_price: true, dealer_id: true }
                });

                if (!product) throw new Error(`Product ${productId} not found`);
                if (product.dealer_id && product.dealer_id !== technician.dealerId) {
                    throw new Error(`Unauthorized: Product belongs to another dealer`);
                }

                const price = Number(product.sale_price || product.base_price || 0);

                const reqRecord = await tx.service_requisitions.create({
                    data: {
                        job_card_id: jobId,
                        ticket_id: job.ticket_id,
                        staff_id: technician.serviceStaffId,
                        product_id: product.id,
                        quantity: item.quantity || 1,
                        unit_price: price,
                        total_price: price * (item.quantity || 1),
                        notes: item.notes || "",
                        status: 'pending',
                        requisition_group_id: group_id
                    }
                });
                results.push(reqRecord);
            }
            return results;
        });

        await broadcastEvent('requisition:created', {
            groupId: group_id,
            jobId: jobId,
            jobNo: jobNo,
            technicianId: technician.serviceStaffId,
            dealerId: technician.dealerId,
            itemCount: created.length
        });

        return NextResponse.json({ success: true, data: serialize(created) });
    } catch (error: unknown) {
        console.error('Error creating requisitions:', error);
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
