export interface ChatMessage {
    role: "user" | "bot";
    content: string;
    timestamp: string; // ISO string
}

export interface ChatSession {
    sessionId: string;
    messages: ChatMessage[];
}