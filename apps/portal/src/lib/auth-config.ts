import { ROLES, ROLE_LEVELS } from "@/lib/auth/roles";

export const PORTAL_CONFIG = {
    SUPER_ADMIN: {
        path: "/super-admin",
        minLevel: ROLE_LEVELS[ROLES.SUPER_ADMIN],
        allowedRoles: [ROLES.SUPER_ADMIN],
    },
    ADMIN: {
        path: "/admin",
        minLevel: ROLE_LEVELS[ROLES.SHOWROOM_ADMIN],
        maxLevel: ROLE_LEVELS[ROLES.SERVICE_TECHNICIAN],
        allowedRoles: [
            ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SHOWROOM_ADMIN,
            ROLES.SALES_ADMIN, ROLES.SHOWROOM_SALES_ADMIN,
            ROLES.SERVICE_SALES_ADMIN, ROLES.SUPPORT, ROLES.ACCOUNTANT,
            ROLES.SELLS_STUFF,
        ],
    },
    SALES_ADMIN: {
        path: "/sales-admin",
        minLevel: ROLE_LEVELS[ROLES.SHOWROOM_SALES_ADMIN],
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.SALES_ADMIN, ROLES.SHOWROOM_SALES_ADMIN, ROLES.SERVICE_SALES_ADMIN],
    },
    SERVICE_ADMIN: {
        path: "/service-admin",
        minLevel: ROLE_LEVELS[ROLES.SERVICE_ADMIN],
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.SERVICE_ADMIN],
    },
    SERVICE_STAFF: {
        path: "/service-staff",
        minLevel: ROLE_LEVELS[ROLES.SERVICE_TECHNICIAN],
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.SERVICE_ADMIN, ROLES.SERVICE_TECHNICIAN, ROLES.SERVICE_STUFF],
    },
    DEALER: {
        path: "/dealer",
        minLevel: ROLE_LEVELS[ROLES.DEALER_OWNER],
        maxLevel: ROLE_LEVELS[ROLES.DEALER_STAFF],
        allowedRoles: [ROLES.DEALER_OWNER, ROLES.DEALER_MANAGER, ROLES.DEALER_STAFF, ROLES.DEALER],
    },
};

export interface UserSession {
    id: string;
    email: string;
    role: string;
    roleLevel: number;
    dealerId?: string | null;
}
