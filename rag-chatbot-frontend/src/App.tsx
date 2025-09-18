import { useState, useEffect } from 'react';
import ChatHeader from './components/ChatHeader';
import ChatScreen from './components/ChatScreen';
import ChatInput from './components/ChatInput';
import WelcomeScreen from './components/WelcomeScreen';
import ChatHistorySidebar from './components/ChatHistorySidebar';
import type { ChatSession } from './components/ChatHistorySidebar';
import { askChat, startSession, getSessionHistory, resetSession } from './services/api';
import './styles/App.scss';
import type { Message } from './types/Message';

function App() {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // Apply theme to document and save preference (only theme in localStorage)
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const generateChatTitle = (firstMessage: string): string => {
    const words = firstMessage.split(' ').slice(0, 6);
    return words.join(' ') + (firstMessage.split(' ').length > 6 ? '...' : '');
  };

  const handleNewChat = async () => {
    try {
      setIsTyping(true);
      const newSessionId = await startSession();
      console.log(`🆕 Created new Redis session with ID: ${newSessionId}`);
      setCurrentChatId(newSessionId);
      setMessages([]);
      setIsTyping(false);
    } catch (error) {
      console.error('Failed to create new session:', error);
      setIsTyping(false);
    }
  };

  const handleSelectChat = async (chatId: string) => {
    setCurrentChatId(chatId);
    // Load messages for the selected chat
    try {
      const chatMessages = await getSessionHistory(chatId);
      const convertedMessages: Message[] = chatMessages.map((msg, index) => ({
        id: `${chatId}_${index}`,
        text: msg.content,
        isUser: msg.role === 'user',
        timestamp: new Date(msg.timestamp),
      }));
      setMessages(convertedMessages);
    } catch (error) {
      console.error('Failed to load session messages:', error);
      setMessages([]);
    }
  };

  // For now, we'll use dummy data for chat sessions list
  // In a full implementation, you'd need a Redis endpoint to list all sessions
  const handleDeleteChat = (chatId: string) => {
    // TODO: Implement Redis session deletion endpoint
    if (currentChatId === chatId) {
      setCurrentChatId(null);
      setMessages([]);
    }
  };

  const handleToggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleSendMessage = async (text: string) => {
    let sessionId = currentChatId;

    // Create new session if none exists
    if (!sessionId) {
      try {
        setIsTyping(true);
        sessionId = await startSession();
        console.log(`🆕 Created new Redis session with ID: ${sessionId}`);
        setCurrentChatId(sessionId);
        setMessages([]); // Start with empty messages for new session
        setIsTyping(false);
      } catch (error) {
        console.error('Failed to create new session:', error);
        setIsTyping(false);
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
    setMessages(prev => [...prev, userMessage]);
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

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);

      console.log(`✅ Messages updated successfully in Redis session`);

    } catch (error) {
      console.error('❌ Failed to get response from backend:', error);

      const errorMessage: Message = {
        id: `${sessionId}_${Date.now() + 1}`,
        text: `❌ **Error**: ${error instanceof Error ? error.message : 'Unable to connect to the news service. Please check if the backend server is running.'}\n\nPlease try again or contact support if the issue persists.`,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  const formatBotResponse = (answer: string, sources: Array<{ score: number; title: string; content: string; url?: string }>): string => {
    let formattedResponse = answer;

    if (sources && sources.length > 0) {
      formattedResponse += '\n\n📰 **Sources:**\n';
      sources.slice(0, 3).forEach((source, index) => {
        formattedResponse += `\n${index + 1}. **${source.title}** (Relevance: ${(source.score * 100).toFixed(1)}%)\n`;
        if (source.url) {
          formattedResponse += `   🔗 [Read more](${source.url})\n`;
        }
      });
    }

    return formattedResponse;
  };

  const handleResetChat = async () => {
    if (currentChatId) {
      try {
        await resetSession(currentChatId);
        setMessages([]);
        console.log(`🔄 Reset Redis session ${currentChatId}`);
      } catch (error) {
        console.error('Failed to reset session:', error);
      }
    }
  };

  // For now, use dummy data for sidebar (until we implement session listing)
  const dummyChatSessions: ChatSession[] = currentChatId ? [{
    id: currentChatId,
    title: messages.length > 0 ? generateChatTitle(messages[0].text) : 'New Chat',
    lastMessage: messages.length > 0 ? messages[messages.length - 1].text.substring(0, 100) : '',
    timestamp: new Date(),
    messageCount: messages.length,
  }] : [];

  console.log(`🎬 Render - Current Chat ID: ${currentChatId}`);
  console.log(`🎬 Render - Current Messages: ${messages.length} messages`);
  console.log(`🎬 Render - Messages:`, messages);

  return (
    <div className="app">
      <ChatHistorySidebar
        chatSessions={dummyChatSessions}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div className={`app__main ${isSidebarCollapsed ? 'app__main--expanded' : ''}`}>
        <ChatHeader
          onReset={handleResetChat}
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
        />

        {messages.length === 0 ? (
          <WelcomeScreen onSendMessage={handleSendMessage} />
        ) : (
          <ChatScreen messages={messages} isTyping={isTyping} />
        )}

        <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
      </div>
    </div>
  );
}

export default App;