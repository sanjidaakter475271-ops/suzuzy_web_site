'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { MetallicText } from '@/components/ui/premium/MetallicText';
import { getRoleLevel } from '@/middlewares/checkRole';
import { PORTAL_CONFIG } from '@/lib/auth-config';
import { useAuth } from '@/hooks/useAuth';

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
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) return <AuthLoader />;

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
    const { user, loading } = useAuth();
    const router = useRouter();

    // Derived state for authorization
    const userRole = user?.role || 'customer';
    const isAuthorized = !!user && allowedRoles.includes(userRole);

    useEffect(() => {
        if (loading) return;

        if (!user) {
            router.push('/login');
            return;
        }

        if (!isAuthorized) {
            console.warn('Unauthorized access attempt. User role:', userRole);
            const userLevel = getRoleLevel(userRole);
            const redirectPath = getRedirectPath(userLevel);
            if (redirectPath) router.push(redirectPath);
        }
    }, [user, loading, router, isAuthorized, userRole]);

    if (loading || !isAuthorized) return <AuthLoader message="Verifying Permissions..." />;

    return <>{children}</>;
};

function getRedirectPath(level: number) {
    if (level === 1) return '/super-admin/dashboard';
    if (level >= 4 && level <= 5) return '/sales-admin/dashboard';
    if (level <= 7) return '/admin/dashboard';
    if (level <= 15) return '/dealer/dashboard';
    return '/login';
}

/**
 * Portal Specific Guards
 */
export const SuperAdminGuard = ({ children }: { children: React.ReactNode }) => (
    <RoleGuard allowedRoles={PORTAL_CONFIG.SUPER_ADMIN.allowedRoles}>{children}</RoleGuard>
);

export const AdminGuard = ({ children }: { children: React.ReactNode }) => (
    <RoleGuard allowedRoles={PORTAL_CONFIG.ADMIN.allowedRoles}>{children}</RoleGuard>
);

export const SalesAdminGuard = ({ children }: { children: React.ReactNode }) => (
    <RoleGuard allowedRoles={PORTAL_CONFIG.SALES_ADMIN.allowedRoles}>{children}</RoleGuard>
);

export const ServiceAdminGuard = ({ children }: { children: React.ReactNode }) => (
    <RoleGuard allowedRoles={PORTAL_CONFIG.SERVICE_ADMIN.allowedRoles}>{children}</RoleGuard>
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
    // For now we assume active if they have access, to avoid complex client-side DB fetches.
    // Proper subscription checks should be in Server Actions or Middleware.
    return <DealerGuard>{children}</DealerGuard>;
};
