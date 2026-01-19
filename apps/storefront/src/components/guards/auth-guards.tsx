'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock, Loader2 } from 'lucide-react';
import { MetallicText } from '@/components/ui/premium/MetallicText';
import { ROLE_LEVELS } from '@/lib/supabase/roles';

/**
 * Premium Loader Component for Auth Transitions
 */
const AuthLoader = ({ message = "Authenticating..." }: { message?: string }) => (
    <div className="min-h-screen bg-[#0D0D0F] flex items-center justify-center">
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6"
        >
            <div className="relative">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="w-20 h-20 rounded-full border-2 border-[#D4AF37]/20 border-t-[#D4AF37]"
                />
                <ShieldCheck className="w-10 h-10 text-[#D4AF37] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <MetallicText className="font-display font-bold tracking-[0.3em] text-xs italic">
                    {message.toUpperCase()}
                </MetallicText>
            </motion.div>
        </motion.div>
    </div>
);

/**
 * AuthGuard ensures the user is logged in
 */
export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
            } else {
                setIsAuthorized(true);
            }
        };
        checkUser();
    }, [router]);

    if (isAuthorized === null) return <AuthLoader />;

    return <>{children}</>;
};

/**
 * Hierarchical RoleGuard checks if user level is sufficient
 */
export const RoleGuard = ({
    children,
    minLevel,
    maxLevel = 100
}: {
    children: React.ReactNode;
    minLevel: number;
    maxLevel?: number;
}) => {
    const [hasAccess, setHasAccess] = useState<boolean | null>(null);
    const router = useRouter();

    useEffect(() => {
        const checkRole = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            // Fetch user profile with role level
            // Note: This assumes 'profiles' table has 'role_level' column mapped from 'roles' table
            // or we join with roles table. For now, we'll fetch from a combined view or profile.
            const { data: profile } = await supabase
                .from('users') // Following database.md, 'users' has 'role_id'
                .select(`
                    id,
                    roles (
                        level
                    )
                `)
                .eq('id', user.id)
                .single();

            const userLevel = (profile as any)?.roles?.level || 99;

            if (userLevel > minLevel || userLevel < (maxLevel || 0)) {
                // Hierarchical: lower number is higher priority.
                // If userLevel (e.g. 5) > minLevel (e.g. 1), access denied.
                if (userLevel > minLevel) {
                    router.push('/unauthorized');
                    return;
                }
            }

            setHasAccess(true);
        };
        checkRole();
    }, [router, minLevel, maxLevel]);

    if (hasAccess === null) return <AuthLoader message="Verifying Permissions..." />;

    return <>{children}</>;
};

/**
 * Portal Specific Guards
 */
export const SuperAdminGuard = ({ children }: { children: React.ReactNode }) => (
    <RoleGuard minLevel={ROLE_LEVELS.SUPER_ADMIN}>{children}</RoleGuard>
);

export const AdminGuard = ({ children }: { children: React.ReactNode }) => (
    <RoleGuard minLevel={ROLE_LEVELS.VIEWER} maxLevel={ROLE_LEVELS.SUPER_ADMIN}>{children}</RoleGuard>
);

export const DealerGuard = ({ children }: { children: React.ReactNode }) => (
    <RoleGuard minLevel={ROLE_LEVELS.DEALER_STAFF} maxLevel={ROLE_LEVELS.DEALER_OWNER}>{children}</RoleGuard>
);

/**
 * SubscriptionGuard checks if a dealer has an active plan
 */
export const SubscriptionGuard = ({ children }: { children: React.ReactNode }) => {
    const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
    const router = useRouter();

    useEffect(() => {
        const checkSubscription = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            const { data: dealer } = await supabase
                .from('dealers')
                .select('status, subscription_status')
                .eq('owner_user_id', user.id) // Updated to owner_user_id as per database.md
                .single();

            if (!dealer || dealer.subscription_status !== 'active') {
                router.push('/dealer/subscription/renew');
            } else {
                setIsSubscribed(true);
            }
        };
        checkSubscription();
    }, [router]);

    if (isSubscribed === null) return <AuthLoader message="Checking Subscription..." />;

    return <>{children}</>;
};
