import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { ENV } from './env';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = ENV.SUPABASE_URL!;
const supabaseAnonKey = ENV.SUPABASE_ANON_KEY!;

// SecureStore adapter for Supabase persistence
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: false, // Disable as auth is handled by Portal API
    persistSession: false,
    detectSessionInUrl: false,
  },
  global: {
    headers: { 'x-application-name': 'servicemate-pro-mobile' },
  }
});
