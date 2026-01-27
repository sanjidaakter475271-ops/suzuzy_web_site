import { NextResponse } from "next/server";

export enum AppErrorCode {
    UNAUTHORIZED = "UNAUTHORIZED",
    FORBIDDEN = "FORBIDDEN",
    NOT_FOUND = "NOT_FOUND",
    BAD_REQUEST = "BAD_REQUEST",
    RATE_LIMITED = "RATE_LIMITED",
    INTERNAL_ERROR = "INTERNAL_ERROR",
}

// Prisma error type
interface PrismaError {
    code?: string;
    message?: string;
}

/**
 * apiError: Standardized API error response helper
 */
export function apiError(code: AppErrorCode, message: string, status: number = 400) {
    return NextResponse.json(
        {
            success: false,
            error: {
                code,
                message,
            },
        },
        { status }
    );
}

/**
 * handlePrismaError: Maps Prisma exceptions to user-friendly messages
 */
export function handlePrismaError(error: PrismaError) {
    console.error("Prisma Error:", error);
    if (error.code === "P2002") {
        return apiError(AppErrorCode.BAD_REQUEST, "A record with this unique value already exists", 409);
    }
    if (error.code === "P2025") {
        return apiError(AppErrorCode.NOT_FOUND, "Record not found", 404);
    }
    return apiError(AppErrorCode.INTERNAL_ERROR, "A database error occurred", 500);
}
