import React from 'react';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import '../styles/ChatScreen.scss';
import type { Message } from '../types/Message';

interface ChatScreenProps {
    messages: Message[];
    isTyping?: boolean;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ messages, isTyping = false }) => {
    return (
        <div className="chat-screen">
            <div className="chat-screen__messages">
                {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                ))}
                {isTyping && <TypingIndicator />}
            </div>
        </div>
    );
};

export default ChatScreen;