import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/get-user";
import { getCurrentTechnician } from "@/lib/auth/get-technician";
import { broadcastEvent } from "@/lib/socket-server";
import crypto from "crypto";

// Local recursive Decimal-to-Number serializer
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
 * Handle Requisitions - Unified endpoint for both Technician and Admin
 */

// GET: Fetch requisitions
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const user = await getCurrentUser();
        const tech = await getCurrentTechnician();

        if (!user && !tech) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const dealerId = user?.dealerId || tech?.dealerId;
        if (!dealerId) {
            return NextResponse.json({ success: false, error: "Dealer context required" }, { status: 400 });
        }

        const isServiceAdmin = user?.role === 'service_admin' || user?.role === 'super_admin';
        const technicianId = tech?.serviceStaffId;

        // Build where clause
        const where: any = {};

        // Enforce Dealer Scoping
        where.job_cards = {
            dealer_id: dealerId
        };

        if (!isServiceAdmin) {
            if (!technicianId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
            where.staff_id = technicianId;
        } else {
            // Admin filters
            const status = searchParams.get('status');
            const jobId = searchParams.get('jobId');
            if (status) where.status = status;
            if (jobId) where.job_card_id = jobId;
        }

        const requisitions = await prisma.service_requisitions.findMany({
            where,
            include: {
                products: true,
                job_cards: {
                    select: {
                        id: true,
                        service_tickets: {
                            select: { service_number: true }
                        }
                    }
                },
                service_staff: {
                    include: { profiles: true }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        return NextResponse.json({ success: true, data: serialize(requisitions) });

    } catch (error: any) {
        console.error("Requisition fetch error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST: Create Requisition (Unified Batch Creation)
export async function POST(req: NextRequest) {
    try {
        const tech = await getCurrentTechnician();
        if (!tech || !tech.serviceStaffId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { jobId, items } = body; // items: Array<{productId, quantity, notes}>

        if (!jobId || !items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ success: false, error: "Invalid data" }, { status: 400 });
        }

        // Fetch ticket_id and job number
        const job = await prisma.job_cards.findUnique({
            where: { id: jobId },
            select: {
                ticket_id: true,
                dealer_id: true,
                service_tickets: {
                    select: { service_number: true }
                }
            }
        });

        if (!job) return NextResponse.json({ success: false, error: "Job card not found" }, { status: 404 });

        // Scoping check
        if (job.dealer_id !== tech.dealerId) {
            return NextResponse.json({ success: false, error: "Forbidden: Job card belongs to another dealer" }, { status: 403 });
        }

        const jobNo = job.service_tickets?.service_number || "N/A";
        const requisitionGroupId = crypto.randomUUID();

        // Use transaction for batch creation
        const createdItems = await prisma.$transaction(async (tx) => {
            const results = [];
            for (const item of items) {
                // Fetch product price (scoped by dealer)
                const product = await tx.products.findFirst({
                    where: {
                        id: item.productId,
                        dealer_id: tech.dealerId
                    },
                    select: { base_price: true, sale_price: true }
                });

                if (!product) throw new Error(`Product ${item.productId} not found or access denied`);

                const price = product?.sale_price || product?.base_price || 0;

                const reqObj = await tx.service_requisitions.create({
                    data: {
                        job_card_id: jobId,
                        ticket_id: job.ticket_id,
                        staff_id: tech.serviceStaffId,
                        product_id: item.productId,
                        quantity: item.quantity || 1,
                        unit_price: price,
                        total_price: Number(price) * (item.quantity || 1),
                        notes: item.notes || "",
                        requisition_group_id: requisitionGroupId,
                        status: 'pending'
                    }
                });
                results.push(reqObj);
            }
            return results;
        });

        // Notify Admins
        await broadcastEvent('requisition:created', {
            groupId: requisitionGroupId,
            requisitionGroupId: requisitionGroupId,
            jobId: jobId,
            jobNo: jobNo,
            technicianId: tech.serviceStaffId,
            itemCount: items.length,
            dealerId: tech.dealerId
        });

        return NextResponse.json({
            success: true,
            data: { groupId: requisitionGroupId, count: createdItems.length }
        });

    } catch (error: any) {
        console.error("Requisition creation error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
