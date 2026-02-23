import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revokeSessionByToken } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
    const refreshToken = (await cookies()).get("refresh_token")?.value;

    if (refreshToken) {
        await revokeSessionByToken(refreshToken);
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");

    return response;
}
