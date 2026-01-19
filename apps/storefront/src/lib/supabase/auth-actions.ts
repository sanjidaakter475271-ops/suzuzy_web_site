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
    const fullName = formData.get('fullName') as string;
    const phone = formData.get('phone') as string;

    // 1. Sign up the user in Supabase Auth
    // The trigger 'on_auth_user_created' will automatically create the profile record
    const { data: { user }, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                fullName: fullName, // redundancy for safety
                phone: phone,
            }
        }
    });

    if (authError || !user) {
        return { error: authError?.message || 'Failed to create account' };
    }

    // No need to manually insert into profiles or dealers anymore.
    // The user is now a customer. They can apply for dealership later via the modal.

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
