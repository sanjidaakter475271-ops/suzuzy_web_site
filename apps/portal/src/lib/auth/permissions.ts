import { prisma } from "@/lib/prisma/client";

/**
 * Check if a user has a specific permission
 */
export async function hasPermission(userId: string, permissionName: string): Promise<boolean> {
    const user = await prisma.profiles.findUnique({
        where: { id: userId },
        select: { role_id: true, roles: { select: { id: true, name: true } } }
    });

    if (!user || !user.roles) return false;

    // Super Admin has all permissions
    if (user.roles.name === "super_admin") return true;

    // Find the permission record
    // We try name, OR resource + action for flexibility
    let permissionWhere: any;
    if (permissionName.includes(':')) {
        const [resource, action] = permissionName.split(':');
        permissionWhere = {
            OR: [
                { name: permissionName },
                { resource, action },
                { module: resource, action } // legacy fallback
            ]
        };
    } else {
        permissionWhere = {
            OR: [
                { name: permissionName },
                { action: permissionName },
                { resource: permissionName },
                { module: permissionName }
            ]
        };
    }

    const permission = await prisma.permissions.findFirst({
        where: permissionWhere,
        select: { id: true }
    });

    if (!permission) return false;

    // Check if role_permission link exists
    const rolePermission = await (prisma as any).role_permissions.findUnique({
        where: {
            role_id_permission_id: {
                role_id: user.roles.id,
                permission_id: permission.id
            }
        }
    });

    return !!rolePermission;
}

/**
 * Check if a user has any of the specified roles
 */
export async function hasRole(userId: string, roleNames: string[]): Promise<boolean> {
    const user = await prisma.profiles.findUnique({
        where: { id: userId },
        include: { roles: true }
    });

    if (!user || !user.roles) return false;

    return roleNames.includes(user.roles.name);
}

/**
 * Check if user level is high enough
 */
export async function hasMinLevel(userId: string, minLevel: number): Promise<boolean> {
    const user = await prisma.profiles.findUnique({
        where: { id: userId },
        include: { roles: true }
    });

    if (!user || !user.roles) return false;

    // Lower number = higher authority (1 = super_admin, 99 = customer)
    return user.roles.level <= minLevel;
}
