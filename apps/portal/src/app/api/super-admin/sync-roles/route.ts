import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { verifyToken } from "@/lib/auth/jwt";
import { SYSTEM_PERMISSIONS, ROLE_PERMISSIONS_MAPPING } from "@/lib/auth/permission-utils";
import { ROLES, ROLE_LEVELS } from "@/lib/auth/roles";

const REQUIRED_ROLES = [
    { name: ROLES.SUPER_ADMIN, display_name: "Super Admin", level: ROLE_LEVELS[ROLES.SUPER_ADMIN], role_type: "system", is_system_role: true, description: "Full system authority with access to all modules, settings, and consortium-level data." },
    { name: ROLES.ADMIN, display_name: "General Admin", level: ROLE_LEVELS[ROLES.ADMIN], role_type: "system", is_system_role: true, description: "General system administrator and backend office operations." },
    { name: ROLES.SUPPORT, display_name: "System Support", level: ROLE_LEVELS[ROLES.SUPPORT], role_type: "system", is_system_role: true, description: "Cross-unit support staff for technical maintenance and platform troubleshooting." },

    { name: ROLES.DEALER_OWNER, display_name: "Dealer Owner", level: ROLE_LEVELS[ROLES.DEALER_OWNER], role_type: "system", is_system_role: true, description: "Principal owner of a partner dealership with overall responsibility for their franchise." },
    { name: ROLES.DEALER, display_name: "Dealer (Legacy)", level: ROLE_LEVELS[ROLES.DEALER], role_type: "system", is_system_role: true, description: "Legacy primary dealer account alias." },

    { name: ROLES.SERVICE_ADMIN, display_name: "Service Admin", level: ROLE_LEVELS[ROLES.SERVICE_ADMIN], role_type: "system", is_system_role: true, description: "Service center manager overseeing technical staff, job cards, and workshop efficiency." },
    { name: ROLES.SHOWROOM_ADMIN, display_name: "Showroom Admin", level: ROLE_LEVELS[ROLES.SHOWROOM_ADMIN], role_type: "system", is_system_role: true, description: "Showroom manager responsible for branch operations, staff management, and sales oversight." },

    { name: ROLES.ACCOUNTANT, display_name: "Financial Accountant", level: ROLE_LEVELS[ROLES.ACCOUNTANT], role_type: "system", is_system_role: true, description: "Financial controller managing general ledgers, tax filings, and revenue reconciliations." },

    { name: ROLES.SERVICE_STUFF, display_name: "Service Staff", level: ROLE_LEVELS[ROLES.SERVICE_STUFF], role_type: "system", is_system_role: true, description: "General staff employed at the service shop." },
    { name: ROLES.SELLS_STUFF, display_name: "Sales Executive", level: ROLE_LEVELS[ROLES.SELLS_STUFF], role_type: "system", is_system_role: true, description: "Showroom floor sales staff focused on customer interaction and lead conversion." },

    { name: ROLES.SERVICE_TECHNICIAN, display_name: "Service Technician", level: ROLE_LEVELS[ROLES.SERVICE_TECHNICIAN], role_type: "system", is_system_role: true, description: "Technical staff performing repairs, maintenance, and vehicle servicing." },

    { name: ROLES.DEALER_STAFF, display_name: "Dealer Staff", level: ROLE_LEVELS[ROLES.DEALER_STAFF], role_type: "system", is_system_role: true, description: "General staff employed at a partner dealer location." },

    { name: ROLES.SUB_DEALER, display_name: "Sub Dealer", level: ROLE_LEVELS[ROLES.SUB_DEALER], role_type: "system", is_system_role: true, description: "Sub-dealer operating underneath a primary dealership." },

    { name: ROLES.CUSTOMER, display_name: "End Customer", level: ROLE_LEVELS[ROLES.CUSTOMER], role_type: "system", is_system_role: true, description: "Retail customer purchasing products and scheduling services through the platform." }
];

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get("access_token")?.value;
        const payload = token ? await verifyToken(token) : null;

        if (!payload || payload.role !== "super_admin") {
            return NextResponse.json({ error: "Unauthorized role synchronization" }, { status: 403 });
        }

        const results = await prisma.$transaction(async (tx) => {
            // 1. Sync Permissions first
            for (const perm of SYSTEM_PERMISSIONS) {
                await tx.permissions.upsert({
                    where: { name: perm.name },
                    update: { module: perm.module, description: perm.description },
                    create: perm
                });
            }

            // 2. Sync Roles and Mappings
            const upsertedRoles = [];
            for (const role of REQUIRED_ROLES) {
                const upserted = await tx.roles.upsert({
                    where: { name: role.name },
                    update: {
                        display_name: role.display_name,
                        level: role.level,
                        description: role.description,
                        role_type: role.role_type,
                        is_system_role: role.is_system_role
                    },
                    create: role
                });

                // 3. Rebuild Permission Mapping for this role
                const permissionsForRole = ROLE_PERMISSIONS_MAPPING[role.name] || [];
                if (permissionsForRole.length > 0) {
                    // Get permission IDs
                    const permsFromDb = await tx.permissions.findMany({
                        where: { name: { in: permissionsForRole } },
                        select: { id: true }
                    });

                    // Clear existing
                    await tx.role_permissions.deleteMany({
                        where: { role_id: upserted.id }
                    });

                    // Create new associations
                    await tx.role_permissions.createMany({
                        data: permsFromDb.map(p => ({
                            role_id: upserted.id,
                            permission_id: p.id
                        }))
                    });
                }

                upsertedRoles.push(upserted);
            }
            return upsertedRoles;
        });

        return NextResponse.json({
            success: true,
            count: results.length,
            message: "Roles and fine-grained permissions synchronized"
        });
    } catch (error: any) {
        console.error("Role Sync Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
