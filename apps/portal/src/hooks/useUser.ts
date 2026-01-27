"use client";

import { useAuth } from "./useAuth";

export interface UserProfile {
    id: string;
    email: string;
    name: string | null;
    full_name: string | null;
    role: string;
    roleId?: string | null;
    dealerId?: string | null;
    dealer_id?: string | null;
    image?: string | null;
}

/**
 * useUser hook: Returns the logged-in user profile from Better Auth session.
 */
export function useUser() {
    const { user, session, loading, error, signOut } = useAuth();

    const profile: UserProfile | null = user ? {
        id: user.id,
        email: user.email,
        name: user.name || null,
        full_name: user.name || null,
        role: user.role || 'customer',
        roleId: user.roleId,
        dealerId: user.dealerId,
        dealer_id: user.dealerId,
        image: user.image
    } : null;

    return {
        profile,
        user,
        session,
        loading,
        error,
        signOut
    };
}
