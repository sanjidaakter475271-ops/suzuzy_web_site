import { NextRequest, NextResponse } from "next/server";
import { getCurrentTechnician } from "@/lib/auth/get-technician";
import { prisma } from "@/lib/prisma/client";
import { z } from "zod";

const leaveSchema = z.object({
    leaveType: z.enum(["Casual Leave", "Sick Leave"]),
    startDate: z.string(),
    endDate: z.string(),
    reason: z.string(),
    hometown: z.string().optional(),
    phoneNumber: z.string().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const technician = await getCurrentTechnician();
        if (!technician || !technician.serviceStaffId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const parsed = leaveSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ success: false, error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
        }

        const { leaveType, startDate, endDate, reason, hometown, phoneNumber } = parsed.data;

        const leaveRequest = await prisma.leave_requests.create({
            data: {
                staff_id: technician.serviceStaffId,
                dealer_id: technician.dealerId!,
                leave_type: leaveType,
                start_date: new Date(startDate),
                end_date: new Date(endDate),
                reason: reason,
                hometown: hometown,
                emergency_phone: phoneNumber,
                status: "pending",
            },
        });

        return NextResponse.json({
            success: true,
            data: leaveRequest,
        });
    } catch (error: any) {
        console.error("[LEAVE_REQUEST_ERROR]", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const technician = await getCurrentTechnician();
        if (!technician || !technician.serviceStaffId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const requests = await prisma.leave_requests.findMany({
            where: {
                staff_id: technician.serviceStaffId
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        return NextResponse.json({
            success: true,
            data: requests
        });
    } catch (error: any) {
        console.error("[LEAVE_GET_ERROR]", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
