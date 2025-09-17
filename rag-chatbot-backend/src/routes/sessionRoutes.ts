import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { setSession, clearSession, getSession } from "../services/redisService";

const router = Router();

/**
 * @openapi
 * /session/start:
 *   post:
 *     summary: Start a new chat session
 *     responses:
 *       200:
 *         description: Returns a new session ID
 */
router.post("/start", async (req, res) => {
    const sessionId = uuidv4();
    await setSession(sessionId, { messages: [] });
    res.json({ sessionId });
});

/**
 * @openapi
 * /session/{id}:
 *   get:
 *     summary: Get session history
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
 */
router.get("/:id", async (req, res) => {
    const history = await getSession(req.params.id);
    res.json(history || { messages: [] });
});

export default router;