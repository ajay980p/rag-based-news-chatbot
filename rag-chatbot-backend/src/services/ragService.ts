import { GoogleGenAI } from "@google/genai";
import { config } from "../config/config";
import { searchArticles } from "./searchService";

const ai = new GoogleGenAI({ apiKey: config.googleApiKey });

/**
 * RAG pipeline:
 *  1. Embed query & search Pinecone
 *  2. Build context
 *  3. Call Gemini with context + query
 */
export async function runRAGPipeline(query: string) {
    // Step 1: Retrieve top-k articles
    const contextArticles = await searchArticles(query, 3);

    if (!contextArticles.length) {
        return { answer: "⚠️ No relevant articles found.", sources: [] };
    }

    const contextText = contextArticles
        .map((a) => `Title: ${a.title}\n${a.content}`)
        .join("\n\n");

    // Step 2: Call Gemini

    const prompt = `Answer the following query using ONLY the context provided.
  
    Context: ${contextText}

    Query: ${query}`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });

    const answer = response.text;

    return { answer, sources: contextArticles };
}