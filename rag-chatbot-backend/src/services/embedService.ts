import { config } from '../config/config';
import { GoogleGenAI } from "@google/genai";
import { chatLogger } from '../utils/logger';

export async function embedText(text: string): Promise<number[]> {
    const startTime = Date.now();

    if (!config.googleApiKey) {
        throw new Error('Google API key is not configured');
    }

    if (!text.trim()) {
        throw new Error('Text input cannot be empty');
    }

    try {
        chatLogger.info(`Embedding text: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"`);

        const ai = new GoogleGenAI({ apiKey: config.googleApiKey });
        const response = await ai.models.embedContent({
            model: 'gemini-embedding-001',
            contents: text,
            config: {
                outputDimensionality: 3072
            }
        });

        const embeddings = response.embeddings?.[0]?.values || [];

        if (embeddings.length === 0) {
            throw new Error('No embeddings received from Gemini API');
        }

        const endTime = Date.now();
        chatLogger.info(`Text embedding completed in ${endTime - startTime}ms, dimension: ${embeddings.length}`);

        return embeddings;
    } catch (error) {
        chatLogger.error('Error embedding text:', error);
        throw new Error(`Failed to embed text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function embedQuery(query: string): Promise<{ embedding: number[]; embedTime: number }> {
    const startTime = Date.now();

    try {
        const embedding = await embedText(query);
        const embedTime = Date.now() - startTime;

        chatLogger.info(`Query embedded successfully in ${embedTime}ms`);

        return { embedding, embedTime };
    } catch (error) {
        chatLogger.error('Error embedding query:', error);
        throw error;
    }
}