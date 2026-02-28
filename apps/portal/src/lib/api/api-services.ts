import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/get-user";
import { ENTITY_REGISTRY, EntityOperation, EntityConfig } from "./entity-registry";
import { ROLES } from "@/lib/auth/roles";
import crypto from "crypto";
import { broadcast } from "@/lib/socket-server";
import { getDashboardStats } from "./handlers/dashboard-stats";
import { checkStockAndAutoReorder } from "../inventory/auto-reorder";

// Helper to convert Prisma Decimals to Numbers recursively
export const serialize = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;
    if (Array.isArray(obj)) return obj.map(serialize);
    if (typeof obj === 'object') {
        if (obj.constructor && obj.constructor.name === 'Decimal') {
            return Number(obj);
        }
        const newObj: any = {};
        for (const key in obj) {
            newObj[key] = serialize(obj[key]);
        }
        return newObj;
    }
    return obj;
};

/**
 * Generate a human-readable unique number
 * Format: PREFIX-YYYYMMDD-XXXX
 */
function generateUniqueNumber(prefix: string): string {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${date}-${random}`;
}

export interface ApiContext {
    user: any;
    entity: string;
    config: EntityConfig;
}

/**
 * Common authorization and context retrieval
 */
export async function authorize(entity: string, operation: EntityOperation): Promise<ApiContext | NextResponse> {
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const config = ENTITY_REGISTRY[entity];
    if (!config) {
        return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    // Super Admin Bypass
    if (user.role === ROLES.SUPER_ADMIN) {
        return { user, entity, config };
    }

    // Dynamic Permission Check
    const permissionName = `${entity}:${operation}`;

    try {
        const roleRecord = await (prisma as any).roles.findUnique({
            where: { name: user.role },
            include: {
                role_permissions: {
                    where: {
                        permissions: {
                            name: permissionName
                        }
                    },
                    include: {
                        permissions: true
                    }
                }
            }
        });

        if (!roleRecord || roleRecord.role_permissions.length === 0) {
            return NextResponse.json({ error: `Permission denied: ${permissionName}` }, { status: 403 });
        }

    } catch (error) {
        console.error("Authorization error:", error);
        // If generic error, fail safe
        return NextResponse.json({ error: "Authorization check failed" }, { status: 500 });
    }

    return { user, entity, config };
}

/**
 * Handle GET /api/v1/[entity]
 */
export async function handleList(entity: string, searchParams?: URLSearchParams) {
    if (entity === "dashboard-stats") {
        const user = await getCurrentUser();
        if (!user || !["service_admin", "super_admin"].includes(user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return await getDashboardStats(user);
    }
    const ctx = await authorize(entity, 'list');
    if (ctx instanceof NextResponse) return ctx;

    const { user, config } = ctx;

    // Pagination
    const page = parseInt(searchParams?.get('page') || '1');
    const limit = parseInt(searchParams?.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Apply dealer scoping if required
    const where: any = {};
    if (config.scopeBy && user.dealerId) {
        if (config.scopeBy.includes('.')) {
            const parts = config.scopeBy.split('.');
            let current = where;
            for (let i = 0; i < parts.length - 1; i++) {
                current[parts[i]] = current[parts[i]] || {};
                current = current[parts[i]];
            }
            current[parts[parts.length - 1]] = user.dealerId;
        } else {
            where[config.scopeBy] = user.dealerId;
        }
    }

    // Dynamic filtering
    if (searchParams) {
        searchParams.forEach((value, key) => {
            if (!['page', 'limit', 'search'].includes(key)) {
                // Handle booleans and nulls
                if (value === 'true') where[key] = true;
                else if (value === 'false') where[key] = false;
                else if (value === 'null') where[key] = null;
                else where[key] = value;
            }
        });

        // Basic search (if 'q' or 'search' is provided)
        const search = searchParams.get('search') || searchParams.get('q');
        if (search && (config as any).searchFields) {
            where.OR = (config as any).searchFields.map((field: string) => ({
                [field]: { contains: search, mode: 'insensitive' }
            }));
        }
    }

    try {
        const [data, total] = await Promise.all([
            (prisma as any)[config.model].findMany({
                where,
                include: config.includes,
                orderBy: config.orderBy,
                skip,
                take: limit
            }),
            (prisma as any)[config.model].count({ where })
        ]);

        return NextResponse.json({
            success: true,
            data: serialize(data),
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error: any) {
        console.error(`Listing error for ${entity}:`, error);
        return NextResponse.json({ error: `Internal synchronization failure for ${entity}` }, { status: 500 });
    }
}

/**
 * Handle POST /api/v1/[entity]
 */
export async function handleCreate(entity: string, body: any) {
    const ctx = await authorize(entity, 'create');
    if (ctx instanceof NextResponse) return ctx;

    const { user, config } = ctx;

    if (config.schema) {
        try {
            body = config.schema.parse(body);
        } catch (error) {
            if (error instanceof ZodError) {
                return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
            }
            throw error;
        }
    }

    // Standard UUID injection for models that lack DB defaults
    if (config.model === 'profiles' && !body.id) {
        body.id = crypto.randomUUID();
    }

    // Automatic Human-Readable Number Generation
    const businessNumbers: Record<string, { field: string, prefix: string }> = {
        'orders': { field: 'order_number', prefix: 'ORD' },
        'sales': { field: 'sale_number', prefix: 'SL' },
        'service_tickets': { field: 'service_number', prefix: 'SRV' },
        'purchase_orders': { field: 'po_number', prefix: 'PO' },
        'payments': { field: 'payment_number', prefix: 'PAY' },
        'return_requests': { field: 'return_number', prefix: 'RET' },
        'shipments': { field: 'tracking_number', prefix: 'SHP' },
        'referrals': { field: 'referral_code', prefix: 'REF' },
        'service_estimates': { field: 'estimate_number', prefix: 'EST' }
    };

    const mapping = businessNumbers[config.model];
    if (mapping && !body[mapping.field]) {
        body[mapping.field] = generateUniqueNumber(mapping.prefix);
    }

    // Inject dealer_id if required
    if (config.scopeBy && user.dealerId) {
        if (config.scopeBy.includes('.')) {
            // For creation, we might not want to inject nested paths directly into 'data'
            // unless we handle nested creates. For now, let's at least ensure we don't
            // break the top-level 'body' with dot-keyed properties that Prisma doesn't know.
            // If the model has a direct dealer_id, use it. Otherwise, assume the link happens elsewhere.
            if ((prisma as any)[config.model].fields?.dealer_id) {
                body.dealer_id = user.dealerId;
            }
        } else {
            body[config.scopeBy] = user.dealerId;
        }
    }

    try {
        const data = await (prisma as any)[config.model].create({
            data: body,
            include: config.includes
        });

        // CUSTOM LOGIC: Parts Usage Stock Management
        if (config.model === 'parts_usage' && data.variant_id) {
            try {
                // 1. Decrement Stock
                await prisma.part_variants.update({
                    where: { id: data.variant_id },
                    data: {
                        stock_quantity: {
                            decrement: data.quantity || 1
                        }
                    }
                });

                // 2. Check for Low Stock / Auto-reorder
                await checkStockAndAutoReorder(data.variant_id);
            } catch (err) {
                console.error("Failed to update stock after usage:", err);
            }
        }

        // Trigger real-time update
        await broadcast(`${entity}:changed`, { id: data.id, action: 'create', data });

        return NextResponse.json({ success: true, data: serialize(data) }, { status: 201 });
    } catch (error: any) {
        console.error(`Creation error for ${entity}:`, error);
        return NextResponse.json({ error: `Failed to register ${entity} asset: ${error.message}` }, { status: 500 });
    }
}

/**
 * Handle GET /api/v1/[entity]/[id]
 */
export async function handleRead(entity: string, id: string) {
    const ctx = await authorize(entity, 'read');
    if (ctx instanceof NextResponse) return ctx;

    const { user, config } = ctx;

    const where: any = { id };
    if (config.scopeBy && user.dealerId) {
        if (config.scopeBy.includes('.')) {
            const parts = config.scopeBy.split('.');
            let current = where;
            for (let i = 0; i < parts.length - 1; i++) {
                current[parts[i]] = current[parts[i]] || {};
                current = current[parts[i]];
            }
            current[parts[parts.length - 1]] = user.dealerId;
        } else {
            where[config.scopeBy] = user.dealerId;
        }
    }

    try {
        const data = await (prisma as any)[config.model].findFirst({
            where,
            include: config.includes
        });

        if (!data) {
            return NextResponse.json({ error: "Asset not found or unauthorized access" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: serialize(data) });
    } catch (error: any) {
        console.error(`Read error for ${entity}:`, error);
        return NextResponse.json({ error: `Retrieval failure for ${entity}` }, { status: 500 });
    }
}

/**
 * Handle PUT /api/v1/[entity]/[id]
 */
export async function handleUpdate(entity: string, id: string, body: any) {
    const ctx = await authorize(entity, 'update');
    if (ctx instanceof NextResponse) return ctx;

    const { user, config } = ctx;

    if (config.schema) {
        try {
            // For updates, allow partial fields if the schema supports it (z.object)
            const schema = (config.schema as any).partial ? (config.schema as any).partial() : config.schema;
            body = schema.parse(body);
        } catch (error) {
            if (error instanceof ZodError) {
                return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
            }
            throw error;
        }
    }

    // Security: Ensure user only updates records they own
    const ownershipWhere: any = { id };
    if (config.scopeBy && user.dealerId) {
        if (config.scopeBy.includes('.')) {
            const parts = config.scopeBy.split('.');
            let current = ownershipWhere;
            for (let i = 0; i < parts.length - 1; i++) {
                current[parts[i]] = current[parts[i]] || {};
                current = current[parts[i]];
            }
            current[parts[parts.length - 1]] = user.dealerId;
        } else {
            ownershipWhere[config.scopeBy] = user.dealerId;
        }
    }

    try {
        // First check existence/ownership
        const existing = await (prisma as any)[config.model].findFirst({ where: ownershipWhere });
        if (!existing) {
            return NextResponse.json({ error: "Unauthorized or missing resource" }, { status: 404 });
        }

        const data = await (prisma as any)[config.model].update({
            where: { id },
            data: body,
            include: config.includes
        });

        // CUSTOM LOGIC: Job Card Completion
        if (config.model === 'job_cards' && body.status === 'completed') {
            try {
                // 1. Calculate Costs
                const parts = await prisma.parts_usage.findMany({
                    where: { job_card_id: id }
                });
                const partsTotal = parts.reduce((acc, p) => acc + Number(p.total_price || 0), 0);
                const totalAmount = partsTotal;

                // 2. Create Transaction
                if (totalAmount > 0 && data.service_tickets?.profiles?.dealer_id) {
                    await (prisma as any).payment_transactions.create({
                        data: {
                            transaction_number: `TXN-${Date.now()}`,
                            dealer_id: data.service_tickets.profiles.dealer_id,
                            transaction_type: 'service_payment',
                            reference_type: 'job_card',
                            reference_id: id,
                            amount: totalAmount,
                            status: 'pending',
                            customer_id: data.service_tickets.customer_id
                        }
                    });
                }

                // 3. Create Service History
                if (data.service_tickets?.vehicle_id) {
                    await prisma.service_history.create({
                        data: {
                            vehicle_id: data.service_tickets.vehicle_id,
                            job_card_id: id,
                            service_date: new Date(),
                            mileage: 0,
                            total_cost: totalAmount,
                            summary: body.notes || 'Service completed'
                        }
                    });
                }
            } catch (err) {
                console.error("Failed to process job completion financials:", err);
            }
        }

        // Trigger real-time update
        await broadcast(`${entity}:changed`, { id, action: 'update', data });

        return NextResponse.json({ success: true, data: serialize(data) });
    } catch (error: any) {
        console.error(`Update error for ${entity}:`, error);
        return NextResponse.json({ error: `Modification failure for ${entity}: ${error.message}` }, { status: 500 });
    }
}

/**
 * Handle DELETE /api/v1/[entity]/[id]
 */
export async function handleDelete(entity: string, id: string) {
    const ctx = await authorize(entity, 'delete');
    if (ctx instanceof NextResponse) return ctx;

    const { user, config } = ctx;

    const ownershipWhere: any = { id };
    if (config.scopeBy && user.dealerId) {
        if (config.scopeBy.includes('.')) {
            const parts = config.scopeBy.split('.');
            let current = ownershipWhere;
            for (let i = 0; i < parts.length - 1; i++) {
                current[parts[i]] = current[parts[i]] || {};
                current = current[parts[i]];
            }
            current[parts[parts.length - 1]] = user.dealerId;
        } else {
            ownershipWhere[config.scopeBy] = user.dealerId;
        }
    }

    try {
        const existing = await (prisma as any)[config.model].findFirst({ where: ownershipWhere });
        if (!existing) {
            return NextResponse.json({ error: "Unauthorized or missing resource" }, { status: 404 });
        }

        try {
            // Attempt hardware delete
            await (prisma as any)[config.model].delete({
                where: { id }
            });
        } catch (deleteError: any) {
            // Check if it's a foreign key constraint error (Prisma Error Code P2003)
            if (deleteError.code === 'P2003') {
                console.warn(`Hard delete failed for ${entity}:${id} due to constraints. Attempting soft-delete.`);

                // Fallback to soft delete if status column exists
                const modelInfo = (prisma as any)[config.model];
                const fields = modelInfo?.fields || {}; // In Prisma 5+, this might not be directly available this way

                // We'll just try to update. If it fails, then it truly can't be deleted or deactivated.
                const updateData: any = {};
                if (entity === 'profiles') updateData.status = 'inactive';
                else if (entity === 'service_staff') updateData.is_active = false;
                else throw deleteError; // Re-throw if no soft-delete policy

                await (prisma as any)[config.model].update({
                    where: { id },
                    data: updateData
                });

                return NextResponse.json({
                    success: true,
                    message: `${entity} deactivated due to existing records`,
                    softDeleted: true
                });
            }
            throw deleteError;
        }

        // Trigger real-time update
        await broadcast(`${entity}:purged`, { id, action: 'delete' });

        return NextResponse.json({ success: true, message: `${entity} purged successfully` });
    } catch (error: any) {
        console.error(`Delete error for ${entity}:`, error);
        return NextResponse.json({ error: `Purge failure for ${entity}: ${error.message}` }, { status: 500 });
    }
}
