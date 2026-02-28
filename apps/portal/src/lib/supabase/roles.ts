/**
 * RE-EXPORT from the central roles file.
 * ─────────────────────────────────────────
 * This file exists only for backward compatibility.
 * All role definitions live in "@/lib/auth/roles".
 */
export {
    ROLE_LEVELS,
    getRoleLevel,
    isPlatformStaff,
    isDealerStaff,
    isSuperAdmin,
} from "@/lib/auth/roles";

export type { RoleName } from "@/lib/auth/roles";
