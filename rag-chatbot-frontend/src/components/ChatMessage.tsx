import React, { useState, useEffect } from 'react';
import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import '../styles/ChatMessage.scss';
import type { Message } from '../types';

interface ChatMessageProps {
    message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(!message.isUser);
    const [streamingComplete, setStreamingComplete] = useState(message.isUser);

    useEffect(() => {
        if (message.isUser) {
            setDisplayedText(message.text);
            setIsTyping(false);
            setStreamingComplete(true);
            return;
        }

        // Streaming effect for bot messages
        let index = 0;
        setDisplayedText('');
        setIsTyping(true);
        setStreamingComplete(false);

        const timer = setInterval(() => {
            if (index < message.text.length) {
                setDisplayedText(prev => prev + message.text[index]);
                index++;
            } else {
                setIsTyping(false);
                setStreamingComplete(true);
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
                    {message.isUser ? (
                        <p className="chat-message__text">
                            {displayedText}
                            {isTyping && <span className="typing-cursor">|</span>}
                        </p>
                    ) : (
                        <div className="chat-message__text">
                            {streamingComplete ? (
                                <ReactMarkdown
                                    components={{
                                        // Make everything completely inline with no spacing
                                        p: ({ children }) => <span>{children}</span>,
                                        strong: ({ children }) => <strong className="markdown-bold">{children}</strong>,
                                        a: ({ href, children }) => (
                                            <a href={href} target="_blank" rel="noopener noreferrer" className="markdown-link">
                                                {children}
                                            </a>
                                        ),
                                        ul: ({ children }) => <span>{children}</span>,
                                        li: ({ children }) => <span style={{ display: 'inline-block', width: '100%', margin: '0', padding: '0' }}>{children}</span>,
                                        ol: ({ children }) => <span>{children}</span>,
                                        br: () => <span> </span>,
                                    }}
                                >
                                    {message.text}
                                </ReactMarkdown>
                            ) : (
                                <span>
                                    {displayedText}
                                    {isTyping && <span className="typing-cursor">|</span>}
                                </span>
                            )}
                        </div>
                    )}
                </div>
                <div className="chat-message__timestamp">
                    {formatTime(message.timestamp)}
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;