import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";

// Extended session user type matching Better Auth config
interface SessionUser {
    id: string;
    email: string;
    name?: string | null;
    role?: string;
    roleId?: string;
    dealerId?: string | null;
}

export interface AuthenticatedRequest extends NextRequest {
    user?: {
        id: string;
        email: string;
        role: string;
        roleId?: string;
        dealerId?: string | null;
    };
}

/**
 * Auth Middleware: Validates Better Auth session and attaches user metadata
 */
export async function authMiddleware(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: request.headers,
    });

    if (!session) {
        return {
            authenticated: false,
            user: null,
            response: NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            ),
        };
    }

    const user = session.user as SessionUser;

    return {
        authenticated: true,
        user: {
            id: user.id,
            email: user.email,
            role: user.role || "customer",
            roleId: user.roleId,
            dealerId: user.dealerId,
        },
        response: null,
    };
}
