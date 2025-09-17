import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import sessionRoutes from "./routes/sessionRoutes";
import chatRoutes from "./routes/chatRoutes";
import { setupSwagger } from "./swagger";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Swagger
setupSwagger(app);

app.use("/session", sessionRoutes);
app.use("/chat", chatRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});