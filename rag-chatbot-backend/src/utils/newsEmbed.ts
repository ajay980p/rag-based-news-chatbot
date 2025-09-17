import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { Pinecone } from "@pinecone-database/pinecone";
import { embedText } from "../services/embedService"; // <-- your custom embedText file

dotenv.config();

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
});

const index = pinecone.index(process.env.PINECONE_INDEX!);

interface Article {
    title: string;
    description: string; // Changed from 'content' to match the JSON structure
    source: string;
    published_at: string;
}

async function main() {
    // Load JSON file
    const filePath = path.join(__dirname, "../../data/news.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    const articles: Article[] = data.articles; // Access the 'articles' array from the JSON
    console.log(`📑 Found ${articles.length} articles`);

    const vectors: any[] = [];

    for (let i = 0; i < articles.length; i++) {
        const article = articles[i];
        const text = `${article.title}. ${article.description}`; // Use 'description' instead of 'content'

        const values = await embedText(text);                       // 3072-dim embedding

        vectors.push({
            id: `article-${i}`, // Use index as ID since articles don't have IDs
            values,
            metadata: {
                title: article.title,
                description: article.description, // Use 'description' instead of 'content'
                source: article.source,
                published_at: article.published_at,
            },
        });
    }

    // Upsert into Pinecone
    await index.upsert(vectors);
    console.log(
        `✅ Inserted ${vectors.length} articles into Pinecone index: ${process.env.PINECONE_INDEX}`
    );
}

main().catch(console.error);