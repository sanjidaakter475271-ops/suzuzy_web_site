import { NextResponse, type NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { PORTAL_CONFIG } from "@/lib/auth-config";

export default async function authMiddleware(request: NextRequest) {
    const token = request.cookies.get("access_token")?.value;
    const payload = token ? await verifyToken(token) : null;

    const isAuthRoute = request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/register");
    const isDashboardRoute =
        request.nextUrl.pathname.startsWith("/admin") ||
        request.nextUrl.pathname.startsWith("/super-admin") ||
        request.nextUrl.pathname.startsWith("/service-admin") ||
        request.nextUrl.pathname.startsWith("/dealer") ||
        request.nextUrl.pathname.startsWith("/showroom-admin") ||
        request.nextUrl.pathname.startsWith("/customer");

    if (!payload && isDashboardRoute) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (payload && isAuthRoute) {
        const role = (payload.role as string) || "customer";

        if (PORTAL_CONFIG.SUPER_ADMIN.homeRoles.includes(role as any))
            return NextResponse.redirect(new URL("/super-admin/dashboard", request.url));

        if (PORTAL_CONFIG.ADMIN.homeRoles.includes(role as any))
            return NextResponse.redirect(new URL("/admin/dashboard", request.url));

        if (PORTAL_CONFIG.SHOWROOM.homeRoles.includes(role as any))
            return NextResponse.redirect(new URL("/showroom-admin/dashboard", request.url));

        if (PORTAL_CONFIG.SERVICE_ADMIN.homeRoles.includes(role as any))
            return NextResponse.redirect(new URL("/service-admin/dashboard", request.url));

        if (PORTAL_CONFIG.DEALER.homeRoles.includes(role as any))
            return NextResponse.redirect(new URL("/dealer/dashboard", request.url));

        if (PORTAL_CONFIG.CLIENTS.homeRoles.includes(role as any))
            return NextResponse.redirect(new URL("/customer/dashboard", request.url));

        return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

