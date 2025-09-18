import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import sessionRoutes from "./routes/sessionRoutes";
import chatRoutes from "./routes/chatRoutes";
import { setupSwagger } from "./swagger";
import { initRedis } from "./services/redisService";

dotenv.config();

const app = express();
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"], // frontend dev server
    methods: ["GET", "POST"],
}));
app.use(express.json());

// Swagger
setupSwagger(app);

// Routes
app.use("/session", sessionRoutes);
app.use("/chat", chatRoutes);

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await initRedis(); // ✅ connect once before server starts
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error("❌ Failed to start server:", err);
        process.exit(1); // Exit if Redis fails
    }
}

startServer();