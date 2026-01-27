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
    const { data: session } = await betterFetch<SessionResponse>(
        "/api/auth/get-session",
        {
            baseURL: request.nextUrl.origin,
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
