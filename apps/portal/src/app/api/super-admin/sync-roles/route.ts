import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { verifyToken } from "@/lib/auth/jwt";
import { SYSTEM_PERMISSIONS, ROLE_PERMISSIONS_MAPPING } from "@/lib/auth/permission-utils";

const REQUIRED_ROLES = [
    { name: "super_admin", display_name: "Super Admin", level: 1, role_type: "system", is_system_role: true, description: "Full system authority with access to all modules, settings, and consortium-level data." },
    { name: "showroom_admin", display_name: "Showroom Admin", level: 2, role_type: "system", is_system_role: true, description: "Showroom manager responsible for branch operations, staff management, and sales oversight." },
    { name: "service_admin", display_name: "Service Admin", level: 3, role_type: "system", is_system_role: true, description: "Service center manager overseeing technical staff, job cards, and workshop efficiency." },
    { name: "sell_showroom_admin", display_name: "Showroom Sales Lead", level: 4, role_type: "system", is_system_role: true, description: "Head of showroom sales and billing, managing executive targets and customer transactions." },
    { name: "sell_service_admin", display_name: "Service Billing Lead", level: 5, role_type: "system", is_system_role: true, description: "Responsible for service billing, spare parts inventory, and requisition management." },
    { name: "support", display_name: "System Support", level: 6, role_type: "system", is_system_role: true, description: "Cross-unit support staff for technical maintenance and platform troubleshooting." },
    { name: "accountant", display_name: "Financial Accountant", level: 7, role_type: "system", is_system_role: true, description: "Financial controller managing general ledgers, tax filings, and revenue reconciliations." },
    { name: "sells_stuff", display_name: "Sales Executive", level: 10, role_type: "system", is_system_role: true, description: "Showroom floor sales staff focused on customer interaction and lead conversion." },
    { name: "service_stuff", display_name: "Service Technician", level: 11, role_type: "system", is_system_role: true, description: "Technical staff performing repairs, maintenance, and vehicle servicing." },
    { name: "dealer", display_name: "Dealer Owner", level: 12, role_type: "system", is_system_role: true, description: "Principal owner of a partner dealership with overall responsibility for their franchise." },
    { name: "dealer_manager", display_name: "Dealer Manager", level: 13, role_type: "system", is_system_role: true, description: "Operational head of a partner dealer location managing day-to-day business flow." },
    { name: "dealer_staff", display_name: "Dealer Staff", level: 14, role_type: "system", is_system_role: true, description: "General staff employed at a partner dealer location." },
    { name: "inventory_manager", display_name: "Inventory Manager", level: 15, role_type: "system", is_system_role: true, description: "Stock controller responsible for warehouse management and inventory accuracy." },
    { name: "customer", display_name: "End Customer", level: 99, role_type: "system", is_system_role: true, description: "Retail customer purchasing products and scheduling services through the platform." }
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
