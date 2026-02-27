import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/get-user";
import { broadcast } from "@/lib/socket-server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getCurrentUser();
        // Permission check
        if (!user || !['service_admin', 'super_admin'].includes(user.role as string)) {
            return NextResponse.json({ error: "Access denied. Admin only." }, { status: 403 });
        }

        const dealerId = user.dealerId;
        if (!dealerId) return NextResponse.json({ error: "Dealer context required" }, { status: 400 });

        const { id: claimId } = await params;
        const body = await req.json();
        const { status, approvedAmount, notes } = body;

        if (!['approved', 'rejected', 'partially_approved'].includes(status)) {
            return NextResponse.json({ error: "Invalid settlement status" }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            const claim = await tx.warranty_claims.findUnique({
                where: { id: claimId }
            });

            if (!claim) throw new Error("Warranty claim not found");
            if (claim.dealer_id !== dealerId) throw new Error("Unauthorized");
            if (['approved', 'rejected', 'partially_approved'].includes(claim.status)) {
                throw new Error(`Claim is already settled with status: ${claim.status}`);
            }

            const updatedClaim = await tx.warranty_claims.update({
                where: { id: claimId },
                data: {
                    status,
                    approved_amount: approvedAmount,
                    notes: notes ? `${claim.notes || ''}\nSettlement Notes: ${notes}` : claim.notes,
                    updated_at: new Date()
                }
            });

            return updatedClaim;
        });

        await broadcast('warranty:settled', {
            claimId: result.id,
            claimNumber: result.claim_number,
            status: result.status,
            dealerId: user.dealerId
        });

        return NextResponse.json({ success: true, data: result });

    } catch (error: any) {
        console.error("Warranty settlement error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
