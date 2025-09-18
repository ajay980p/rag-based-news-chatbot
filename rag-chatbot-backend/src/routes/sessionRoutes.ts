import { Router } from "express";
import {
    startSession,
    listSessions,
    getSessionHistory,
    resetSession,
    addMessage,
    debugSessions
} from "../controllers/sessionController";

const router = Router();

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
router.post("/start", startSession);

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
router.get("/list", listSessions);

/**
 * @openapi
 * /session/{id}/history:
 *   get:
 *     summary: Get session message history
 *     description: Retrieves all messages from the specified session
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Returns session message history
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
router.get("/:id/history", getSessionHistory);

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
router.post("/:id/reset", resetSession);

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
router.post("/:id/messages", addMessage);

// Debug endpoint
router.get("/debug", debugSessions);

export default router;