import { Router } from "express";
import { runRAGPipeline } from "../services/ragService";
import { getSession, setSession } from "../services/redisService";

const router = Router();

interface MessagePair {
    messageId: string;
    user_content: string;
    user_timestamp: string;
    bot_content: string;
    bot_timestamp: string;
    bot_sources: Array<{
        score: number;
        title: string;
        content: string;
        url?: string;
    }>;
}

// Legacy interface for backward compatibility
interface ChatMessage {
    role: "user" | "bot";
    content: string;
    timestamp: string;
    sources?: Array<{
        score: number;
        title: string;
        content: string;
        url?: string;
    }>;
}

/**
 * @openapi
 * /chat/ask:
 *   post:
 *     tags:
 *       - Chat
 *     summary: Ask a question to the RAG chatbot with session support
 *     description: Takes a user query with sessionId, retrieves relevant articles via RAG, stores the conversation in Redis, and returns an AI-generated answer with sources and history.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 example: "What are today's highlights in Indian tech?"
 *               sessionId:
 *                 type: string
 *                 description: "Optional session ID. If not provided, works without session storage."
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Successful response containing the AI answer, supporting sources, and session history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 answer:
 *                   type: string
 *                   example: "Here are the top updates..."
 *                 sources:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       score:
 *                         type: number
 *                         format: float
 *                         example: 0.89
 *                       title:
 *                         type: string
 *                         example: "Infosys launches 'Pragati' AI platform"
 *                       content:
 *                         type: string
 *                         example: "Infosys unveiled a new AI platform..."
 *                       url:
 *                         type: string
 *                         nullable: true
 *                         example: "https://example.com/article"
 *                 history:
 *                   type: array
 *                   description: "Complete conversation history (only if sessionId provided)"
 *                   items:
 *                     type: object
 *                     properties:
 *                       role:
 *                         type: string
 *                         enum: [user, bot]
 *                       content:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                       sources:
 *                         type: array
 *       400:
 *         description: Bad request when the query is missing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Query is required"
 *       404:
 *         description: Session not found when sessionId is provided but doesn't exist
 *       500:
 *         description: Internal server error while processing the query
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to process query"
 */

router.post("/ask", async (req, res) => {
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
                console.log(`⚠️ Session not found: ${sessionId}`);
                return res.status(404).json({ error: "Session not found or expired" });
            }

            console.log(`💬 Processing query for session ${sessionId}: ${query.substring(0, 50)}...`);

            // Run RAG pipeline to get bot response
            const { answer, sources } = await runRAGPipeline(query);

            if (!answer) {
                throw new Error("RAG pipeline returned empty answer");
            }

            // Create new message pair
            const newMessagePair: MessagePair = {
                messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                user_content: query,
                user_timestamp: new Date().toISOString(),
                bot_content: answer,
                bot_timestamp: new Date().toISOString(),
                bot_sources: sources || []
            };

            // Add new message pair to history
            const updatedMessagePairs = [...currentMessagePairs, newMessagePair];
            await setSession(sessionId, updatedMessagePairs, 86400); // Refresh TTL

            console.log(`✅ Message pair added to session ${sessionId}: ${newMessagePair.messageId}`);

            // Convert to legacy format for backward compatibility with frontend
            const legacyHistory: ChatMessage[] = [];
            updatedMessagePairs.forEach(pair => {
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

            // Return response with legacy format for frontend compatibility
            res.json({
                answer,
                sources,
                history: legacyHistory
            });

        } else {
            // Session-less mode (backward compatibility)
            console.log(`🔄 Processing query without session: ${query.substring(0, 50)}...`);

            const { answer, sources } = await runRAGPipeline(query);
            res.json({ answer, sources });
        }

    } catch (err) {
        console.error("❌ Chat route error:", err);
        res.status(500).json({ error: "Failed to process query" });
    }
});

export default router;