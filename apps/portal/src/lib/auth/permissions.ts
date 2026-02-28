import { prisma } from "@/lib/prisma/client";

/**
 * Check if a user has a specific permission
 */
export async function hasPermission(userId: string, permissionName: string): Promise<boolean> {
    const user = await prisma.profiles.findUnique({
        where: { id: userId },
        include: {
            roles: {
                include: {
                    role_permissions: {
                        include: {
                            permissions: true
                        }
                    }
                }
            }
        }
    });

    if (!user || !user.roles) return false;

    // Super Admin has all permissions
    if (user.roles.name === "super_admin") return true;

    // Check if permissionName is in 'module:action' format
    if (permissionName.includes(':')) {
        const [module, action] = permissionName.split(':');
        return user.roles.role_permissions.some(
            (rp) => rp.permissions.module === module && rp.permissions.action === action
        );
    }

    // Fallback or specific action check
    return user.roles.role_permissions.some(
        (rp) => rp.permissions.action === permissionName || rp.permissions.module === permissionName
    );
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

    return user.roles.level >= minLevel;
}
