import { Router } from "express";
import { getSession, setSession } from "../services/redisService";

const router = Router();

/**
 * @openapi
 * /chat/{id}/message:
 *   post:
 *     summary: Send a message to the chatbot
 *     description: Sends a user message to the chatbot, stores it in Redis, and returns the bot reply along with session history.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The session ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "What is the latest news in tech?"
 *     responses:
 *       200:
 *         description: Bot reply and updated session history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reply:
 *                   type: string
 *                   example: "You said: What is the latest news in tech?"
 *                 history:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       role:
 *                         type: string
 *                         enum: [user, bot]
 *                       content:
 *                         type: string
 */
router.post("/:id/message", async (req, res) => {
    const { message } = req.body;
    const sessionId = req.params.id;

    let session = await getSession(sessionId);
    if (!session) session = { messages: [] };

    // store user message
    session.messages.push({ role: "user", content: message });

    // mock bot reply (replace later with Gemini RAG)
    const botReply = `You said: ${message}`;
    session.messages.push({ role: "bot", content: botReply });

    await setSession(sessionId, session);

    res.json({ reply: botReply, history: session.messages });
});

export default router;