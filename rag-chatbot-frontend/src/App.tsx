import { useState, useEffect } from 'react';
import ChatHeader from './components/ChatHeader';
import ChatScreen from './components/ChatScreen';
import ChatInput from './components/ChatInput';
import WelcomeScreen from './components/WelcomeScreen';
import { askChat } from './services/api';
import './styles/App.scss';
import type { Message } from './types/Message';

function App() {
  const [messages, setMessages] = useState<Message[]>([
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check for saved theme preference or default to light mode
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

  const handleToggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleSendMessage = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Call the real backend API
      const response = await askChat(text);

      // Create bot response with the actual answer from the API
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: formatBotResponse(response.answer, response.sources),
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('❌ Failed to get response from backend:', error);

      // Show error message to user
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `❌ **Error**: ${error instanceof Error ? error.message : 'Unable to connect to the news service. Please check if the backend server is running on http://localhost:5000'}\n\nPlease try again or contact support if the issue persists.`,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Format the bot response with sources
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
    setMessages([]);
    setIsTyping(false);
  };

  return (
    <div className="app">
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
  );
}

export default App;