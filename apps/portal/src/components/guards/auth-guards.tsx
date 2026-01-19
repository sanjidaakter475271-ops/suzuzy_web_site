'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { MetallicText } from '@/components/ui/premium/MetallicText';
import { ROLE_LEVELS, getRoleLevel } from '@/lib/supabase/roles';
import { PORTAL_CONFIG } from '@/lib/auth-config';

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
    allowedRoles
}: {
    children: React.ReactNode;
    allowedRoles: string[];
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

            // Fetch user profile with roles join
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('role, onboarding_completed, roles(level, name)')
                .eq('id', user.id)
                .maybeSingle();

            if (error) {
                console.error('RoleGuard: Database error fetching profile:', error.message);
                router.push('/login');
                return;
            }

            if (!profile) {
                console.warn('RoleGuard: No profile found for user, redirecting to login');
                router.push('/login');
                return;
            }

            // Forced redirection to onboarding if not completed
            if (profile.onboarding_completed === false) {
                console.warn('RoleGuard: Onboarding not completed, redirecting');
                router.push('/onboarding');
                return;
            }

            const userRole = profile.role;
            const userLevel = getRoleLevel(userRole);

            console.log('RoleGuard check:', { userRole, userLevel, allowedRoles });

            // Check if user has one of the allowed roles
            if (allowedRoles.includes(userRole)) {
                setHasAccess(true);
            } else {
                console.warn('Unauthorized access attempt. User role:', userRole);
                // Redirect based on actual role to avoid being stuck
                if (userLevel === 1) {
                    router.push('/super-admin/dashboard');
                } else if (userLevel <= 5) {
                    router.push('/admin/dashboard');
                } else if (userLevel <= 12) {
                    router.push('/dealer/dashboard');
                } else {
                    router.push('/unauthorized');
                }
            }
        };
        checkRole();
    }, [router, allowedRoles]);

    if (hasAccess === null) return <AuthLoader message="Verifying Permissions..." />;

    return <>{children}</>;
};

/**
 * Portal Specific Guards
 */
export const SuperAdminGuard = ({ children }: { children: React.ReactNode }) => (
    <RoleGuard allowedRoles={PORTAL_CONFIG.SUPER_ADMIN.allowedRoles}>{children}</RoleGuard>
);

export const AdminGuard = ({ children }: { children: React.ReactNode }) => (
    <RoleGuard allowedRoles={PORTAL_CONFIG.ADMIN.allowedRoles}>{children}</RoleGuard>
);

export const DealerGuard = ({ children }: { children: React.ReactNode }) => {
    // We include 'dealer' for backward compatibility with existing DB records
    const allowedRoles = [...PORTAL_CONFIG.DEALER.allowedRoles, 'dealer', ...PORTAL_CONFIG.ADMIN.allowedRoles];
    return <RoleGuard allowedRoles={allowedRoles}>{children}</RoleGuard>;
};

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
                .maybeSingle();

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
