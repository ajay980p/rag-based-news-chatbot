import dotenv from "dotenv";

// Load .env file
dotenv.config();

export const config = {
    port: process.env.PORT || 5500,
    googleApiKey: process.env.GEMINI_API_KEY || "",
    pineconeApiKey: process.env.PINECONE_API_KEY || "",
    pineconeIndex: process.env.PINECONE_INDEX || "news-index",
    redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
    corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ["http://localhost:5173", "http://localhost:5174"],
};