import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma/client";

export async function GET(req: NextRequest) {
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessions = await prisma.user_sessions.findMany({
        where: { user_id: user.userId, is_active: true },
        orderBy: { last_active: "desc" },
        select: {
            id: true,
            device_name: true,
            ip_address: true,
            last_active: true,
            created_at: true,
            login_method: true
        }
    });

    return NextResponse.json({ sessions });
}
