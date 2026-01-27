import { betterFetch } from "@better-fetch/fetch";
import { NextResponse, type NextRequest } from "next/server";
import { type Session } from "better-auth/types";

// Extended session response type
interface SessionResponse {
    user?: {
        id: string;
        email: string;
        name?: string | null;
        role?: string;
    };
    session?: Session;
}

export default async function authMiddleware(request: NextRequest) {
    // In production (Docker), we want to call the local server via HTTP to avoid SSL issues
    // because the container runs on HTTP but likely receives HTTPS headers from Render's proxy.
    // This mismatch causes ERR_SSL_WRONG_VERSION_NUMBER when fetching "https://..." internally.
    const baseURL = process.env.NODE_ENV === "production"
        ? `http://localhost:${process.env.PORT || 3000}`
        : request.nextUrl.origin;

    const { data: session } = await betterFetch<SessionResponse>(
        "/api/auth/get-session",
        {
            baseURL,
            headers: {
                cookie: request.headers.get("cookie") || "",
            },
        },
    );

    const isAuthRoute = request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/register");
    const isDashboardRoute = request.nextUrl.pathname.startsWith("/admin") ||
        request.nextUrl.pathname.startsWith("/super-admin") ||
        request.nextUrl.pathname.startsWith("/dealer") ||
        request.nextUrl.pathname.startsWith("/sales-admin");

    if (!session && isDashboardRoute) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (session && isAuthRoute) {
        const user = session.user;
        const role = user?.role || "customer";

        if (role === "super_admin") return NextResponse.redirect(new URL("/super-admin/dashboard", request.url));
        if (["showroom_admin", "service_admin", "support", "accountant"].includes(role)) return NextResponse.redirect(new URL("/admin/dashboard", request.url));
        if (["dealer_owner", "dealer_manager", "dealer_staff", "sub_dealer"].includes(role)) return NextResponse.redirect(new URL("/dealer/dashboard", request.url));
        if (role.includes("sales_admin")) return NextResponse.redirect(new URL("/sales-admin/dashboard", request.url));

        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
