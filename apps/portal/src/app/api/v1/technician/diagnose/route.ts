import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getCurrentTechnician } from '@/lib/auth/get-technician';

export async function POST(req: NextRequest) {
    try {
        // 1. Auth check
        const technician = await getCurrentTechnician();
        if (!technician || !technician.serviceStaffId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Parse request body
        const { description } = await req.json();
        if (!description) {
            return NextResponse.json({ success: false, error: 'Description is required' }, { status: 400 });
        }

        // 3. Initialize Gemini
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('[DIAGNOSE_API] Missing GEMINI_API_KEY in environment');
            return NextResponse.json({ success: false, error: 'AI Service currently unavailable' }, { status: 503 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are an expert senior automotive mechanic helper for a Suzuki motorcycle dealership.
        A service technician has described the following issue with a vehicle: "${description}".

        Provide a concise, bulleted list of potential causes and recommended diagnostic steps.
        Keep the tone professional and helpful. Keep it under 150 words.`;

        console.log('[DIAGNOSE_API] Generating content for technician:', technician.serviceStaffId);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({
            success: true,
            data: text
        });

    } catch (error: any) {
        console.error('[DIAGNOSE_API_ERROR]', error.message);
        return NextResponse.json({
            success: false,
            error: 'Internal Server Error',
            details: error.message
        }, { status: 500 });
    }
}
