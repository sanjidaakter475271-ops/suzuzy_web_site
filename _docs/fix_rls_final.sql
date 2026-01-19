-- Final RLS Fix
-- The previous policy `USING (auth.uid() = id)` blocks the `postgres` user (Trigger/RPC) 
-- because `auth.uid()` is null in that context, and `postgres` might be respecting RLS due to setup.

BEGIN;

-- Drop previous attempts
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create robust UPDATE policy
-- Allows update if:
-- 1. User owns the row (auth.uid() = id)
-- 2. OR User is service_role (Admin API)
-- 3. OR User is postgres (System/Triggers)
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (
    (auth.uid() = id) OR 
    (current_user IN ('postgres', 'service_role', 'supabase_admin'))
)
WITH CHECK (
    (auth.uid() = id) OR 
    (current_user IN ('postgres', 'service_role', 'supabase_admin'))
);

COMMIT;
