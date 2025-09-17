import { config } from '../config/config';
import { GoogleGenAI } from "@google/genai";

export async function embedText(text: string): Promise<number[]> {
    if (!config.googleApiKey) {
        throw new Error('Google API key is not configured');
    }

    const ai = new GoogleGenAI({ apiKey: config.googleApiKey });
    const response = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: text,
        config: {
            outputDimensionality: 3072
        }
    });

    return response.embeddings?.[0]?.values || [];
}