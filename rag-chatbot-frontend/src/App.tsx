import ChatHeader from './components/ChatHeader';
import ChatScreen from './components/ChatScreen';
import ChatInput from './components/ChatInput';
import WelcomeScreen from './components/WelcomeScreen';
import ChatHistorySidebar from './components/ChatHistorySidebar';
import { useApp } from './hooks';
import './styles/App.scss';

function App() {
  const {
    // State
    currentChatId,
    messages,
    chatSessions,
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
  } = useApp();

  return (
    <div className="app">
      <ChatHistorySidebar
        chatSessions={chatSessions}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      <div className={`app__main ${isSidebarCollapsed ? 'app__main--expanded' : ''}`}>
        <ChatHeader
          onReset={handleResetChat}
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
        />

        {messages.length === 0 && !isTyping ? (
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