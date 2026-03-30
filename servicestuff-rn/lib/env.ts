import Constants from 'expo-constants';

export const ENV = {
  PORTAL_API_URL: Constants.expoConfig?.extra?.PORTAL_API_URL
    || 'https://royal-suzuky-portal.onrender.com',
  REALTIME_URL: Constants.expoConfig?.extra?.REALTIME_URL
    || 'https://suzuky-realtime.onrender.com',
  SUPABASE_URL: Constants.expoConfig?.extra?.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: Constants.expoConfig?.extra?.SUPABASE_ANON_KEY || '',
  GEMINI_API_KEY: Constants.expoConfig?.extra?.GEMINI_API_KEY || '',
};
