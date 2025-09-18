import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { sessionLogger } from '../utils/logger';
import {
    setSession,
    clearSession,
    getSession,
    setSessionMetadata,
    getSessionMetadata,
    getAllSessions,
    debugRedisState
} from '../services/redisService';
import { MessagePair, ChatMessage } from '../types';/**
 * Start a new chat session
 */
export const startSession = async (req: Request, res: Response) => {
    try {
        const sessionId = uuidv4();

        // Create new session with empty message array and 24-hour TTL
        await setSession(sessionId, [], 86400); // 24 hours = 86400 seconds

        // Create initial metadata
        await setSessionMetadata(sessionId, {
            title: "New Chat",
            lastMessage: "",
            timestamp: new Date().toISOString(),
            messageCount: 0
        }, 86400);

        sessionLogger.info(`New session started: ${sessionId}`);
        res.json({ sessionId });
    } catch (error) {
        sessionLogger.error("Error starting session:", error);
        res.status(500).json({ error: "Failed to start session" });
    }
};

/**
 * Get all chat sessions
 */
export const listSessions = async (req: Request, res: Response) => {
    try {
        const sessions = await getAllSessions();
        sessionLogger.info(`Listing ${sessions.length} sessions`);
        res.json({ sessions });
    } catch (error) {
        sessionLogger.error("Error listing sessions:", error);
        res.status(500).json({ error: "Failed to retrieve sessions" });
    }
};

/**
 * Get session history
 */
export const getSessionHistory = async (req: Request, res: Response) => {
    try {
        const sessionId = req.params.id;
        const messagePairs = await getSession(sessionId);

        if (messagePairs === null) {
            sessionLogger.warn(`Session not found or expired: ${sessionId}`);
            return res.status(404).json({ error: "Session expired or not found" });
        }

        // Convert MessagePair format to legacy ChatMessage format for frontend compatibility
        const legacyMessages: ChatMessage[] = [];
        messagePairs.forEach((pair: MessagePair) => {
            legacyMessages.push({
                role: "user",
                content: pair.user_content,
                timestamp: pair.user_timestamp
            });
            legacyMessages.push({
                role: "bot",
                content: pair.bot_content,
                timestamp: pair.bot_timestamp,
                sources: pair.bot_sources
            });
        });

        sessionLogger.info(`Retrieved history for session: ${sessionId}`, {
            messagePairs: messagePairs.length,
            legacyMessages: legacyMessages.length
        });

        res.json({ messages: legacyMessages });
    } catch (error) {
        sessionLogger.error("Error retrieving session history:", error);
        res.status(500).json({ error: "Failed to retrieve session history" });
    }
};

/**
 * Reset a chat session
 */
export const resetSession = async (req: Request, res: Response) => {
    try {
        const sessionId = req.params.id;

        // Check if session exists
        const currentSession = await getSession(sessionId);
        if (currentSession === null) {
            sessionLogger.warn(`Attempted to reset non-existent session: ${sessionId}`);
            return res.status(404).json({ error: "Session not found" });
        }

        // Reset session with empty message array but keep the session alive
        await setSession(sessionId, [], 86400); // 24-hour TTL

        // Update metadata to reflect reset
        await setSessionMetadata(sessionId, {
            title: "New Chat",
            lastMessage: "",
            timestamp: new Date().toISOString(),
            messageCount: 0
        }, 86400);

        sessionLogger.info(`Reset session ${sessionId}`);
        res.json({
            success: true,
            message: "Session successfully reset"
        });
    } catch (error) {
        sessionLogger.error("Error resetting session:", error);
        res.status(500).json({ error: "Failed to reset session" });
    }
};

/**
 * Add a message to session history
 */
export const addMessage = async (req: Request, res: Response) => {
    try {
        const sessionId = req.params.id;
        const { role, content, sources } = req.body;

        if (!role || !content) {
            return res.status(400).json({ error: "Role and content are required" });
        }

        if (!["user", "bot"].includes(role)) {
            return res.status(400).json({ error: "Role must be 'user' or 'bot'" });
        }

        // Get current messages
        const currentMessages = await getSession(sessionId);
        if (currentMessages === null) {
            sessionLogger.warn(`Attempted to add message to non-existent session: ${sessionId}`);
            return res.status(404).json({ error: "Session not found" });
        }

        // Create new message
        const newMessage: ChatMessage = {
            role: role as "user" | "bot",
            content,
            timestamp: new Date().toISOString(),
            ...(sources && { sources })
        };

        // Add message and update session with refreshed TTL
        const updatedMessages = [...currentMessages, newMessage];
        await setSession(sessionId, updatedMessages, 86400);

        sessionLogger.info(`Message added to session ${sessionId}`, {
            role,
            contentPreview: content.substring(0, 50)
        });

        res.json({
            success: true,
            message: "Message added successfully",
            messageCount: updatedMessages.length
        });
    } catch (error) {
        sessionLogger.error("Error adding message to session:", error);
        res.status(500).json({ error: "Failed to add message to session" });
    }
};

/**
 * Debug endpoint to inspect Redis state
 */
export const debugSessions = async (req: Request, res: Response) => {
    try {
        const debugInfo = await debugRedisState();
        sessionLogger.debug("Redis debug information retrieved");
        res.json({ debug: "Check server logs for Redis state information" });
    } catch (error) {
        sessionLogger.error("Error debugging Redis state:", error);
        res.status(500).json({ error: "Failed to debug Redis state" });
    }
};