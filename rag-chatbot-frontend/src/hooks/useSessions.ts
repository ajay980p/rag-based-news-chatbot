import { useState, useEffect } from 'react';
import { startSession, getSessionHistory, resetSession, deleteSession, getAllSessions } from '../services/api';
import type { ChatSession, Message } from '../types';

/**
 * Custom hook for managing chat sessions
 */
export const useSessions = () => {
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);

    // Load all sessions on mount
    useEffect(() => {
        loadAllSessions();
    }, []);

    // Load session messages when currentChatId changes
    useEffect(() => {
        if (currentChatId) {
            loadSessionMessages(currentChatId);
        } else {
            setMessages([]);
        }
    }, [currentChatId]);

    const loadAllSessions = async () => {
        try {
            const sessions = await getAllSessions();
            // Convert the API response to our ChatSession format with safety checks
            const convertedSessions: ChatSession[] = sessions.map(session => ({
                id: session.id || '',
                title: session.title || 'Untitled Chat',
                lastMessage: session.lastMessage || '',
                timestamp: session.timestamp ? new Date(session.timestamp) : new Date(),
                messageCount: session.messageCount || 0
            }));
            setChatSessions(convertedSessions);
            console.log(`📋 Loaded ${convertedSessions.length} sessions from Redis`);
        } catch (error) {
            console.error('Failed to load sessions:', error);
            setChatSessions([]);
        }
    };

    const loadSessionMessages = async (sessionId: string) => {
        try {
            const chatMessages = await getSessionHistory(sessionId);
            // Convert Redis ChatMessage format to our Message format with safety checks
            const convertedMessages: Message[] = (chatMessages || []).map((msg, index) => ({
                id: `${sessionId}_${index}`,
                text: msg?.content || '',
                isUser: msg?.role === 'user',
                timestamp: msg?.timestamp ? new Date(msg.timestamp) : new Date(),
            }));
            setMessages(convertedMessages);
        } catch (error) {
            console.error('Failed to load session messages:', error);
            setMessages([]);
        }
    };

    const createNewSession = async (): Promise<string | null> => {
        try {
            const newSessionId = await startSession();
            console.log(`🆕 Created new Redis session with ID: ${newSessionId}`);
            setCurrentChatId(newSessionId);
            setMessages([]);
            // Reload sessions to include the new one
            await loadAllSessions();
            return newSessionId;
        } catch (error) {
            console.error('Failed to create new session:', error);
            return null;
        }
    };

    const selectChat = async (chatId: string) => {
        setCurrentChatId(chatId);
    };

    const deleteChat = async (chatId: string) => {
        try {
            await deleteSession(chatId);
            console.log(`🗑️ Deleted Redis session ${chatId}`);

            // Update local state
            if (currentChatId === chatId) {
                setCurrentChatId(null);
                setMessages([]);
            }

            // Remove from local sessions list and reload all sessions
            await loadAllSessions();
        } catch (error) {
            console.error('Failed to delete session:', error);
            // Optionally show user notification about failed deletion
        }
    };

    const resetChat = async () => {
        if (currentChatId) {
            try {
                await resetSession(currentChatId);
                setMessages([]);
                // Reload sessions to update metadata (message count, last message, etc.)
                await loadAllSessions();
                console.log(`🔄 Reset Redis session ${currentChatId}`);
            } catch (error) {
                console.error('Failed to reset session:', error);
            }
        }
    };

    const addMessage = (message: Message) => {
        setMessages(prev => [...prev, message]);
    };

    const refreshSessions = () => {
        return loadAllSessions();
    };

    return {
        // State
        currentChatId,
        messages,
        chatSessions,

        // Actions
        createNewSession,
        selectChat,
        deleteChat,
        resetChat,
        addMessage,
        setMessages,
        refreshSessions,
        loadSessionMessages
    };
};