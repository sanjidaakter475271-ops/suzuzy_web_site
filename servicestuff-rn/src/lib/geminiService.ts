import axios from 'axios';
import { ENV } from "@/lib/env";
import * as SecureStore from 'expo-secure-store';

export const diagnoseIssue = async (issueDescription: string): Promise<string> => {
    try {
        console.log('[GEMINI_CLIENT] Requesting diagnosis from backend for:', issueDescription);

        const token = await SecureStore.getItemAsync('auth_token');
        const response = await axios.post(`${ENV.PORTAL_API_URL}/api/v1/technician/diagnose`,
            { description: issueDescription },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data?.success) {
            return response.data.data || "No diagnosis available.";
        }

        return "Failed to retrieve diagnosis from server.";
    } catch (error: any) {
        console.error("Gemini API Client Error:", error);
        return `Error: ${error.response?.data?.error || error.message || 'Check connection'}`;
    }
};
