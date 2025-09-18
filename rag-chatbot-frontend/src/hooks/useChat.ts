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
        // Set typing immediately to switch to ChatScreen
        setIsTyping(true);

        let sessionId = currentChatId;

        // Create new session if none exists
        if (!sessionId) {
            sessionId = await createNewSession();

            if (!sessionId) {
                setIsTyping(false);
                return;
            }
        }

        // Create user message after session is ready
        const userMessage: Message = {
            id: `${sessionId}_${Date.now()}`,
            text,
            isUser: true,
            timestamp: new Date(),
        };

        // Add user message to show in chat
        addMessage(userMessage);

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
                isStreaming: true, // Enable streaming for new bot responses
                sources: response.sources, // Preserve original sources array
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
                isStreaming: false, // Don't stream error messages
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