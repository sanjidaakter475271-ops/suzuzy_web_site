import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma/client";

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const notifications = await prisma.notifications.findMany({
            where: { user_id: user.userId },
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
        const user = await getCurrentUser();
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
        const user = await getCurrentUser();
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
