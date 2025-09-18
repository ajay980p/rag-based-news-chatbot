import { useState, useEffect } from 'react';
import ChatHeader from './components/ChatHeader';
import ChatScreen from './components/ChatScreen';
import ChatInput from './components/ChatInput';
import WelcomeScreen from './components/WelcomeScreen';
import ChatHistorySidebar from './components/ChatHistorySidebar';
import type { ChatSession } from './components/ChatHistorySidebar';
import { askChat } from './services/api';
import './styles/App.scss';
import type { Message } from './types/Message';

interface ChatSessionData {
  id: string;
  messages: Message[];
  isTyping: boolean;
}

function App() {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [chatSessionsData, setChatSessionsData] = useState<ChatSessionData[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // Apply theme to document and save preference
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Load chat sessions from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('chatSessions');
    const savedSessionsData = localStorage.getItem('chatSessionsData');
    const savedCurrentChatId = localStorage.getItem('currentChatId');

    if (savedSessions && savedSessionsData) {
      try {
        const sessions = JSON.parse(savedSessions).map((session: ChatSession) => ({
          ...session,
          timestamp: new Date(session.timestamp),
        }));
        const sessionsData = JSON.parse(savedSessionsData).map((data: ChatSessionData) => ({
          ...data,
          messages: data.messages.map((msg: Message) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }));

        setChatSessions(sessions);
        setChatSessionsData(sessionsData);

        if (savedCurrentChatId && sessions.find((s: ChatSession) => s.id === savedCurrentChatId)) {
          setCurrentChatId(savedCurrentChatId);
        }
      } catch (error) {
        console.error('Failed to load chat sessions:', error);
      }
    }
  }, []);

  // Save chat sessions to localStorage
  useEffect(() => {
    if (chatSessions.length > 0) {
      localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
      localStorage.setItem('chatSessionsData', JSON.stringify(chatSessionsData));
    }
    if (currentChatId) {
      localStorage.setItem('currentChatId', currentChatId);
    }
  }, [chatSessions, chatSessionsData, currentChatId]);

  const getCurrentSessionData = () => {
    if (!currentChatId) return null;
    return chatSessionsData.find(data => data.id === currentChatId) || null;
  };

  const generateChatTitle = (firstMessage: string): string => {
    const words = firstMessage.split(' ').slice(0, 6);
    return words.join(' ') + (firstMessage.split(' ').length > 6 ? '...' : '');
  };

  const handleNewChat = () => {
    const newChatId = `chat_${Date.now()}`;
    setCurrentChatId(newChatId);

    const newSessionData: ChatSessionData = {
      id: newChatId,
      messages: [],
      isTyping: false,
    };

    setChatSessionsData(prev => [...prev, newSessionData]);
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  const handleDeleteChat = (chatId: string) => {
    setChatSessions(prev => prev.filter(session => session.id !== chatId));
    setChatSessionsData(prev => prev.filter(data => data.id !== chatId));

    if (currentChatId === chatId) {
      const remainingSessions = chatSessions.filter(session => session.id !== chatId);
      setCurrentChatId(remainingSessions.length > 0 ? remainingSessions[0].id : null);
    }
  };

  const handleRenameChat = (chatId: string, newTitle: string) => {
    setChatSessions(prev =>
      prev.map(session =>
        session.id === chatId
          ? { ...session, title: newTitle }
          : session
      )
    );
  };

  const handleToggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleSendMessage = async (text: string) => {
    if (!currentChatId) {
      handleNewChat();
      // The new chat will be created, but we need to wait for the state update
      setTimeout(() => handleSendMessage(text), 100);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date(),
    };

    // Update current session data
    setChatSessionsData(prev => prev.map(data =>
      data.id === currentChatId
        ? { ...data, messages: [...data.messages, userMessage], isTyping: true }
        : data
    ));

    // Create or update chat session metadata
    const isFirstMessage = getCurrentSessionData()?.messages.length === 0;

    if (isFirstMessage) {
      const newSession: ChatSession = {
        id: currentChatId,
        title: generateChatTitle(text),
        lastMessage: text,
        timestamp: new Date(),
        messageCount: 1,
      };
      setChatSessions(prev => [newSession, ...prev]);
    }

    try {
      const response = await askChat(text);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: formatBotResponse(response.answer, response.sources),
        isUser: false,
        timestamp: new Date(),
      };

      setChatSessionsData(prev => prev.map(data =>
        data.id === currentChatId
          ? { ...data, messages: [...data.messages, botMessage], isTyping: false }
          : data
      ));

      // Update session metadata
      setChatSessions(prev => prev.map(session =>
        session.id === currentChatId
          ? {
            ...session,
            lastMessage: response.answer.substring(0, 100),
            timestamp: new Date(),
            messageCount: session.messageCount + 1
          }
          : session
      ));

    } catch (error) {
      console.error('❌ Failed to get response from backend:', error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `❌ **Error**: ${error instanceof Error ? error.message : 'Unable to connect to the news service. Please check if the backend server is running.'}\n\nPlease try again or contact support if the issue persists.`,
        isUser: false,
        timestamp: new Date(),
      };

      setChatSessionsData(prev => prev.map(data =>
        data.id === currentChatId
          ? { ...data, messages: [...data.messages, errorMessage], isTyping: false }
          : data
      ));
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

  const handleResetChat = () => {
    if (currentChatId) {
      setChatSessionsData(prev => prev.map(data =>
        data.id === currentChatId
          ? { ...data, messages: [], isTyping: false }
          : data
      ));
    }
  };

  const currentSessionData = getCurrentSessionData();
  const currentMessages = currentSessionData?.messages || [];
  const isTyping = currentSessionData?.isTyping || false;

  return (
    <div className="app">
      <ChatHistorySidebar
        chatSessions={chatSessions}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div className={`app__main ${isSidebarCollapsed ? 'app__main--expanded' : ''}`}>
        <ChatHeader
          onReset={handleResetChat}
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
        />

        {currentMessages.length === 0 ? (
          <WelcomeScreen onSendMessage={handleSendMessage} />
        ) : (
          <ChatScreen messages={currentMessages} isTyping={isTyping} />
        )}

        <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
      </div>
    </div>
  );
}

export default App;