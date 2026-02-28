/**
 * RE-EXPORT from the central roles file.
 * ─────────────────────────────────────────
 * This file exists only for backward compatibility.
 * All role definitions live in "@/lib/auth/roles".
 * New code should import directly from "@/lib/auth/roles".
 */
export {
    ROLES,
    ROLE_LEVELS,
    ROLE_GROUPS,
    getRoleLevel,
    checkRole,
    isAnyAdmin,
    isDealerStaff,
    isPlatformStaff,
    isSuperAdmin,
    ALL_ROLE_NAMES,
} from "@/lib/auth/roles";

export type { RoleName } from "@/lib/auth/roles";
