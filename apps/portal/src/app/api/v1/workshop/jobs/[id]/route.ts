import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma/client";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user || !user.dealerId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

        // Authorize job belongs to dealer
        const job = await prisma.job_cards.findUnique({
            where: { id },
            select: { dealer_id: true }
        });

        if (!job || (job.dealer_id !== user.dealerId && user.role !== 'super_admin')) {
            return NextResponse.json({ error: "Job card not found or forbidden" }, { status: 404 });
        }

        const updatedJob = await prisma.job_cards.update({
            where: { id },
            data: {
                ...(body.status && { status: body.status }),
                ...(body.technician_id && { technician_id: body.technician_id }),
                ...(body.notes && { notes: body.notes })
            }
        });

        return NextResponse.json({ success: true, data: updatedJob });
    } catch (error: any) {
        console.error("[JOB_CARD_PATCH_ERROR]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user || !['service_admin', 'super_admin'].includes(user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Authorize job belongs to dealer
        const job = await prisma.job_cards.findUnique({
            where: { id },
            select: { dealer_id: true }
        });

        if (!job || (job.dealer_id !== user.dealerId && user.role !== 'super_admin')) {
            return NextResponse.json({ error: "Job card not found or forbidden" }, { status: 404 });
        }

        await prisma.job_cards.delete({
            where: { id }
        });

        return NextResponse.json({ success: true, message: "Job card deleted" });
    } catch (error: any) {
        console.error("[JOB_CARD_DELETE_ERROR]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
