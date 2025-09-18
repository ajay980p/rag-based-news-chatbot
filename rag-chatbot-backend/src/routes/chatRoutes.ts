import { Router } from "express";
import { askChat } from "../controllers/chatController";

const router = Router();

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

router.post("/ask", askChat);

export default router;