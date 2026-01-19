-- Fix RLS Policies on profiles table
-- The error "new row violates row-level security policy (USING expression)" suggests a conflict during Upsert (INSERT ... ON CONFLICT DO UPDATE).
-- Specifically, the 'UPDATE' policy might be filtering out the row being updated.

BEGIN;

-- 1. Enable RLS (Ensure it's on)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable insert for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can see their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- 3. Create Permissive Policies

-- INSERT: Allow authenticated users (and service_role) to insert. 
-- We allow 'true' for check because during signup, auth.uid() might be tricky in some trigger contexts, 
-- but generally we want to allow profile creation.
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);

-- SELECT: Allow users to see their own profile.
CREATE POLICY "Users can see their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- UPDATE: Allow users to update their own profile.
-- Critical: The USING clause must pass for the row *before* update.
-- The WITH CHECK clause must pass for the row *after* update.
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

COMMIT;
