import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";

// Extended session user type
interface SessionUser {
    id: string;
    email: string;
    role: string;
    dealerId?: string | null;
}

export interface AuthenticatedRequest extends NextRequest {
    user?: SessionUser;
}

/**
 * Auth Middleware: Validates custom JWT and attaches user metadata
 */
export async function authMiddleware(request: NextRequest) {
    const token = request.cookies.get("access_token")?.value;
    const payload = token ? await verifyToken(token) : null;

    if (!payload) {
        return {
            authenticated: false,
            user: null,
            response: NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            ),
        };
    }

    return {
        authenticated: true,
        user: {
            id: payload.userId,
            email: payload.email,
            role: payload.role || "customer",
            dealerId: payload.dealerId,
        },
        response: null,
    };
}
