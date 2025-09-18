import { useState } from 'react';
import { askChat } from '../services/api';
import type { Message } from '../types';
import { formatBotResponse } from '../utils/messageFormatters';

/**
 * Custom hook for handling chat messages and typing state
 */
export const useChat = (
    currentChatId: string | null,
    createNewSession: () => Promise<string | null>,
    addMessage: (message: Message) => void,
    refreshSessions: () => Promise<void>
) => {
    const [isTyping, setIsTyping] = useState(false);

    const sendMessage = async (text: string) => {
        let sessionId = currentChatId;

        // Create new session if none exists
        if (!sessionId) {
            setIsTyping(true);
            sessionId = await createNewSession();
            setIsTyping(false);

            if (!sessionId) {
                return;
            }
        }

        const userMessage: Message = {
            id: `${sessionId}_${Date.now()}`,
            text,
            isUser: true,
            timestamp: new Date(),
        };

        // Optimistically update UI
        addMessage(userMessage);
        setIsTyping(true);

        console.log(`💬 Sending message to Redis session ${sessionId}: ${text}`);

        try {
            // Send message to backend with session ID
            const response = await askChat(text, sessionId);
            console.log(`🤖 Bot response received:`, response);

            const botMessage: Message = {
                id: `${sessionId}_${Date.now() + 1}`,
                text: formatBotResponse(response.answer, response.sources),
                isUser: false,
                timestamp: new Date(),
            };

            addMessage(botMessage);
            setIsTyping(false);

            // Reload sessions to update metadata (title, last message, etc.)
            await refreshSessions();

            console.log(`✅ Messages updated successfully in Redis session`);

        } catch (error) {
            console.error('❌ Failed to get response from backend:', error);

            const errorMessage: Message = {
                id: `${sessionId}_${Date.now() + 1}`,
                text: `❌ **Error**: ${error instanceof Error ? error.message : 'Unable to connect to the news service. Please check if the backend server is running.'}\n\nPlease try again or contact support if the issue persists.`,
                isUser: false,
                timestamp: new Date(),
            };

            addMessage(errorMessage);
            setIsTyping(false);
        }
    };

    return {
        isTyping,
        sendMessage
    };
};