import { Router } from "express";
import { runRAGPipeline } from "../services/ragService";

const router = Router();

/**
 * @openapi
 * /chat/ask:
 *   post:
 *     tags:
 *       - Chat
 *     summary: Ask a question to the RAG chatbot
 *     description: Takes a user query, retrieves relevant articles via RAG, and returns an AI-generated answer with sources.
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
 *     responses:
 *       200:
 *         description: Successful response containing the AI answer and supporting sources
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
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ error: "Query is required" });
        }

        const { answer, sources } = await runRAGPipeline(query);
        res.json({ answer, sources });
    } catch (err) {
        console.error("❌ Chat route error:", err);
        res.status(500).json({ error: "Failed to process query" });
    }
});


export default router;