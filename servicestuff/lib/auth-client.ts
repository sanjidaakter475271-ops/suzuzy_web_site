/// <reference types="vite/client" />
import { createAuthClient } from "better-auth/react";

/**
 * authClient: Connects to the main Portal's Better Auth API.
 * 
 * DEPLOYMENT NOTES:
 * - Render: Make sure VITE_PORTAL_API_URL is set to your Portal's .onrender.com URL.
 * - VPS: When migrating to a VPS, update the URL to your custom domain (e.g., https://api.suzuky.com) 
 *   or the static IP address of your server.
 */
export const authClient = createAuthClient({
    baseURL: import.meta.env.VITE_PORTAL_API_URL,
});
