/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client: Shared with the main Portal for data synchronization.
 * 
 * DEPLOYMENT NOTES:
 * - VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY remain constant regardless of Render or VPS 
 *   as long as you use the same Supabase project.
 * - For VPS: Ensure the network configuration allows outbound requests to Supabase URLs.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
