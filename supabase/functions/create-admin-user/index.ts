
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1?bundle";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

        // 1. Create a client with the user's token to validate them safely
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            console.error('Missing Authorization header');
            return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } },
        });

        // 2. Verify that the caller is logged in
        const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

        if (authError || !user) {
            console.error('Auth error:', authError);
            return new Response(JSON.stringify({ error: 'Unauthorized', details: authError?.message }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // 3. Create Admin Client for privileged operations
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                persistSession: false,
            },
        });

        // 4. Verify that the caller is an admin using Service Role (bypassing RLS for check)
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

        if (profileError || !profile || !['super_admin', 'admin'].includes(profile.role)) {
            console.error('Forbidden access attempt by:', user.id, 'Role:', profile?.role);
            return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), {
                status: 403,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // 5. Parse request body
        const { email, full_name, phone, role_id, role, password } = await req.json();

        if (!email || !full_name || !role_id) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Restriction: Regular Admins cannot create Admin/Super Admin users
        if (profile.role === 'admin' && ['super_admin', 'admin'].includes(role)) {
            return new Response(JSON.stringify({ error: 'Forbidden: Admins cannot create Admin level users' }), {
                status: 403,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // 6. Create user in auth.users
        const { data: newUser, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password: password || Math.random().toString(36).slice(-12),
            email_confirm: true,
            user_metadata: { full_name }
        });

        if (createAuthError) throw createAuthError;

        // 7. Create/Update profile in public.profiles
        // Note: The trigger might create it, but we want to ensure the role is set correctly immediately
        const { error: insertProfileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: newUser.user.id,
                email,
                full_name,
                phone,
                role_id,
                role, // Explicitly setting the role requested
                status: 'active'
            });

        if (insertProfileError) throw insertProfileError;

        return new Response(JSON.stringify({ data: newUser.user }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Unexpected error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
