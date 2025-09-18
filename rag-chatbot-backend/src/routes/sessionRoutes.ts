import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { setSession, clearSession, getSession } from "../services/redisService";

const router = Router();

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

        console.log(`🆕 New session started: ${sessionId}`);
        res.json({ sessionId });
    } catch (error) {
        console.error("❌ Error starting session:", error);
        res.status(500).json({ error: "Failed to start session" });
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
        const messages = await getSession(sessionId);

        if (messages === null) {
            console.log(`⚠️ Session not found or expired: ${sessionId}`);
            return res.status(404).json({ error: "Session expired or not found" });
        }

        console.log(`📜 Retrieved history for session: ${sessionId} (${messages.length} messages)`);
        res.json({ messages });
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