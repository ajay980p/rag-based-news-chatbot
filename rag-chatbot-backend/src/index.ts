import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import sessionRoutes from "./routes/sessionRoutes";
import chatRoutes from "./routes/chatRoutes";
import { setupSwagger } from "./swagger";
import { initRedis } from "./services/redisService";
import { errorHandler, requestLogger } from "./middleware";
import { serverLogger } from "./utils/logger";
import { config } from "./config/config";

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: config.corsOrigins,
    methods: ["GET", "POST", "DELETE"],
}));
app.use(express.json());
app.use(requestLogger);

// Swagger
setupSwagger(app);

// Routes
app.use("/session", sessionRoutes);
app.use("/chat", chatRoutes);

// Error handling middleware (should be last)
app.use(errorHandler);

const PORT = config.port;

async function startServer() {
    try {
        await initRedis(); // ✅ connect once before server starts
        app.listen(PORT, () => {
            serverLogger.info(`Server running on port ${PORT}`);
        });
    } catch (err) {
        serverLogger.error("Failed to start server:", err);
        process.exit(1); // Exit if Redis fails
    }
}

startServer();