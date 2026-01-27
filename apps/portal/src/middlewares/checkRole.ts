// New 12-Role Hierarchy levels
export const ROLE_LEVELS: Record<string, number> = {
    super_admin: 1,
    showroom_admin: 2,
    service_admin: 3,
    showroom_sales_admin: 4,
    service_sales_admin: 5,
    support: 6,
    accountant: 7,
    service_technician: 8,
    dealer_owner: 10,
    dealer_manager: 11,
    dealer_staff: 12,
    sub_dealer: 15,
    customer: 99,
};

interface RoleCheckOptions {
    allowedRoles?: string[];
    minLevel?: number;
}

/**
 * getRoleLevel: Helper to get numeric level for a role
 */
export function getRoleLevel(role: string): number {
    return ROLE_LEVELS[role] || 99;
}

/**
 * checkRole: Verifies if a user has sufficient privileges based on their role and level
 */
export function checkRole(userRole: string, options: RoleCheckOptions) {
    const userLevel = getRoleLevel(userRole);

    // 1. Check specific roles
    if (options.allowedRoles && !options.allowedRoles.includes(userRole)) {
        return {
            allowed: false,
            error: "Role not authorized for this action",
        };
    }

    // 2. Check hierarchy level (smaller number = higher privilege)
    if (options.minLevel !== undefined && userLevel > options.minLevel) {
        return {
            allowed: false,
            error: "Insufficient privilege level",
        };
    }

    return { allowed: true };
}

// Helper types for easier usage
export const isAnyAdmin = (role: string) => (ROLE_LEVELS[role] || 99) <= 7;
export const isDealerStaff = (role: string) => (ROLE_LEVELS[role] || 99) >= 10 && (ROLE_LEVELS[role] || 99) <= 15;
