import type { Source } from './index';

export interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
    isStreaming?: boolean; // Flag to indicate if this message should stream
    sources?: Source[]; // Sources for bot messages
}