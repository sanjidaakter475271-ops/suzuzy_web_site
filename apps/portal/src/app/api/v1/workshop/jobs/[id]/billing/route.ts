import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/get-user";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id: jobId } = await params;

        // Fetch job details with approved requisitions
        const job = await prisma.job_cards.findUnique({
            where: { id: jobId },
            include: {
                service_tickets: {
                    include: {
                        profiles: {
                            select: { full_name: true, phone: true }
                        },
                        service_vehicles: {
                            include: {
                                bike_models: {
                                    select: { name: true }
                                }
                            }
                        }
                    }
                },
                service_requisitions: {
                    where: { status: 'approved' },
                    include: {
                        products: true
                    }
                }
            }
        });

        if (!job) return NextResponse.json({ error: "Job card not found" }, { status: 404 });

        // Format data for POS billing
        const billingData = {
            jobId: job.id,
            jobNumber: job.service_tickets?.service_number || 'N/A',
            customerName: job.service_tickets?.profiles?.full_name || 'Unknown Customer',
            customerPhone: job.service_tickets?.profiles?.phone || '',
            vehicle: job.service_tickets?.service_vehicles?.bike_models?.name || 'Unknown Vehicle',
            plateNumber: job.service_tickets?.service_vehicles?.engine_number || '',
            items: job.service_requisitions.map(req => ({
                id: req.id,
                productId: req.product_id,
                requisitionId: req.id, // Track requisition ID for possible removal/revert
                description: req.products?.name || 'Unknown Item',
                qty: req.quantity,
                cost: Number(req.unit_price || 0),
                total: Number(req.total_price || 0)
            })),
            subtotal: job.service_requisitions.reduce((sum, req) => sum + Number(req.total_price || 0), 0),
            status: job.status
        };

        return NextResponse.json({ success: true, data: billingData });

    } catch (error: any) {
        console.error("Billing fetch error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
