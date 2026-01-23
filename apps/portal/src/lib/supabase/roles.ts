/**
 * ROLE_LEVELS defines the hierarchy of users in the system.
 * Lower numbers represent higher authority.
 */
export const ROLE_LEVELS = {
    // Platform Staff (L1-L5)
    SUPER_ADMIN: 1,
    ADMIN: 2,
    SALES_ADMIN: 3,
    SUPPORT: 4,
    ACCOUNTANT: 5,
    VIEWER: 6,

    // Dealer Staff (L10-L12)
    DEALER_OWNER: 10,
    DEALER_MANAGER: 11,
    DEALER_STAFF: 12,

    // Customers (L99)
    CUSTOMER: 99,
} as const;

export type RoleName = 'super_admin' | 'admin' | 'sales_admin' | 'support' | 'accountant' | 'viewer' | 'dealer_owner' | 'dealer_manager' | 'dealer_staff' | 'customer';

export const getRoleLevel = (roleName: string): number => {
    const roles: Record<string, number> = {
        super_admin: ROLE_LEVELS.SUPER_ADMIN,
        admin: ROLE_LEVELS.ADMIN,
        sales_admin: ROLE_LEVELS.SALES_ADMIN,
        support: ROLE_LEVELS.SUPPORT,
        accountant: ROLE_LEVELS.ACCOUNTANT,
        viewer: ROLE_LEVELS.VIEWER,
        dealer: ROLE_LEVELS.DEALER_OWNER, // Alias for legacy/generic dealer role
        dealer_owner: ROLE_LEVELS.DEALER_OWNER,
        dealer_manager: ROLE_LEVELS.DEALER_MANAGER,
        dealer_staff: ROLE_LEVELS.DEALER_STAFF,
        customer: ROLE_LEVELS.CUSTOMER,
    };
    return roles[roleName] || 99;
};

export const isPlatformStaff = (roleLevel: number) => roleLevel >= 1 && roleLevel <= 6;
export const isDealerStaff = (roleLevel: number) => roleLevel >= 10 && roleLevel <= 12;
export const isSuperAdmin = (roleLevel: number) => roleLevel === 1;
