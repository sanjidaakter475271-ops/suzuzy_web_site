"use client";

import { useAuth } from "./useAuth";

export interface UserProfile {
    id: string;
    email: string;
    name: string | null;
    full_name: string | null;
    role: string;
    roleLevel: number;
    dealerId?: string | null;
    dealer_id?: string | null;
    dealer?: any;
    image?: string | null;
}

export function useUser() {
    const { user, loading, error, signOut } = useAuth();

    const profile: UserProfile | null = user ? {
        id: user.id,
        email: user.email,
        name: user.name,
        full_name: user.name,
        role: user.role,
        roleLevel: user.roleLevel,
        dealerId: user.dealer?.id || user.dealer_id,
        dealer_id: user.dealer?.id || user.dealer_id,
        dealer: user.dealer,
        image: null, // Custom implementation doesn't have image yet
    } : null;

    return {
        profile,
        user,
        loading,
        error,
        signOut
    };
}
