import { useTheme } from './useTheme';
import { useSessions } from './useSessions';
import { useChat } from './useChat';
import { useSidebar } from './useSidebar';

/**
 * Main application hook that combines all chat functionality
 */
export const useApp = () => {
    // Theme management
    const { isDarkMode, toggleTheme } = useTheme();

    // Sidebar state
    const { isSidebarCollapsed, toggleSidebar } = useSidebar();

    // Session management
    const {
        currentChatId,
        messages,
        chatSessions,
        createNewSession,
        selectChat,
        deleteChat,
        resetChat,
        addMessage,
        setMessages,
        refreshSessions
    } = useSessions();

    // Chat functionality
    const { isTyping, sendMessage } = useChat(
        currentChatId,
        createNewSession,
        addMessage,
        setMessages,
        refreshSessions
    );

    // Event handlers
    const handleNewChat = async () => {
        await createNewSession();
    };

    const handleSelectChat = async (chatId: string) => {
        await selectChat(chatId);
    };

    const handleDeleteChat = (chatId: string) => {
        deleteChat(chatId);
    };

    const handleResetChat = async () => {
        await resetChat();
    };

    const handleSendMessage = async (text: string) => {
        await sendMessage(text);
    };

    const handleToggleTheme = () => {
        toggleTheme();
    };

    const handleToggleSidebar = () => {
        toggleSidebar();
    };

    return {
        // State
        currentChatId,
        messages,
        chatSessions: chatSessions || [],
        isTyping,
        isSidebarCollapsed,
        isDarkMode,

        // Event handlers
        handleNewChat,
        handleSelectChat,
        handleDeleteChat,
        handleResetChat,
        handleSendMessage,
        handleToggleTheme,
        handleToggleSidebar
    };
};