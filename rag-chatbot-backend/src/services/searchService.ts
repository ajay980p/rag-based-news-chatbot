import { Pinecone } from "@pinecone-database/pinecone";
import { embedText } from "./embedService";
import { config } from "../config/config";

const pinecone = new Pinecone({ apiKey: config.pineconeApiKey });
const index = pinecone.index(config.pineconeIndex);

export async function searchArticles(query: string, topK = 3) {
    const queryEmbedding = await embedText(query);

    const results = await index.query({
        vector: queryEmbedding,
        topK,
        includeMetadata: true
    });

    return results.matches.map((match: any) => ({
        score: match.score,
        title: match.metadata.title,
        content: match.metadata.content,
        url: match.metadata.url
    }));
}