import { ROLE_LEVELS } from "./supabase/roles";

export const PORTAL_CONFIG = {
    SUPER_ADMIN: {
        path: "/super-admin",
        minLevel: ROLE_LEVELS.SUPER_ADMIN,
        allowedRoles: ["super_admin"],
    },
    ADMIN: {
        path: "/admin",
        minLevel: ROLE_LEVELS.ADMIN,
        maxLevel: ROLE_LEVELS.VIEWER,
        allowedRoles: ["super_admin", "admin", "sales_admin", "support", "accountant", "viewer"],
    },
    SALES_ADMIN: {
        path: "/sales-admin",
        minLevel: ROLE_LEVELS.SALES_ADMIN,
        allowedRoles: ["super_admin", "sales_admin"],
    },
    DEALER: {
        path: "/dealer",
        minLevel: ROLE_LEVELS.DEALER_OWNER,
        maxLevel: ROLE_LEVELS.DEALER_STAFF,
        allowedRoles: ["dealer_owner", "dealer_manager", "dealer_staff"],
    },
};

export interface UserSession {
    id: string;
    email: string;
    role: string;
    roleLevel: number;
    dealerId?: string | null;
}
