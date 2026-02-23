import { createClient } from '@supabase/supabase-js';
import { ENV } from './env';

/**
 * Supabase Client: Shared with the main Portal for data synchronization.
 * 
 * DEPLOYMENT NOTES:
 * - VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY remain constant regardless of Render or VPS 
 *   as long as you use the same Supabase project.
 * - For VPS: Ensure the network configuration allows outbound requests to Supabase URLs.
 */
const supabaseUrl = ENV.SUPABASE_URL!;
const supabaseAnonKey = ENV.SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
