import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simplified JWT decode for Deno
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
        console.log("Creation Protocol Initiated");
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
            console.error("Unauthorized Access Attempt by:", payload.sub);
            throw new Error("Clearance Denied: Super Admin Authority Required");
        }

        const body = await req.json();
        const { email, full_name, phone, role_id, role } = body;

        if (!email || !full_name || !role) {
            throw new Error("Invalid Parameter Protocol: Missing Required Fields");
        }

        console.log("Authorizing Personnel:", email);
        const tempPassword = generateTempPassword();

        // 1. Create Auth Account
        const { data: newUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: { full_name }
        });

        if (authError) {
            console.error("Auth Component Error:", authError.message);
            throw authError;
        }

        // 2. Provision Profile
        const profileData: any = {
            id: newUser.user.id,
            email,
            full_name,
            phone: phone || null,
            role,
            status: 'active',
            onboarding_completed: false,
            temp_password: tempPassword
        };

        // Add role_id if it's a valid uuid, otherwise omit
        if (role_id && role_id.length === 36) {
            profileData.role_id = role_id;
        }

        const { error: syncError } = await supabaseAdmin
            .from('profiles')
            .upsert(profileData);

        if (syncError) {
            console.error("Profile Synchronization Error:", syncError.message);
            throw syncError;
        }

        return new Response(JSON.stringify({
            message: 'Authorization Success',
            userId: newUser.user.id,
            generatedPassword: tempPassword
        }), {
            status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        console.error("Critical Protocol Failure:", error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
