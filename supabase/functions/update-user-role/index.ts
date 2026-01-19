
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
        console.log("Received request:", req.method);
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

        // 1. Validate Caller
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } },
        });

        const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // 2. Verify Caller Permissions
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        const { data: callerProfile, error: callerError } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

        if (callerError || !callerProfile || !['super_admin', 'admin'].includes(callerProfile.role)) {
            return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), {
                status: 403,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // 3. Parse Request
        const { userId, newRole } = await req.json();

        if (!userId || !newRole) {
            return new Response(JSON.stringify({ error: 'Missing userId or newRole' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Restrictions for regular Admins
        if (callerProfile.role === 'admin') {
            // Cannot promote to admin/super_admin
            if (['super_admin', 'admin'].includes(newRole)) {
                return new Response(JSON.stringify({ error: 'Forbidden: Admins cannot promote users to Admin level' }), {
                    status: 403,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }

            // Cannot modify existing admin/super_admin
            const { data: targetProfile } = await supabaseAdmin
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();

            if (targetProfile && ['super_admin', 'admin'].includes(targetProfile.role)) {
                return new Response(JSON.stringify({ error: 'Forbidden: Admins cannot modify other Admins' }), {
                    status: 403,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }
        }

        // 4. Update Profile
        const { data, error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId)
            .select()
            .single();

        console.log("Update result:", data, updateError);

        if (updateError) throw updateError;

        return new Response(JSON.stringify({ data }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Update error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
