import { getCurrentUser } from "@/lib/auth/get-user";
import { redirect } from 'next/navigation';
import { getRoleLevel } from '@/lib/supabase/roles';

/**
 * Root Page Redirection Logic
 * Standardized on custom session detection.
 */
export default async function RootPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/login');
    }

    const role = user.role || "customer";
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
