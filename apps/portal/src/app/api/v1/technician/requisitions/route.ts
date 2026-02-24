import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getCurrentTechnician } from '@/lib/auth/get-technician';
import { broadcast } from "@/lib/socket-server";
import crypto from "crypto";

/**
 * GET: Fetch technician's requisitions, grouped by requisition_group_id
 * Returns shape: { id, job_card_id, status, created_at, items: [{ ...req, part_name }] }
 */
export async function GET(req: NextRequest) {
    try {
        const technician = await getCurrentTechnician();
        if (!technician || !technician.serviceStaffId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

        // Group by requisition_group_id for frontend consumption
        const grouped = Object.values(
            requisitions.reduce((acc: Record<string, any>, req) => {
                const gid = req.requisition_group_id || req.id;
                if (!acc[gid]) {
                    acc[gid] = {
                        id: gid,
                        job_card_id: req.job_card_id,
                        status: req.status,
                        created_at: req.created_at,
                        job_cards: req.job_cards,
                        items: []
                    };
                }
                acc[gid].items.push({
                    id: req.id,
                    product_id: req.product_id,
                    quantity: req.quantity,
                    unit_price: Number(req.unit_price || 0),
                    total_price: Number(req.total_price || 0),
                    status: req.status,
                    notes: req.notes,
                    part_name: req.products?.name || 'Unknown Part',
                    sku: req.products?.sku || '',
                    brand: req.products?.brand || ''
                });
                // Update group status to worst status
                if (req.status === 'rejected') acc[gid].status = 'rejected';
                else if (req.status === 'pending' && acc[gid].status !== 'rejected') acc[gid].status = 'pending';
                return acc;
            }, {})
        );

        return NextResponse.json({ success: true, data: grouped });
    } catch (error: any) {
        console.error('Error fetching technician requisitions:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * POST: Create new requisition(s) for a job card
 */
export async function POST(req: NextRequest) {
    try {
        const technician = await getCurrentTechnician();
        if (!technician || !technician.serviceStaffId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { jobId, items } = body;

        if (!jobId || !items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: 'JobId and items array required' }, { status: 400 });
        }

        // Fetch job details for context
        const job = await prisma.job_cards.findUnique({
            where: { id: jobId },
            select: {
                ticket_id: true,
                service_tickets: {
                    select: { service_number: true }
                }
            }
        });

        if (!job) return NextResponse.json({ error: 'Job card not found' }, { status: 404 });

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

        // Notify via Real-time
        await broadcast('requisition:created', {
            groupId: group_id,
            jobId: jobId,
            jobNo: jobNo,
            technicianId: technician.serviceStaffId,
            dealerId: technician.dealerId,
            itemCount: created.length
        });

        return NextResponse.json({ success: true, data: created });
    } catch (error: any) {
        console.error('Error creating requisitions:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
