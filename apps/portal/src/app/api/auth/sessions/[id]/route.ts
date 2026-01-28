import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma/client";

export async function DELETE(
    req: NextRequest,
    { params }: any
) {
    const { id: sessionId } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = await prisma.user_sessions.findUnique({
        where: { id: sessionId }
    });

    if (!session || session.user_id !== user.userId) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    await prisma.user_sessions.update({
        where: { id: sessionId },
        data: { is_active: false }
    });

    return NextResponse.json({ success: true });
}
