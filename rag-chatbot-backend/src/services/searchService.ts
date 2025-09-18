import { Pinecone } from "@pinecone-database/pinecone";
import { embedQuery } from "./embedService";
import { config } from "../config/config";
import { chatLogger } from "../utils/logger";
import { Source } from "../types/chat";

const pinecone = new Pinecone({ apiKey: config.pineconeApiKey });
const index = pinecone.index(config.pineconeIndex);

export async function searchArticles(query: string, topK = 3): Promise<{
    results: Source[],
    searchTime: number,
    embedTime: number
}> {
    const startTime = Date.now();

    try {
        chatLogger.info(`Searching for articles with query: "${query}", topK: ${topK}`);

        // Step 1: Embed the query
        const { embedding: queryEmbedding, embedTime } = await embedQuery(query);

        // Step 2: Search the vector database
        const searchStartTime = Date.now();
        const results = await index.query({
            vector: queryEmbedding,
            topK,
            includeMetadata: true
        });
        const searchTime = Date.now() - searchStartTime;

        // Step 3: Format results
        const formattedResults: Source[] = results.matches.map((match: any) => ({
            score: match.score,
            title: match.metadata?.title || 'Untitled',
            content: match.metadata?.content || '',
            url: match.metadata?.url
        }));

        const totalTime = Date.now() - startTime;

        chatLogger.info(`Found ${formattedResults.length} articles in ${totalTime}ms (embed: ${embedTime}ms, search: ${searchTime}ms)`, {
            scores: formattedResults.map(r => r.score),
            titles: formattedResults.map(r => r.title)
        });

        return {
            results: formattedResults,
            searchTime,
            embedTime
        };
    } catch (error) {
        chatLogger.error('Error searching articles:', error);
        throw new Error(`Failed to search articles: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}