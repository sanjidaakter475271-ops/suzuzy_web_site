'use client';

import { useUser } from './useUser';

export function usePermissions() {
    const { profile, loading } = useUser();

    const hasRole = (roles: string | string[]) => {
        if (!profile) return false;
        if (Array.isArray(roles)) {
            return roles.includes(profile.role);
        }
        return profile.role === roles;
    };

    const isSuperAdmin = profile?.role === 'super_admin';
    const isAdmin = profile?.role === 'admin' || isSuperAdmin;
    const isDealer = profile?.role === 'dealer';
    const isCustomer = profile?.role === 'customer';

    return {
        hasRole,
        isSuperAdmin,
        isAdmin,
        isDealer,
        isCustomer,
        loading,
        role: profile?.role
    };
}
