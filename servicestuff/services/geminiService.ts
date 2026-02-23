import { GoogleGenAI } from "@google/genai";
import { ENV } from "../lib/env";

export const diagnoseIssue = async (issueDescription: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert senior automotive mechanic helper. 
      A service staff member has described the following issue with a vehicle: "${issueDescription}".
      
      Provide a concise, bulleted list of potential causes and recommended diagnostic steps. 
      Keep the tone professional and helpful. Keep it under 150 words.`,
    });

    return response.text || "No diagnosis available.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to retrieve diagnosis. Please check internet connection.";
  }
};