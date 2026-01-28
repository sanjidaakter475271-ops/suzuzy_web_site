import { NextResponse, type NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";

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

        if (role === "super_admin") return NextResponse.redirect(new URL("/super-admin/dashboard", request.url));

        // Showroom roles
        if (["showroom_admin", "sell_showroom_admin", "sells_stuff"].includes(role)) {
            return NextResponse.redirect(new URL("/admin/showroom/dashboard", request.url));
        }

        // Service Center roles
        if (["service_admin", "sell_service_admin", "service_stuff"].includes(role)) {
            return NextResponse.redirect(new URL("/admin/service/dashboard", request.url));
        }

        // General Admin / Support roles
        if (["support", "accountant", "admin"].includes(role)) {
            return NextResponse.redirect(new URL("/admin/dashboard", request.url));
        }

        // Dealer roles
        if (["dealer_owner", "dealer_manager", "dealer_staff", "sub_dealer", "dealer"].includes(role)) {
            return NextResponse.redirect(new URL("/dealer/dashboard", request.url));
        }

        if (role.includes("sales_admin")) return NextResponse.redirect(new URL("/sales-admin/dashboard", request.url));

        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

