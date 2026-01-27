import { ROLE_LEVELS } from "@/middlewares/checkRole";

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
        allowedRoles: ["super_admin", "admin", "sales_admin", "service_admin", "service_sales_admin", "support", "accountant", "viewer"],
    },
    SALES_ADMIN: {
        path: "/sales-admin",
        minLevel: ROLE_LEVELS.SALES_ADMIN,
        allowedRoles: ["super_admin", "sales_admin"],
    },
    SERVICE_ADMIN: {
        path: "/service-admin",
        minLevel: ROLE_LEVELS.SERVICE_ADMIN,
        allowedRoles: ["super_admin", "service_admin"],
    },
    SERVICE_STAFF: {
        path: "/service-staff",
        minLevel: ROLE_LEVELS.SERVICE_TECHNICIAN,
        allowedRoles: ["super_admin", "service_admin", "service_technician"],
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
