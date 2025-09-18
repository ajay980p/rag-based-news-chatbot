import React, { useEffect } from 'react';
import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import '../styles/ChatMessage.scss';
import type { Message } from '../types';

interface ChatMessageProps {
    message: Message;
    onScrollToBottom?: () => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onScrollToBottom }) => {
    // Scroll to bottom when message renders
    useEffect(() => {
        if (onScrollToBottom) {
            setTimeout(() => {
                onScrollToBottom();
            }, 50);
        }
    }, [message.text, onScrollToBottom]);

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
                            {message.text}
                        </p>
                    ) : (
                        <div className="chat-message__text">
                            <ReactMarkdown
                                components={{
                                    p: ({ children }) => <p className="message-paragraph">{children}</p>,
                                    strong: ({ children }) => <strong className="markdown-bold">{children}</strong>,
                                    em: ({ children }) => <em className="markdown-italic">{children}</em>,
                                    a: ({ href, children }) => (
                                        <a href={href} target="_blank" rel="noopener noreferrer" className="markdown-link">
                                            {children}
                                        </a>
                                    ),
                                    ul: ({ children }) => <ul className="markdown-list">{children}</ul>,
                                    li: ({ children }) => <li className="markdown-list-item">{children}</li>,
                                    ol: ({ children }) => <ol className="markdown-ordered-list">{children}</ol>,
                                    br: () => <br className="line-break" />,
                                    h1: ({ children }) => <h1 className="message-heading">{children}</h1>,
                                    h2: ({ children }) => <h2 className="message-heading">{children}</h2>,
                                    h3: ({ children }) => <h3 className="message-heading">{children}</h3>,
                                    code: ({ children }) => <code className="inline-code">{children}</code>,
                                }}
                            >
                                {message.text}
                            </ReactMarkdown>
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