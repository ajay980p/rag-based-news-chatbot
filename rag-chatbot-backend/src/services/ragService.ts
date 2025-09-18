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
                answer: `I couldn't find any news articles that match your question. You might want to try asking about recent technology developments, startup news, government policies, or industry trends instead. Feel free to rephrase your question and I'll do my best to help!`,
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

        const prompt = `Based on these news articles, please provide a natural, conversational summary:

${contextBlock}

User Question: ${query}

Please write a response as if you're explaining the news to a friend. Focus on what's actually happening and why it matters, rather than just listing article titles. Make it sound human and engaging.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-exp",
            contents: prompt,
            config: {
                systemInstruction: `
                You are a knowledgeable news assistant that provides natural, conversational summaries.
                
                🎯 WRITING STYLE:
                - Start with friendly, natural openings like "Hey, I found some great [topic] news!" or "So here's what's happening with [topic]..."
                - Write in a natural, conversational tone as if explaining to a friend
                - Convert article titles into flowing, readable sentences
                - Explain WHY things matter, not just WHAT happened
                - Use everyday language, avoid jargon
                - Make connections between different news items when relevant
                
                ❌ DON'T:
                - Copy article titles verbatim
                - Use awkward phrases like "Here's what I found" or "Based on the articles"
                - Sound robotic or mechanical
                - Start with "According to" or formal language
                
                ✅ DO:
                - Start with "Hey, I found some great [topic] news!" or similar friendly openings
                - Explain news in simple, human terms
                - Add context about why developments matter
                - Write as if you're having a conversation
                - Use natural transitions between topics
                - Keep responses informative but easy to digest
                
                RESPONSE FORMAT:
                Start with a friendly intro like "Hey, I found some great AI news!" then explain the news naturally in 2-3 paragraphs, ending with an enthusiastic closing.
                `,
                maxOutputTokens: 800,
                temperature: 0.5
            },
        });

        const generationTime = Date.now() - generationStartTime;
        const totalTime = Date.now() - startTime;

        const rawAnswer = response.text || `I found some relevant articles but had trouble generating a proper response. You can check the sources below for the information, or try asking your question in a different way.`;

        // Post-process the answer to ensure consistent formatting
        const answer = enhanceResponseFormatting(rawAnswer);

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
            answer: `Sorry, I ran into a technical issue while processing your request. Could you try asking your question again? If the problem persists, you might want to rephrase your question or ask about a different topic.`,
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

/**
 * Enhance response formatting to ensure natural, conversational tone
 */
function enhanceResponseFormatting(text: string): string {
    // Remove any duplicate intro patterns that might have been added
    text = text.replace(/^Here's what I found:\s*/i, '');

    // If the response doesn't start naturally, add a simple intro
    if (!text.match(/^(hey|hi|so|based|according|from|looking|there|it|ai|the)/i)) {
        text = `Hey, I found some great news! ${text}`;
    }

    // Ensure friendly closing if none exists
    if (!text.match(/(hope|help|questions|more|else|further|exciting|pretty)/i)) {
        text += ` Let me know if you'd like to know more about any of these topics!`;
    }

    return text;
}