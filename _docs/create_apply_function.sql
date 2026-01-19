-- Function allowing an existing Customer to apply for Dealership
-- Upgrades their profile by linking a new pending dealer record.

CREATE OR REPLACE FUNCTION public.apply_for_dealership(
    p_business_name text,
    p_phone text,
    p_address text,
    p_trade_license_no text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    v_user_id UUID;
    v_dealer_id UUID;
    v_slug TEXT;
BEGIN
    -- Get current user ID
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Generate a slug from business name + random suffix
    v_slug := lower(regexp_replace(p_business_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substring(md5(random()::text) from 1 for 6);

    -- 1. Create Dealer Record
    INSERT INTO public.dealers (
        id,
        business_name,
        slug,
        phone,
        address_line1,
        trade_license_no,
        owner_user_id,
        status,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        p_business_name,
        v_slug,
        p_phone,
        p_address,
        p_trade_license_no,
        v_user_id,
        'pending',
        now(),
        now()
    )
    RETURNING id INTO v_dealer_id;

    -- 2. Update Profile to link Dealer ID (This effectively puts them in "Pending Mode" per Guard logic)
    -- We do NOT change the role yet. They remain 'customer' until approved by admin.
    UPDATE public.profiles
    SET 
        dealer_id = v_dealer_id,
        updated_at = now()
    WHERE id = v_user_id;

    -- 3. Add to dealer_users (As Owner)
    INSERT INTO public.dealer_users (
        dealer_id,
        user_id,
        dealer_role,
        created_at,
        updated_at
    ) VALUES (
        v_dealer_id,
        v_user_id,
        'owner',
        now(),
        now()
    );

END;
$function$;
