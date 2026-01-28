import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma/client";

export async function POST(req: NextRequest) {
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Revoke all sessions and refresh tokens
    await prisma.$transaction([
        (prisma as any).user_sessions.updateMany({
            where: { user_id: user.userId },
            data: { is_active: false }
        }),
        (prisma as any).refresh_tokens_public.updateMany({
            where: { user_id: user.userId },
            data: {
                is_revoked: true,
                revoked_at: new Date(),
                revoked_reason: "logout_all"
            }
        })
    ]);

    const response = NextResponse.json({ success: true });
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");

    return response;
}
