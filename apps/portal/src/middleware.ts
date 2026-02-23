import { NextResponse, type NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { ROLES, ROLE_GROUPS } from "@/lib/auth/roles";

export default async function authMiddleware(request: NextRequest) {
    const token = request.cookies.get("access_token")?.value;
    const payload = token ? await verifyToken(token) : null;

    const isAuthRoute = request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/register");
    const isDashboardRoute = request.nextUrl.pathname.startsWith("/admin") ||
        request.nextUrl.pathname.startsWith("/super-admin") ||
        request.nextUrl.pathname.startsWith("/dealer") ||
        request.nextUrl.pathname.startsWith("/sales-admin");

    if (!payload && isDashboardRoute) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (payload && isAuthRoute) {
        const role = payload.role || "customer";

        if (role === ROLES.SUPER_ADMIN) return NextResponse.redirect(new URL("/super-admin/dashboard", request.url));

        // Showroom roles
        if (ROLE_GROUPS.SHOWROOM.includes(role)) {
            return NextResponse.redirect(new URL("/admin/showroom/dashboard", request.url));
        }

        // Service Center roles
        if (ROLE_GROUPS.SERVICE.includes(role)) {
            return NextResponse.redirect(new URL("/admin/service/dashboard", request.url));
        }

        // General Admin / Support roles
        if (ROLE_GROUPS.GENERAL_ADMIN.includes(role)) {
            return NextResponse.redirect(new URL("/admin/dashboard", request.url));
        }

        // Dealer roles
        if (ROLE_GROUPS.DEALER.includes(role) || role.includes('dealer') || role === 'sub_dealer') {
            return NextResponse.redirect(new URL("/dealer/dashboard", request.url));
        }

        if (role.includes(ROLES.SALES_ADMIN)) return NextResponse.redirect(new URL("/sales-admin/dashboard", request.url));

        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

