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


    // const prompt = `Answer the following query using ONLY the context provided.

    // Context: ${contextText}

    // Query: ${query}`;

    // Step 2: Call Gemini
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: query,
        config: {
            systemInstruction: `
                You are an AI News Chatbot. 
                Your task is to answer user questions ONLY using the provided news context. 
                - If the answer cannot be found in the context, politely ask the user to reframe their question related to the news. 
                - Do not generate information that is not present in the context. 
                - Always keep answers concise, factual, and news-focused.
                `
        },
    });

    const answer = response.text;

    return { answer, sources: contextArticles };
}