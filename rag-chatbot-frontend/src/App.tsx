import React, { useState } from 'react';
import ChatHeader from './components/ChatHeader';
import ChatScreen from './components/ChatScreen';
import ChatInput from './components/ChatInput';
import WelcomeScreen from './components/WelcomeScreen';
import './styles/App.scss';
import type { Message } from './types/Message';

function App() {
  const [messages, setMessages] = useState<Message[]>([
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate bot response with realistic delay
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(text),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000); // Variable delay for realism
  };

  const handleResetChat = () => {
    setMessages([]);
    setIsTyping(false);
  };

  const generateBotResponse = (userMessage: string): string => {
    // News-focused response generation
    const responseTypes = {
      breaking: [
        'Here are the latest breaking news updates I found:',
        'I\'ve gathered the most recent news stories for you:',
        'Based on current news sources, here\'s what\'s happening:'
      ],
      headlines: [
        'Here are today\'s top headlines from major news outlets:',
        'I\'ve compiled the most important stories of the day:',
        'These are the trending news stories right now:'
      ],
      topic: [
        'I\'ve searched through recent news articles and found these relevant stories:',
        'Here\'s what\'s been reported recently on this topic:',
        'Based on the latest news coverage, here are the key developments:'
      ],
      greeting: [
        'Hello! I\'m NewsBot, your AI news assistant. What news topics interest you today?',
        'Hi there! I\'m here to keep you updated with the latest news. What would you like to know?',
        'Welcome! I have access to real-time news feeds and I\'m ready to help you stay informed.'
      ],
      general: [
        'I\'ve found some interesting news coverage on that topic:',
        'Here\'s what the latest reports are saying about this:',
        'Based on recent news articles, here\'s the current situation:'
      ]
    };

    // News-specific categorization
    let category = 'general';
    if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
      category = 'greeting';
    } else if (userMessage.toLowerCase().includes('breaking') || userMessage.toLowerCase().includes('latest')) {
      category = 'breaking';
    } else if (userMessage.toLowerCase().includes('headlines') || userMessage.toLowerCase().includes('top news')) {
      category = 'headlines';
    } else if (userMessage.toLowerCase().includes('technology') || userMessage.toLowerCase().includes('politics') ||
      userMessage.toLowerCase().includes('sports') || userMessage.toLowerCase().includes('business')) {
      category = 'topic';
    }

    const responses = responseTypes[category as keyof typeof responseTypes];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    const elaborations = [
      'I\'ve cross-referenced multiple news sources to bring you the most accurate and up-to-date information.',
      'These stories have been verified across several trusted news outlets for accuracy.',
      'The news landscape is constantly evolving, and I\'m monitoring developments in real-time.',
      'I\'ve analyzed recent articles and reports to provide you with comprehensive coverage of this topic.'
    ];

    const randomElaboration = elaborations[Math.floor(Math.random() * elaborations.length)];

    return `${randomResponse}\n\n${randomElaboration}\n\n📰 **Sample News Update**: This demonstrates how NewsBot would deliver real-time news updates by retrieving relevant articles from trusted sources and presenting them in an easy-to-understand format with proper context and analysis.`;
  };

  return (
    <div className="app">
      <ChatHeader onReset={handleResetChat} />
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