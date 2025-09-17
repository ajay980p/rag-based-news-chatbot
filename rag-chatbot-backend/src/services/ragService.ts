import { GoogleGenAI } from "@google/genai";

interface RAGResponse {
    answer: string;
    context: string[];
}

export async function runRAGPipeline(query: string): Promise<RAGResponse> {
    // 1) Retrieve context from your vector DB (placeholder for now)
    const retrievedContext = [
        "Breaking news: Stock market surges today.",
        "Technology sector shows strong growth in Q3."
    ];

    // 2) Build a grounded prompt
    const prompt =
        `Answer the user query using ONLY the context below. If the answer isn't in the context, say you don't know.\n\n` +
        `Context:\n${retrievedContext.join("\n")}\n\n` +
        `Query: ${query}`;

    try {
        // The client will auto-read GEMINI_API_KEY (or GOOGLE_API_KEY) from env,
        // or you can pass it explicitly: new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
        });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",          // fast & cheap; switch to 2.5-pro if you prefer
            contents: prompt
        });

        const answer = response.text ?? "No answer from Gemini.";
        return { answer, context: retrievedContext };
    } catch (err) {
        console.error("RAG pipeline error:", err);
        return { answer: "⚠️ Error generating answer. Please try again.", context: [] };
    }
}