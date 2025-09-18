import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { setSession, clearSession, getSession, setSessionMetadata, getSessionMetadata, getAllSessions, debugRedisState } from "../services/redisService";

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

interface ChatMessage {
    role: "user" | "bot";
    content: string;
    timestamp?: string;
    sources?: Array<{
        score: number;
        title: string;
        content: string;
        url?: string;
    }>;
}

/**
 * @openapi
 * /session/start:
 *   post:
 *     summary: Start a new chat session
 *     description: Creates a new session with a unique sessionId and empty message history
 *     responses:
 *       200:
 *         description: Returns a new session ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessionId:
 *                   type: string
 *                   description: Unique session identifier
 */
router.post("/start", async (req, res) => {
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

        console.log(`🆕 New session started: ${sessionId}`);
        res.json({ sessionId });
    } catch (error) {
        console.error("❌ Error starting session:", error);
        res.status(500).json({ error: "Failed to start session" });
    }
});

/**
 * @openapi
 * /session/list:
 *   get:
 *     summary: Get all chat sessions
 *     description: Retrieves a list of all chat sessions with metadata (title, last message, timestamp, message count)
 *     responses:
 *       200:
 *         description: Returns list of all chat sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Session ID
 *                       title:
 *                         type: string
 *                         description: Session title (derived from first message)
 *                       lastMessage:
 *                         type: string
 *                         description: Preview of the last message
 *                       timestamp:
 *                         type: string
 *                         description: Last activity timestamp
 *                       messageCount:
 *                         type: number
 *                         description: Total number of message pairs
 */
router.get("/list", async (req, res) => {
    try {
        const sessions = await getAllSessions();
        console.log(`📋 Listing ${sessions.length} sessions`);
        res.json({ sessions });
    } catch (error) {
        console.error("❌ Error listing sessions:", error);
        res.status(500).json({ error: "Failed to retrieve sessions" });
    }
});

// Debug endpoint to inspect Redis state
router.get("/debug", async (req, res) => {
    try {
        await debugRedisState();
        res.json({ message: "Debug info logged to console" });
    } catch (error) {
        console.error("❌ Error debugging Redis state:", error);
        res.status(500).json({ error: "Failed to debug Redis state" });
    }
});

/**
 * @openapi
 * /session/{id}/history:
 *   get:
 *     summary: Get chat history for a session
 *     description: Retrieves all messages for the specified session
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Returns chat history for the session
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
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
 *       404:
 *         description: Session expired or not found
 */
router.get("/:id/history", async (req, res) => {
    try {
        const sessionId = req.params.id;
        const messagePairs = await getSession(sessionId);

        if (messagePairs === null) {
            console.log(`⚠️ Session not found or expired: ${sessionId}`);
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

        console.log(`📜 Retrieved history for session: ${sessionId} (${messagePairs.length} message pairs, ${legacyMessages.length} legacy messages)`);
        res.json({ messages: legacyMessages });
    } catch (error) {
        console.error("❌ Error retrieving session history:", error);
        res.status(500).json({ error: "Failed to retrieve session history" });
    }
});

/**
 * @openapi
 * /session/{id}/reset:
 *   post:
 *     summary: Reset a chat session
 *     description: Clears all messages from the specified session
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Session successfully reset
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Session not found
 */
router.post("/:id/reset", async (req, res) => {
    try {
        const sessionId = req.params.id;

        // Check if session exists
        const existingSession = await getSession(sessionId);
        if (existingSession === null) {
            console.log(`⚠️ Attempted to reset non-existent session: ${sessionId}`);
            return res.status(404).json({ error: "Session not found" });
        }

        // Reset session with empty array and refresh TTL
        await setSession(sessionId, [], 86400);

        // Update session metadata to reflect reset state
        const currentMetadata = await getSessionMetadata(sessionId);
        if (currentMetadata) {
            await setSessionMetadata(sessionId, {
                title: currentMetadata.title || "New Chat", // Keep the title
                lastMessage: "", // Clear last message
                timestamp: new Date().toISOString(), // Update timestamp
                messageCount: 0 // Reset message count
            }, 86400);
        }

        console.log(`🔄 Session reset: ${sessionId}`);
        res.json({
            success: true,
            message: "Session successfully reset"
        });
    } catch (error) {
        console.error("❌ Error resetting session:", error);
        res.status(500).json({ error: "Failed to reset session" });
    }
});

/**
 * @openapi
 * /session/{id}/messages:
 *   post:
 *     summary: Add a message to session history
 *     description: Appends a new message to the session's message history
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Session ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, bot]
 *               content:
 *                 type: string
 *               sources:
 *                 type: array
 *     responses:
 *       200:
 *         description: Message successfully added
 *       404:
 *         description: Session not found
 */
router.post("/:id/messages", async (req, res) => {
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
            console.log(`⚠️ Attempted to add message to non-existent session: ${sessionId}`);
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

        console.log(`💬 Message added to session ${sessionId}: ${role} - ${content.substring(0, 50)}...`);
        res.json({
            success: true,
            message: "Message added successfully",
            messageCount: updatedMessages.length
        });
    } catch (error) {
        console.error("❌ Error adding message to session:", error);
        res.status(500).json({ error: "Failed to add message to session" });
    }
});

export default router;