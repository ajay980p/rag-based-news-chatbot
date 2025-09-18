/**
 * Chat-related types and interfaces
 */

export interface Source {
    score: number;
    title: string;
    content: string;
    url?: string;
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
}