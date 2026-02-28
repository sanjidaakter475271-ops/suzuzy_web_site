/**
 * ═══════════════════════════════════════════════════════════════
 *  SINGLE SOURCE OF TRUTH — All Roles, Levels, Groups & Helpers
 * ═══════════════════════════════════════════════════════════════
 *
 *  DO NOT define roles anywhere else. Every file in the codebase
 *  must import from "@/lib/auth/roles".
 *
 *  Hierarchy: Lower number = Higher authority.
 */

// ─────────────────────────────────────────────────────────────
//  1. ROLE CONSTANTS (string values stored in DB)
// ─────────────────────────────────────────────────────────────
export const ROLES = {
    // Platform Top-Level
    SUPER_ADMIN: 'super_admin',

    // Showroom Wing
    SHOWROOM_ADMIN: 'showroom_admin',
    SHOWROOM_SALES_ADMIN: 'showroom_sales_admin',
    SELLS_STUFF: 'sells_stuff',

    // Service Wing
    SERVICE_ADMIN: 'service_admin',
    SERVICE_SALES_ADMIN: 'service_sales_admin',
    SERVICE_STUFF: 'service_stuff',
    SERVICE_TECHNICIAN: 'service_technician',

    // General Admin
    ADMIN: 'admin',
    SUPPORT: 'support',
    ACCOUNTANT: 'accountant',
    SALES_ADMIN: 'sales_admin',

    // Dealer Hierarchy
    DEALER_OWNER: 'dealer_owner',
    DEALER_MANAGER: 'dealer_manager',
    DEALER_STAFF: 'dealer_staff',
    DEALER: 'dealer',             // legacy alias → treated as dealer_owner
    SUB_DEALER: 'sub_dealer',

    // End User
    CUSTOMER: 'customer',
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

// ─────────────────────────────────────────────────────────────
//  2. ROLE LEVELS (numeric hierarchy — lower = more powerful)
// ─────────────────────────────────────────────────────────────
export const ROLE_LEVELS: Record<string, number> = {
    // Platform Staff (1-8)
    [ROLES.SUPER_ADMIN]: 1,
    [ROLES.SHOWROOM_ADMIN]: 2,
    [ROLES.SERVICE_ADMIN]: 3,
    [ROLES.SHOWROOM_SALES_ADMIN]: 4,
    [ROLES.SERVICE_SALES_ADMIN]: 5,
    [ROLES.SALES_ADMIN]: 4,          // alias — same level as showroom_sales_admin
    [ROLES.SUPPORT]: 6,
    [ROLES.ACCOUNTANT]: 7,
    [ROLES.ADMIN]: 7,                // generic admin, same tier as accountant
    [ROLES.SELLS_STUFF]: 8,          // showroom floor staff
    [ROLES.SERVICE_STUFF]: 8,        // service floor staff
    [ROLES.SERVICE_TECHNICIAN]: 8,

    // Dealers (10-15)
    [ROLES.DEALER_OWNER]: 10,
    [ROLES.DEALER]: 10,              // legacy alias
    [ROLES.DEALER_MANAGER]: 11,
    [ROLES.DEALER_STAFF]: 12,
    [ROLES.SUB_DEALER]: 15,

    // Customer
    [ROLES.CUSTOMER]: 99,
};

// ─────────────────────────────────────────────────────────────
//  3. ROLE GROUPS (for middleware / route guards)
// ─────────────────────────────────────────────────────────────
export const ROLE_GROUPS = {
    /** Showroom wing roles */
    SHOWROOM: [
        ROLES.SHOWROOM_ADMIN,
        ROLES.SHOWROOM_SALES_ADMIN,
        ROLES.SELLS_STUFF,
    ],
    /** Service center roles */
    SERVICE: [
        ROLES.SERVICE_ADMIN,
        ROLES.SERVICE_SALES_ADMIN,
        ROLES.SERVICE_STUFF,
        ROLES.SERVICE_TECHNICIAN,
    ],
    /** General admin / back-office */
    GENERAL_ADMIN: [
        ROLES.ADMIN,
        ROLES.SUPPORT,
        ROLES.ACCOUNTANT,
    ],
    /** All dealer tiers */
    DEALER: [
        ROLES.DEALER_OWNER,
        ROLES.DEALER_MANAGER,
        ROLES.DEALER_STAFF,
        ROLES.SUB_DEALER,
        ROLES.DEALER,
    ],
    /** All platform staff (non-dealer, non-customer) */
    ALL_STAFF: [
        ROLES.SUPER_ADMIN,
        ROLES.SHOWROOM_ADMIN,
        ROLES.SERVICE_ADMIN,
        ROLES.SHOWROOM_SALES_ADMIN,
        ROLES.SERVICE_SALES_ADMIN,
        ROLES.SALES_ADMIN,
        ROLES.ADMIN,
        ROLES.SUPPORT,
        ROLES.ACCOUNTANT,
        ROLES.SELLS_STUFF,
        ROLES.SERVICE_STUFF,
        ROLES.SERVICE_TECHNICIAN,
    ],
};

// ─────────────────────────────────────────────────────────────
//  4. HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────

/** Get numeric level for a role string. Unknown roles → 99 (customer). */
export function getRoleLevel(role: string): number {
    if (ROLE_LEVELS[role] !== undefined) return ROLE_LEVELS[role];

    // Fuzzy fallback for legacy dealer variants
    if (role?.includes('dealer')) return ROLE_LEVELS[ROLES.DEALER_STAFF]; // 12

    return 99;
}

/** True if role is any kind of platform admin (level ≤ 8) */
export const isAnyAdmin = (role: string): boolean =>
    getRoleLevel(role) <= 8;

/** True if role is any kind of dealer staff (level 10-15) */
export const isDealerStaff = (role: string): boolean => {
    const lvl = getRoleLevel(role);
    return lvl >= 10 && lvl <= 15;
};

/** True if role is platform staff (not dealer, not customer) */
export const isPlatformStaff = (role: string): boolean =>
    getRoleLevel(role) >= 1 && getRoleLevel(role) <= 8;

/** True if role is super_admin specifically */
export const isSuperAdmin = (role: string): boolean =>
    role === ROLES.SUPER_ADMIN;

// ─────────────────────────────────────────────────────────────
//  5. ROLE CHECK UTILITY (for API routes)
// ─────────────────────────────────────────────────────────────
interface RoleCheckOptions {
    allowedRoles?: string[];
    minLevel?: number;
}

/**
 * checkRole: Verifies if a user has sufficient privileges.
 * Lower level = higher privilege.
 */
export function checkRole(userRole: string, options: RoleCheckOptions) {
    const userLevel = getRoleLevel(userRole);

    if (options.allowedRoles && !options.allowedRoles.includes(userRole)) {
        return { allowed: false, error: "Role not authorized for this action" };
    }

    if (options.minLevel !== undefined && userLevel > options.minLevel) {
        return { allowed: false, error: "Insufficient privilege level" };
    }

    return { allowed: true };
}

/** All role names as a flat array (useful for dropdowns / selects) */
export const ALL_ROLE_NAMES: string[] = Object.values(ROLES);
