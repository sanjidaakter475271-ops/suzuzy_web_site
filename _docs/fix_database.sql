-- Fix for register_dealer_profile function due to mismatched column names
-- Problem: Original function tried to insert into 'name', 'contact_phone', 'address'
-- Solution: Update to use 'business_name', 'phone', 'address_line1' matching public.dealers

CREATE OR REPLACE FUNCTION public.register_dealer_profile(
    p_user_id uuid,
    p_email text,
    p_business_name text,
    p_slug text,
    p_phone text,
    p_address text,
    p_owner_name text,
    p_first_name text,
    p_last_name text,
    p_role_id uuid,
    p_role text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    v_dealer_id UUID;
BEGIN
    -- 1. Create Dealer Record
    -- FIXED: Changed column names to match public.dealers table
    INSERT INTO public.dealers (
        id,
        business_name,    -- WAS: name
        slug,
        phone,            -- WAS: contact_phone
        address_line1,    -- WAS: address
        owner_user_id,
        status,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        p_business_name,
        p_slug,
        p_phone,
        p_address,
        p_user_id,
        'pending',
        now(),
        now()
    )
    RETURNING id INTO v_dealer_id;

    -- 2. Upsert Profile (Ensure record exists and is populated)
    INSERT INTO public.profiles (
        id, 
        email, 
        first_name, 
        last_name, 
        full_name, 
        phone, 
        role_id, 
        role, 
        dealer_id, 
        status,
        created_at,
        updated_at
    ) VALUES (
        p_user_id, 
        COALESCE(p_email, ''), 
        p_first_name, 
        p_last_name, 
        p_owner_name, 
        p_phone, 
        p_role_id, 
        p_role, 
        v_dealer_id, 
        'pending',
        now(),
        now()
    )
    ON CONFLICT (id) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        role_id = EXCLUDED.role_id,
        role = EXCLUDED.role,
        dealer_id = EXCLUDED.dealer_id,
        status = EXCLUDED.status,
        email = CASE WHEN profiles.email IS NULL OR profiles.email = '' THEN EXCLUDED.email ELSE profiles.email END,
        updated_at = now();
END;
$function$;
