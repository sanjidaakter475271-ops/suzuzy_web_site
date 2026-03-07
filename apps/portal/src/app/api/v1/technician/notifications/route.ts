import { NextRequest, NextResponse } from "next/server";
import { getCurrentTechnician } from "@/lib/auth/get-technician";
import { prisma } from "@/lib/prisma/client";

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentTechnician();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const profile = await prisma.profiles.findUnique({
            where: { id: user.userId },
            include: { roles: true }
        });

        if (!profile) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const notifications = await prisma.notifications.findMany({
            where: { user_id: profile.id },
            orderBy: { created_at: 'desc' },
            take: 50
        });

        return NextResponse.json({
            success: true,
            data: notifications
        });
    } catch (error: any) {
        console.error("[NOTIFICATIONS_GET_ERROR]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const user = await getCurrentTechnician();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id, is_read } = await request.json();

        if (id) {
            // Mark specific as read
            await prisma.notifications.update({
                where: { id },
                data: { is_read: is_read ?? true }
            });
        } else {
            // Mark all as read
            await prisma.notifications.updateMany({
                where: { user_id: user.userId },
                data: { is_read: true }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[NOTIFICATIONS_PATCH_ERROR]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const user = await getCurrentTechnician();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await request.json();

        if (id) {
            await prisma.notifications.delete({
                where: { id }
            });
        } else {
            await prisma.notifications.deleteMany({
                where: { user_id: user.userId }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[NOTIFICATIONS_DELETE_ERROR]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
