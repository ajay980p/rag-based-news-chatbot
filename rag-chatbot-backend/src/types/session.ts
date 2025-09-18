/**
 * Session-related types and interfaces
 */

import { Source } from './chat';

export interface MessagePair {
    messageId: string;
    user_content: string;
    user_timestamp: string;
    bot_content: string;
    bot_timestamp: string;
    bot_sources: Source[];
}

export interface SessionMetadata {
    title: string;
    lastMessage: string;
    timestamp: string;
    messageCount: number;
}

export interface SessionResponse {
    sessionId: string;
}

export interface SessionListResponse {
    sessions: Array<{
        id: string;
        title: string;
        lastMessage: string;
        timestamp: string;
        messageCount: number;
    }>;
}

export interface SessionHistoryResponse {
    messages: Array<{
        role: "user" | "bot";
        content: string;
        timestamp: string;
        sources?: Source[];
    }>;
}