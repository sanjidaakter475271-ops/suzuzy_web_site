import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const analyzeJobPhoto = async (imageUrl: string) => {
    // For Node.js environment, we need to fetch the image and convert to base64
    // since Gemini API expects image data for multi-modal prompts in many cases, 
    // or we can use the URL if we are using the newer models that support it.
    // However, the standard way is fetching the image.

    try {
        const response = await fetch(imageUrl);
        const buffer = await response.arrayBuffer();
        const base64Data = Buffer.from(buffer).toString("base64");

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            Analyze this photo of a motorcycle taken during a service check-in.
            Identify any visible external damage: scratches, dents, broken lights, worn tires, or oil leaks.
            Return the analysis in a structured JSON format with the following keys:
            - damage_found: boolean
            - damage_description: string (summary)
            - items: array of { part: string, severity: "low" | "medium" | "high", notes: string }
            - confidence_score: number (0-1)
            
            ONLY return the JSON object, no other text.
        `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: "image/jpeg"
                }
            }
        ]);

        const text = result.response.text();
        // Clean up the response from potential markdown backticks
        const jsonMatch = text.match(/\{[\s\S]*\} /);
        const jsonStr = jsonMatch ? jsonMatch[0] : text;

        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        throw error;
    }
};
