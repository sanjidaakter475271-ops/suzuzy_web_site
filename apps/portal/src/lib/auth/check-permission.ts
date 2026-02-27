import { prisma } from "@/lib/prisma/client";

/**
 * Checks if a user has a specific permission.
 * Map permission key to: module.action.resource (e.g. "workshop.create.job_cards")
 */
export async function checkUserPermission(
    userId: string,
    permissionKey: string,
    dealerId?: string
): Promise<boolean> {
    const parts = permissionKey.split('.');
    if (parts.length !== 3) {
        console.error("Invalid permission key format. Use module.action.resource");
        return false;
    }

    const [module, action, resource] = parts;

    // Check if user has a role with that permission
    const count = await prisma.role_permissions.count({
        where: {
            permissions: { module, action, resource },
            roles: {
                profile_roles: {
                    some: {
                        profile_id: userId,
                        ...(dealerId ? { dealer_id: dealerId } : {}),
                    }
                }
            }
        }
    });

    return count > 0;
}
