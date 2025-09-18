/**
 * Chat-related types and interfaces
 */

export interface Source {
    score: number;
    title: string;
    content: string;
    url?: string;
}

export interface RetrievedContext {
    passages: Source[];
    contextBlock: string;
    totalRetrieved: number;
}

export interface RAGResponse {
    answer: string;
    sources: Source[];
    context?: RetrievedContext;
    metadata?: {
        queryEmbedding?: number[];
        embedTime?: number;
        searchTime?: number;
        generationTime?: number;
        totalTime?: number;
        error?: string;
    };
}

export interface ChatMessage {
    role: "user" | "bot";
    content: string;
    timestamp: string;
    sources?: Source[];
}

export interface ChatRequest {
    query: string;
    sessionId?: string;
}

export interface ChatResponse {
    answer: string;
    sources: Source[];
    history?: ChatMessage[];
    context?: RetrievedContext;
    metadata?: {
        queryEmbedding?: number[];
        embedTime?: number;
        searchTime?: number;
        generationTime?: number;
        totalTime?: number;
        error?: string;
    };
}