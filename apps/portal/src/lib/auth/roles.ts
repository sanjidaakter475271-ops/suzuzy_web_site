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
    SELLS_STUFF: 'sells_stuff',

    // Service Wing
    SERVICE_ADMIN: 'service_admin',
    SERVICE_STUFF: 'service_stuff',
    SERVICE_TECHNICIAN: 'service_technician',

    // General Admin
    ADMIN: 'admin',
    SUPPORT: 'support',
    ACCOUNTANT: 'accountant',

    // Dealer Hierarchy
    DEALER_OWNER: 'dealer_owner',
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
    [ROLES.ADMIN]: 5,
    [ROLES.SUPPORT]: 6,

    // Dealer Hierarchy (10-20)
    [ROLES.DEALER_OWNER]: 10,
    [ROLES.DEALER]: 10,
    [ROLES.SERVICE_ADMIN]: 11,
    [ROLES.SHOWROOM_ADMIN]: 11,
    [ROLES.ACCOUNTANT]: 12,
    [ROLES.SERVICE_STUFF]: 14,
    [ROLES.SELLS_STUFF]: 14,
    [ROLES.SERVICE_TECHNICIAN]: 15,
    [ROLES.DEALER_STAFF]: 16,
    [ROLES.SUB_DEALER]: 20,

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
        ROLES.SELLS_STUFF,
    ],
    /** Service center roles */
    SERVICE: [
        ROLES.SERVICE_ADMIN,
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
    DEALER_TIERS: [
        ROLES.DEALER_OWNER,
        ROLES.DEALER_STAFF,
        ROLES.SUB_DEALER,
        ROLES.DEALER,
    ],
    /** All dealer personnel (including admins) */
    DEALER_PERSONNEL: [
        ROLES.DEALER_OWNER,
        ROLES.SERVICE_ADMIN,
        ROLES.SHOWROOM_ADMIN,
        ROLES.ACCOUNTANT,
        ROLES.SERVICE_STUFF,
        ROLES.SELLS_STUFF,
        ROLES.SERVICE_TECHNICIAN,
        ROLES.DEALER_STAFF,
        ROLES.SUB_DEALER,
        ROLES.DEALER,
    ],
    /** All platform staff (top-level only) */
    PLATFORM_STAFF: [
        ROLES.SUPER_ADMIN,
        ROLES.ADMIN,
        ROLES.SUPPORT,
    ],
};

// ─────────────────────────────────────────────────────────────
//  4. HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────

/** Get numeric level for a role string. Unknown roles → 99 (customer). */
export function getRoleLevel(role: string): number {
    if (ROLE_LEVELS[role] !== undefined) return ROLE_LEVELS[role];

    // Fuzzy fallback for legacy dealer variants
    if (role?.includes('dealer')) return ROLE_LEVELS[ROLES.DEALER_STAFF]; // 16

    return 99;
}

/** True if role is a dealer-scoped role (needs dealer_id) */
export const isDealerRole = (role: string): boolean => {
    const lvl = getRoleLevel(role);
    return lvl >= 10 && lvl <= 20;
};

/** True if role requires a dealer_id to function */
export const requiresDealerId = (role: string): boolean =>
    isDealerRole(role);

/** True if role is platform admin (super_admin, admin, support) */
export const isPlatformAdmin = (role: string): boolean =>
    getRoleLevel(role) <= 6;

/** True if role is any kind of platform admin (level ≤ 6) */
export const isAnyAdmin = (role: string): boolean =>
    getRoleLevel(role) <= 6;

/** True if role is any kind of dealer staff (level 10-20) */
export const isDealerStaff = (role: string): boolean => {
    const lvl = getRoleLevel(role);
    return lvl >= 10 && lvl <= 20;
};

/** True if role is platform staff (not dealer, not customer) */
export const isPlatformStaff = (role: string): boolean =>
    getRoleLevel(role) >= 1 && getRoleLevel(role) <= 6;

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
