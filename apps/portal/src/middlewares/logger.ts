import { prisma } from "@/lib/prisma/client";

export enum AuditAction {
    LOGIN = "LOGIN",
    LOGOUT = "LOGOUT",
    CREATE = "CREATE",
    UPDATE = "UPDATE",
    DELETE = "DELETE",
    VIEW = "VIEW",
}

interface LogEntry {
    userId: string;
    action: AuditAction;
    module: string;
    entityId?: string;
    oldData?: Record<string, unknown>;
    newData?: Record<string, unknown>;
    ipAddress?: string;
}

/**
 * logActivity: Records high-level actions in the audit_logs table
 */
export async function logActivity(entry: LogEntry) {
    try {
        await prisma.audit_logs.create({
            data: {
                user_id: entry.userId,
                action: entry.action,
                module: entry.module,
                entity_id: entry.entityId,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                old_data: entry.oldData as any,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                new_data: entry.newData as any,
                ip_address: entry.ipAddress,
            },
        });
    } catch (error) {
        console.error("Failed to log activity:", error);
        // We don't throw here to avoid failing the main request just because logging failed
    }
}
