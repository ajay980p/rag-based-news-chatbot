/**
 * Session-related types and interfaces
 */

import type { ChatMessage } from './Chat';

export interface SessionResponse {
    sessionId: string;
}

export interface SessionHistoryResponse {
    messages: ChatMessage[];
}

export interface SessionMetadata {
    id: string;
    title: string;
    lastMessage: string;
    timestamp: string;
    messageCount: number;
}

export interface SessionListResponse {
    sessions: SessionMetadata[];
}