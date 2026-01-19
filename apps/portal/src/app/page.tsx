import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getRoleLevel } from '@/lib/supabase/roles';

export default async function RootPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Role-based redirection logic for authenticated users
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, roles(level)')
        .eq('id', user.id)
        .maybeSingle();

    if (profile) {
        const level = getRoleLevel(profile.role);

        if (level === 1) {
            redirect('/super-admin/dashboard');
        } else if (level <= 5) {
            redirect('/admin/dashboard');
        } else if (level <= 12) {
            redirect('/dealer/dashboard');
        } else {
            // Customers should go to unauthorized page which has "Login Again" button + countdown
            redirect('/unauthorized');
        }
    }

    // Fallback redirect
    redirect('/login');
}
