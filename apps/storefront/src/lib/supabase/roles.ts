/**
 * ROLE_LEVELS defines the hierarchy of users in the system.
 * Lower numbers represent higher authority.
 */
export const ROLE_LEVELS = {
    // Platform Staff (L1-L5)
    SUPER_ADMIN: 1,
    ADMIN: 2,
    SUPPORT: 3,
    ACCOUNTANT: 4,
    VIEWER: 5,

    // Dealer Staff (L10-L12)
    DEALER_OWNER: 10,
    DEALER_MANAGER: 11,
    DEALER_STAFF: 12,

    // Customers (L99)
    CUSTOMER: 99,
} as const;

export type RoleLevel = typeof ROLE_LEVELS[keyof typeof ROLE_LEVELS];

export const isPlatformStaff = (roleLevel: number) => roleLevel >= 1 && roleLevel <= 5;
export const isDealerStaff = (roleLevel: number) => roleLevel >= 10 && roleLevel <= 12;
export const isSuperAdmin = (roleLevel: number) => roleLevel === 1;
