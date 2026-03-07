import { getCurrentUser } from "@/lib/auth/get-user";
import { redirect } from 'next/navigation';
import { PORTAL_CONFIG } from "@/lib/auth-config";

/**
 * Root Page Redirection Logic
 * Standardized on explicit role-to-dashboard mapping from PORTAL_CONFIG.
 */
export default async function RootPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/login');
    }

    const role = user.role || "customer";

    // Explicit Role Redirection based on PORTAL_CONFIG homeRoles
    if (PORTAL_CONFIG.SUPER_ADMIN.homeRoles.includes(role as any)) {
        redirect('/super-admin/dashboard');
    }

    if (PORTAL_CONFIG.ADMIN.homeRoles.includes(role as any)) {
        redirect('/admin/dashboard');
    }

    if (PORTAL_CONFIG.SHOWROOM.homeRoles.includes(role as any)) {
        redirect('/showroom-admin/dashboard');
    }

    if (PORTAL_CONFIG.SERVICE_ADMIN.homeRoles.includes(role as any)) {
        redirect('/service-admin/dashboard');
    }

    if (PORTAL_CONFIG.DEALER.homeRoles.includes(role as any)) {
        redirect('/dealer/dashboard');
    }

    if (PORTAL_CONFIG.CLIENTS.homeRoles.includes(role as any)) {
        redirect('/customer/dashboard');
    }

    // Default case for unknown roles or misconfigured accounts
    redirect('/unauthorized');
}
