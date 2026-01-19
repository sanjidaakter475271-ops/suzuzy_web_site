import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function decodeJwt(token: string) {
    try {
        const [header, payload, signature] = token.split('.');
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const decoder = new TextDecoder();
        const bin = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
        return JSON.parse(decoder.decode(bin));
    } catch (e) {
        console.error("JWT Decode Failure:", e);
        return null;
    }
}

function generateTempPassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const segment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `RC-${segment()}-${segment()}`;
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    try {
        console.log("Lifecycle Protocol Initiated");
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        const authHeader = req.headers.get('Authorization');
        if (!authHeader) throw new Error("Missing Authorization Header");

        const token = authHeader.replace('Bearer ', '');
        const payload = decodeJwt(token);
        if (!payload || !payload.sub) throw new Error("Invalid Authorization Payload");

        // Verify caller identity & clearance
        const { data: caller, error: callerError } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', payload.sub)
            .single();

        if (callerError || !caller || caller.role !== 'super_admin') {
            console.error("Unauthorized Lifecycle Attempt by:", payload.sub);
            throw new Error("Clearance Denied: Super Admin Authority Required");
        }

        const { action, target_user_id } = await req.json();

        if (!action || !target_user_id) {
            throw new Error("Invalid Parameter Protocol: Missing Action or Target");
        }

        if (action === 'delete') {
            console.log("Terminating Account:", target_user_id);
            const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(target_user_id);
            if (deleteError) throw deleteError;

            // Explicit profile hard-deletion
            await supabaseAdmin.from('profiles').delete().eq('id', target_user_id);

            return new Response(JSON.stringify({ message: "Account eradicated successfully" }), {
                status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (action === 'reset_password') {
            console.log("Resetting Credentials for:", target_user_id);
            const newPassword = generateTempPassword();

            // 1. Update Password in Auth System
            const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(target_user_id, {
                password: newPassword
            });
            if (authError) throw authError;

            // 2. Clear onboarding and set temp_password
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .update({
                    onboarding_completed: false,
                    temp_password: newPassword
                })
                .eq('id', target_user_id);

            if (profileError) throw profileError;

            return new Response(JSON.stringify({
                message: "Security credentials reset",
                new_password: newPassword
            }), {
                status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        throw new Error("Invalid Lifecycle Action: " + action);

    } catch (error: any) {
        console.error("Lifecycle Protocol Error:", error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
