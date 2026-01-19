'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/', 'layout');
    redirect('/dashboard');
}

export async function signUp(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const businessName = formData.get('businessName') as string;
    const ownerName = formData.get('ownerName') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;

    // Separate names
    const nameParts = ownerName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    // Generate slug from business name
    const slug = businessName.toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

    // 1. Sign up the user in Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: ownerName,
                business_name: businessName,
                email: email,
            }
        }
    });

    if (authError || !user) {
        return { error: authError?.message || 'Failed to create account' };
    }

    // Role ID for 'customer' from our roles table (Dealers start as customers until approved)
    const CUSTOMER_ROLE_ID = '43498ddd-6416-4836-8590-17e4294bdd97';

    // 2. Call the RPC function to handle dealer/profile setup securely (bypasses RLS)
    const { error: rpcError } = await supabase.rpc('register_dealer_profile', {
        p_user_id: user.id,
        p_email: email,
        p_business_name: businessName,
        p_slug: `${slug}-${Math.random().toString(36).substring(2, 7)}`,
        p_phone: phone,
        p_address: address,
        p_owner_name: ownerName,
        p_first_name: firstName,
        p_last_name: lastName,
        p_role_id: CUSTOMER_ROLE_ID,
        p_role: 'customer'
    });

    if (rpcError) {
        return { error: `Registration setup failed: ${rpcError.message}` };
    }

    revalidatePath('/', 'layout');
    return { success: true };
}

export async function logout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath('/', 'layout');
    redirect('/login');
}

export async function resetPassword(email: string) {
    const supabase = await createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/reset-password`,
    });

    if (error) {
        return { error: error.message };
    }

    return { success: true };
}

export async function updatePassword(password: string) {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
        return { error: error.message };
    }

    return { success: true };
}
