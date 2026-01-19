'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export interface UserProfile {
    id: string;
    full_name: string | null;
    phone: string | null;
    role: 'super_admin' | 'admin' | 'dealer' | 'support' | 'viewer' | 'customer';
    created_at: string;
    updated_at: string;
}

export function useUser() {
    const { user, loading: authLoading } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProfile() {
            if (!user) {
                setProfile(null);
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) {
                setError(error.message);
            } else {
                setProfile(data as UserProfile);
            }
            setLoading(false);
        }

        if (!authLoading) {
            fetchProfile();
        }
    }, [user, authLoading]);

    return { profile, loading: loading || authLoading, error, user };
}
