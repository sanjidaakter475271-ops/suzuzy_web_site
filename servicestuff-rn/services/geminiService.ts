import { GoogleGenAI } from "@google/genai";
import { ENV } from "../lib/env";

export const diagnoseIssue = async (issueDescription: string): Promise<string> => {
    // Note: ENV.GEMINI_API_KEY is mapped from Constants.expoConfig?.extra?.GEMINI_API_KEY in lib/env.ts
    const ai = new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY });

    try {
        console.log('[GEMINI] Requesting diagnosis for:', issueDescription);
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash', // Using 1.5 flash as 3-flash might be preview/restricted
            contents: [{
                role: 'user',
                parts: [{
                    text: `You are an expert senior automotive mechanic helper for a Suzuki dealership.
                    A service technician has described the following issue with a vehicle: "${issueDescription}".

                    Provide a concise, bulleted list of potential causes and recommended diagnostic steps.
                    Keep the tone professional and helpful. Keep it under 150 words.`
                }]
            }],
        });

        // The next-gen SDK response structure usually has a text() method or candidates
        // Based on common patterns for this library:
        return response.candidates?.[0]?.content?.parts?.[0]?.text || "No diagnosis available at this time.";
    } catch (error: any) {
        console.error("Gemini API Error:", error);
        return `Failed to retrieve diagnosis: ${error.message || 'Check connection'}`;
    }
};
