import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/get-user";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user || (user.role !== "dealer_owner" && user.role !== "admin" && user.role !== "service_admin")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const dealerId = user.dealerId;
        if (!dealerId) {
            return NextResponse.json({ error: "Dealer context required" }, { status: 400 });
        }

        const { id } = await params;
        const body = await request.json();

        // If approving...
        if (body.status === "approved") {
            // Find staff first
            const staff = await prisma.service_staff.findUnique({
                where: { id }
            });

            if (!staff) {
                return NextResponse.json({ error: "Staff not found" }, { status: 404 });
            }

            // Update in transaction to make sure staff and profile are updated together
            const result = await prisma.$transaction(async (tx: any) => {
                const updatedStaff = await tx.service_staff.update({
                    where: { id },
                    data: {
                        status: "approved",
                        dealer_id: dealerId
                    }
                });

                if (updatedStaff.profile_id) {
                    await tx.profiles.update({
                        where: { id: updatedStaff.profile_id },
                        data: {
                            status: "active",
                            dealer_id: dealerId
                        }
                    });
                }

                return updatedStaff;
            });

            return NextResponse.json({ success: true, data: result });
        }

        // Just regular update
        const updated = await prisma.service_staff.update({
            where: { id },
            data: body
        });

        return NextResponse.json({ success: true, data: updated });
    } catch (error: any) {
        console.error("[STAFF_PATCH_ERROR]", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user || (user.role !== "dealer_owner" && user.role !== "admin" && user.role !== "service_admin")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const updated = await prisma.service_staff.update({
            where: { id },
            data: { is_active: false }
        });

        return NextResponse.json({ success: true, data: updated });
    } catch (error: any) {
        console.error("[STAFF_DELETE_ERROR]", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
