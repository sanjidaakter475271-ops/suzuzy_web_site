import { NextRequest, NextResponse } from "next/server";
import { refreshTokens } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
    try {
        const refreshToken = req.cookies.get("refresh_token")?.value;

        if (!refreshToken) {
            return NextResponse.json({ error: "No refresh token" }, { status: 401 });
        }

        const result = await refreshTokens(refreshToken);

        const response = NextResponse.json({ success: true });

        // Set new tokens
        response.cookies.set("access_token", result.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 900,
            path: "/",
        });
        response.cookies.set("refresh_token", result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 3 * 24 * 60 * 60,
            path: "/",
        });

        return response;

    } catch (error) {
        console.error("Refresh error:", error);
        const response = NextResponse.json({ error: "Invalid or expired session" }, { status: 401 });

        // Clear corrupted cookies
        response.cookies.delete("access_token");
        response.cookies.delete("refresh_token");

        return response;
    }
}
