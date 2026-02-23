import { Capacitor } from '@capacitor/core';

/**
 * Unified environment variable access.
 * Handles both Vite and Expo environment variables with smart local fallbacks.
 */

const getPortalUrl = () => {
  // 1. Priority: User defined environment variable (from .env or .env.local)
  if (import.meta.env.VITE_PORTAL_API_URL) return import.meta.env.VITE_PORTAL_API_URL;

  // 2. Web Localhost: If running in a browser on localhost, default to local portal
  if (!Capacitor.isNativePlatform() && typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:3000';
    }
  }

  // 3. Default: Fallback to production Render URL
  return 'https://royal-suzuky-portal.onrender.com';
};

const getRealtimeUrl = () => {
  if (import.meta.env.VITE_REALTIME_URL) return import.meta.env.VITE_REALTIME_URL;

  if (!Capacitor.isNativePlatform() && typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3001';
    }
  }

  return 'https://suzuky-realtime.onrender.com';
};

export const ENV = {
  PORTAL_API_URL: getPortalUrl(),
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  REALTIME_URL: getRealtimeUrl(),
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
};
