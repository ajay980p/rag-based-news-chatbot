import React, { useState, useEffect } from 'react';
import { User, Bot } from 'lucide-react';
import '../styles/ChatMessage.scss';
import type { Message } from '../types/Message';

interface ChatMessageProps {
    message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(!message.isUser);

    useEffect(() => {
        if (message.isUser) {
            setDisplayedText(message.text);
            setIsTyping(false);
            return;
        }

        // Streaming effect for bot messages
        let index = 0;
        setDisplayedText('');
        setIsTyping(true);

        const timer = setInterval(() => {
            if (index < message.text.length) {
                setDisplayedText(prev => prev + message.text[index]);
                index++;
            } else {
                setIsTyping(false);
                clearInterval(timer);
            }
        }, 20); // Adjust speed here (lower = faster)

        return () => clearInterval(timer);
    }, [message.text, message.isUser]);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    };

    return (
        <div className={`chat-message ${message.isUser ? 'chat-message--user' : 'chat-message--bot'}`}>
            <div className="chat-message__avatar">
                {message.isUser ? (
                    <User className="avatar-icon" />
                ) : (
                    <Bot className="avatar-icon" />
                )}
            </div>
            <div className="chat-message__content">
                <div className="chat-message__bubble">
                    <p className="chat-message__text">
                        {displayedText}
                        {isTyping && <span className="typing-cursor">|</span>}
                    </p>
                </div>
                <div className="chat-message__timestamp">
                    {formatTime(message.timestamp)}
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;