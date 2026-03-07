import { ROLES, ROLE_LEVELS } from "@/lib/auth/roles";

export const PORTAL_CONFIG = {
    SUPER_ADMIN: {
        path: "/super-admin",
        minLevel: ROLE_LEVELS[ROLES.SUPER_ADMIN],
        allowedRoles: [ROLES.SUPER_ADMIN],
        homeRoles: [ROLES.SUPER_ADMIN],
    },
    ADMIN: {
        path: "/admin",
        minLevel: ROLE_LEVELS[ROLES.ADMIN],
        maxLevel: ROLE_LEVELS[ROLES.SUPPORT],
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SUPPORT],
        homeRoles: [ROLES.ADMIN, ROLES.SUPPORT],
    },
    SHOWROOM: {
        path: "/showroom-admin",
        minLevel: ROLE_LEVELS[ROLES.SHOWROOM_ADMIN],
        maxLevel: ROLE_LEVELS[ROLES.SELLS_STUFF],
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SHOWROOM_ADMIN, ROLES.SELLS_STUFF],
        homeRoles: [ROLES.SHOWROOM_ADMIN, ROLES.SELLS_STUFF],
    },
    SERVICE_ADMIN: {
        path: "/service-admin",
        minLevel: ROLE_LEVELS[ROLES.SERVICE_ADMIN],
        maxLevel: ROLE_LEVELS[ROLES.SERVICE_TECHNICIAN],
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SERVICE_ADMIN, ROLES.SERVICE_STUFF, ROLES.SERVICE_TECHNICIAN],
        homeRoles: [ROLES.SERVICE_ADMIN, ROLES.SERVICE_STUFF, ROLES.SERVICE_TECHNICIAN],
    },
    DEALER: {
        path: "/dealer",
        minLevel: ROLE_LEVELS[ROLES.DEALER_OWNER],
        maxLevel: ROLE_LEVELS[ROLES.SUB_DEALER],
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DEALER_OWNER, ROLES.DEALER_STAFF, ROLES.ACCOUNTANT, ROLES.DEALER, ROLES.SUB_DEALER],
        homeRoles: [ROLES.DEALER_OWNER, ROLES.DEALER_STAFF, ROLES.ACCOUNTANT, ROLES.DEALER, ROLES.SUB_DEALER],
    },
    CLIENTS: {
        path: "/customer",
        minLevel: ROLE_LEVELS[ROLES.CUSTOMER],
        allowedRoles: [ROLES.CUSTOMER],
        homeRoles: [ROLES.CUSTOMER],
    },
};

export interface UserSession {
    id: string;
    email: string;
    role: string;
    roleLevel: number;
    dealerId?: string | null;
}
