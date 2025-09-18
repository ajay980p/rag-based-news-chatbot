import { GoogleGenAI } from "@google/genai";
import { config } from "../config/config";
import { searchArticles } from "./searchService";
import { chatLogger } from "../utils/logger";
import { RAGResponse, RetrievedContext, Source } from "../types/chat";

const ai = new GoogleGenAI({ apiKey: config.googleApiKey });

/**
 * RAG Pipeline Implementation
 * 
 * 1. User asks a question (e.g., "What is the top news today?")
 * 2. Embed the query - Convert the query into a vector using Gemini Embeddings
 * 3. Search the vector database (Pinecone) - Compare query embedding with stored news article embeddings
 * 4. Retrieve the top-k most relevant passages/articles (k = 3 or 5 usually)
 * 5. Build context - Concatenate retrieved passages into a "context block"
 * 6. Call Gemini API - Send user query + context block to Gemini
 * 7. Return result to user - The answer (Gemini's output) + optionally the retrieved sources
 */
export async function runRAGPipeline(query: string, topK: number = 3): Promise<RAGResponse> {
    const startTime = Date.now();

    try {
        chatLogger.info(`Starting RAG pipeline for query: "${query.substring(0, 100)}${query.length > 100 ? '...' : ''}"`);

        // Step 1: Query is already received
        // Step 2: Embed the query & Step 3: Search the vector database
        chatLogger.info('Step 1-3: Embedding query and searching vector database...');
        const { results: contextArticles, searchTime, embedTime } = await searchArticles(query, topK);

        if (!contextArticles.length) {
            chatLogger.warn('No relevant articles found for query');
            return {
                answer: "⚠️ No relevant articles found for your query. Please try rephrasing your question or ask about recent news topics.",
                sources: [],
                metadata: {
                    embedTime,
                    searchTime,
                    totalTime: Date.now() - startTime
                }
            };
        }

        // Step 4: Top-k most relevant passages already retrieved
        chatLogger.info(`Retrieved top ${contextArticles.length} most relevant articles`);

        // Step 5: Build context - Concatenate retrieved passages into a "context block"
        chatLogger.info('Step 4: Building context block from retrieved articles...');
        const contextBlock = buildContextBlock(contextArticles);

        const retrievedContext: RetrievedContext = {
            passages: contextArticles,
            contextBlock,
            totalRetrieved: contextArticles.length
        };

        // Step 6: Call Gemini API with user query + context block
        chatLogger.info('Step 5: Calling Gemini API with context and query...');
        const generationStartTime = Date.now();

        const prompt = `Context:
        ${contextBlock}

        User Query: ${query}

        Please answer the user's query using ONLY the information provided in the context above. If the answer cannot be found in the context, politely say no and suggest they ask about topics covered in the provided news articles.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-exp",
            contents: prompt,
            config: {
                systemInstruction: `
                You are an AI News Assistant. 
                Your role is to answer questions in a clear, natural, and conversational way,
                but always base your answers ONLY on the provided news context.

                Guidelines:
                - Use a friendly and professional tone, as if explaining news to a curious reader.
                - If the answer cannot be found in the context, politely explain that and suggest the user ask about topics covered in the news.
                - Do not invent or speculate beyond the provided context.
                - When relevant, weave in short references to specific articles or events from the context.
                - Keep answers informative yet easy to read (like a short news summary).
                `,
                maxOutputTokens: 1000,
                temperature: 0.4
            },
        });

        const generationTime = Date.now() - generationStartTime;
        const totalTime = Date.now() - startTime;

        const answer = response.text || "I couldn't generate a response. Please try again.";

        // Step 7: Return result to user
        chatLogger.info(`RAG pipeline completed successfully in ${totalTime}ms`, {
            embedTime,
            searchTime,
            generationTime,
            totalTime,
            articlesRetrieved: contextArticles.length,
            answerLength: answer.length
        });

        return {
            answer,
            sources: contextArticles,
            context: retrievedContext,
            metadata: {
                embedTime,
                searchTime,
                generationTime,
                totalTime: totalTime
            }
        };

    } catch (error) {
        const totalTime = Date.now() - startTime;
        chatLogger.error('RAG pipeline failed:', error);

        return {
            answer: "I apologize, but I encountered an error while processing your request. Please try again.",
            sources: [],
            metadata: {
                totalTime,
                error: error instanceof Error ? error.message : 'Unknown error'
            }
        };
    }
}

/**
 * Build context block from retrieved articles
 * Example format:
 * Context:
 * 1. Infosys launches AI platform.
 * 2. Stock market surges in tech.
 * 3. India announces new startup policy.
 */
function buildContextBlock(articles: Source[]): string {
    if (!articles.length) {
        return "No relevant context found.";
    }

    const contextEntries = articles.map((article, index) => {
        const title = article.title || 'Untitled';
        const content = article.content || 'No content available';
        const score = article.score ? ` (Relevance: ${(article.score * 100).toFixed(1)}%)` : '';

        return `${index + 1}. ${title}${score}
${content}`;
    });

    return contextEntries.join('\n\n');
}