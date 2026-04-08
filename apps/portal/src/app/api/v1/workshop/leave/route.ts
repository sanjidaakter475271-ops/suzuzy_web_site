import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma/client";
import { z } from "zod";

const updateStatusSchema = z.object({
    id: z.string(),
    status: z.enum(["approved", "rejected"]),
});

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || !user.dealerId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const leaveRequests = await prisma.leave_requests.findMany({
            where: {
                dealer_id: user.dealerId
            },
            include: {
                service_staff: {
                    include: {
                        profiles: {
                            select: {
                                full_name: true,
                                email: true,
                                avatar_url: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        // Flatten the data for the frontend
        const formattedRequests = leaveRequests.map(req => ({
            id: req.id,
            staffId: req.staff_id,
            technicianName: req.service_staff.profiles?.full_name || "Unknown",
            technicianEmail: req.service_staff.profiles?.email || "",
            technicianAvatar: req.service_staff.profiles?.avatar_url || "",
            leaveType: req.leave_type,
            startDate: req.start_date,
            endDate: req.end_date,
            reason: req.reason,
            status: req.status,
            createdAt: req.created_at,
            hometown: req.hometown,
            emergencyPhone: req.emergency_phone
        }));

        return NextResponse.json({
            success: true,
            data: formattedRequests
        });
    } catch (error: any) {
        console.error("[ADMIN_LEAVE_GET_ERROR]", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || !user.dealerId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const parsed = updateStatusSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
        }

        const { id, status } = parsed.data;

        // Verify the leave request belongs to the dealer
        const existing = await prisma.leave_requests.findFirst({
            where: {
                id,
                dealer_id: user.dealerId
            }
        });

        if (!existing) {
            return NextResponse.json({ success: false, error: "Leave request not found" }, { status: 404 });
        }

        const updated = await prisma.leave_requests.update({
            where: { id },
            data: {
                status,
                approved_by: user.userId,
                approved_at: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            data: updated
        });
    } catch (error: any) {
        console.error("[ADMIN_LEAVE_PATCH_ERROR]", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
