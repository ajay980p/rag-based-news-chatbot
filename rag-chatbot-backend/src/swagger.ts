import dotenv from "dotenv";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

dotenv.config();

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "RAG Chatbot API",
            version: "1.0.0",
            description: "API documentation for the RAG-powered news chatbot"
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT}`,
                description: "Local server"
            }
        ]
    },
    apis: ["./src/routes/*.ts"], // <-- Look for Swagger comments inside route files
};

const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app: Express) {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}