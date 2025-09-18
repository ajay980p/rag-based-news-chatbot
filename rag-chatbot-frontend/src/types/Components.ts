/**
 * Component-specific types and interfaces
 */

export interface ChatSession {
    id: string;
    title: string;
    lastMessage: string;
    timestamp: Date;
    messageCount: number;
}