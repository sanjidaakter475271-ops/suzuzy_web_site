import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { redirect } from 'next/navigation';
import { getRoleLevel } from '@/lib/supabase/roles';

/**
 * Root Page Redirection Logic
 * Standardized on Better Auth session detection.
 */
export default async function RootPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        redirect('/login');
    }

    const role = (session.user as any).role || "customer";
    const level = getRoleLevel(role);

    // Platform Authority Redirection
    if (level === 1) {
        redirect('/super-admin/dashboard');
    } else if (level >= 3 && level <= 5) {
        // Sales Admin or specialized staff
        if (role.toLowerCase().includes('sales')) {
            redirect('/sales-admin/dashboard');
        } else {
            redirect('/admin/dashboard');
        }
    } else if (level <= 6) {
        // Other admin staff
        redirect('/admin/dashboard');
    } else if (level >= 10 && level <= 12) {
        // Dealer network
        redirect('/dealer/dashboard');
    } else {
        // Customers or unauthorized
        redirect('/unauthorized');
    }
}
