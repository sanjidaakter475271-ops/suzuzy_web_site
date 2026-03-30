import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { ENV } from './env';

const supabaseUrl = ENV.SUPABASE_URL!;
const supabaseAnonKey = ENV.SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
