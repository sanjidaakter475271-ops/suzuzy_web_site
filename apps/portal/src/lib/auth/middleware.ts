import { NextRequest, NextResponse } from "next/server";
import { verifyToken, generateAccessToken } from "./jwt";
import { refreshTokens } from "./session";

/**
 * Main Auth Middleware for route protection
 */
export async function authMiddleware(request: NextRequest) {
    const accessToken = request.cookies.get("access_token")?.value;
    const refreshToken = request.cookies.get("refresh_token")?.value;

    const { pathname } = request.nextUrl;

    // 1. Define public routes
    const isPublicRoute =
        pathname === "/login" ||
        pathname === "/register" ||
        pathname.startsWith("/api/auth") ||
        pathname === "/";

    // 2. If no access token but has refresh token, try to refresh
    if (!accessToken && refreshToken) {
        try {
            const result = await refreshTokens(refreshToken);
            const response = NextResponse.next();

            // Set new tokens in cookies
            response.cookies.set("access_token", result.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 900, // 15m
            });
            response.cookies.set("refresh_token", result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 3 * 24 * 60 * 60, // 3 days
            });

            return response;
        } catch (error) {
            // Refresh failed, redirect to login if not public
            if (!isPublicRoute) {
                return NextResponse.redirect(new URL("/login", request.url));
            }
        }
    }

    // 3. Verify access token
    if (accessToken) {
        const payload = await verifyToken(accessToken);
        if (payload) {
            // Logged in. If on login page, redirect to dashboard
            if (pathname === "/login") {
                return NextResponse.redirect(new URL("/dashboard", request.url));
            }
            return NextResponse.next();
        }
    }

    // 4. Not logged in and on protected route
    if (!isPublicRoute) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}
