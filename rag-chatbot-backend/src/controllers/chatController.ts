import { Request, Response } from 'express';
import { chatLogger } from '../utils/logger';
import { runRAGPipeline } from '../services/ragService';
import {
    getSession,
    setSession,
    setSessionMetadata,
    getSessionMetadata
} from '../services/redisService';
import { MessagePair, ChatMessage } from '../types';// Helper function to generate chat title from first message
function generateChatTitle(firstMessage: string): string {
    const words = firstMessage.split(' ').slice(0, 6);
    return words.join(' ') + (firstMessage.split(' ').length > 6 ? '...' : '');
}

/**
 * Handle chat ask request with session support
 */
export const askChat = async (req: Request, res: Response) => {
    try {
        const { query, sessionId } = req.body;

        if (!query) {
            return res.status(400).json({ error: "Query is required" });
        }

        // If sessionId is provided, handle session-based chat
        if (sessionId) {
            // Get existing session history (array of MessagePair objects)
            const currentMessagePairs = await getSession(sessionId);

            if (currentMessagePairs === null) {
                chatLogger.warn(`Session not found: ${sessionId}`);
                return res.status(404).json({ error: "Session not found or expired" });
            }

            chatLogger.info(`Processing query for session ${sessionId}: ${query.substring(0, 50)}...`);

            // Run RAG pipeline to get bot response
            const ragResponse = await runRAGPipeline(query);
            const { answer, sources, context, metadata } = ragResponse;

            // Create new message pair
            const newMessagePair: MessagePair = {
                messageId: `${sessionId}_${Date.now()}`,
                user_content: query,
                user_timestamp: new Date().toISOString(),
                bot_content: answer || 'No response generated',
                bot_timestamp: new Date().toISOString(),
                bot_sources: sources || []
            };

            // Add new message pair to session
            const updatedMessagePairs = [...currentMessagePairs, newMessagePair];
            await setSession(sessionId, updatedMessagePairs, 86400); // 24-hour TTL

            // Update session metadata
            const chatTitle = currentMessagePairs.length === 0 ? generateChatTitle(query) :
                (await getSessionMetadata(sessionId))?.title || "Chat";

            await setSessionMetadata(sessionId, {
                title: chatTitle,
                lastMessage: query.substring(0, 50) + (query.length > 50 ? '...' : ''),
                timestamp: new Date().toISOString(),
                messageCount: updatedMessagePairs.length
            }, 86400);

            chatLogger.info(`Response generated for session ${sessionId}`, {
                messageCount: updatedMessagePairs.length,
                sourcesCount: sources?.length || 0,
                contextCount: context?.totalRetrieved || 0,
                totalTime: metadata?.totalTime || 0
            });

            // Convert to legacy format for frontend compatibility
            const legacyHistory: ChatMessage[] = [];
            updatedMessagePairs.forEach((pair: MessagePair) => {
                legacyHistory.push({
                    role: "user",
                    content: pair.user_content,
                    timestamp: pair.user_timestamp
                });
                legacyHistory.push({
                    role: "bot",
                    content: pair.bot_content,
                    timestamp: pair.bot_timestamp,
                    sources: pair.bot_sources
                });
            });

            res.json({
                answer,
                sources,
                history: legacyHistory,
                context,
                metadata
            });
        } else {
            // Handle query without session (backward compatibility)
            chatLogger.info(`Processing standalone query: ${query.substring(0, 50)}...`);
            const ragResponse = await runRAGPipeline(query);
            const { answer, sources, context, metadata } = ragResponse;

            res.json({
                answer,
                sources,
                context,
                metadata
            });
        }

    } catch (err) {
        chatLogger.error("Chat route error:", err);
        res.status(500).json({ error: "Failed to process query" });
    }
};