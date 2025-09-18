import React, { useState, useEffect } from 'react';
import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import '../styles/ChatMessage.scss';
import type { Message } from '../types';

interface ChatMessageProps {
    message: Message;
    onScrollToBottom?: () => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onScrollToBottom }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [streamingComplete, setStreamingComplete] = useState(true);

    useEffect(() => {
        // For user messages or non-streaming bot messages, display immediately
        if (message.isUser || !message.isStreaming) {
            setDisplayedText(message.text);
            setIsTyping(false);
            setStreamingComplete(true);
            return;
        }

        // Only stream for new bot messages with isStreaming flag
        if (message.isStreaming) {
            // Word-by-word streaming effect for bot messages (more readable)
            const words = message.text.split(' ');
            let wordIndex = 0;
            setDisplayedText('');
            setIsTyping(true);
            setStreamingComplete(false);

            const timer = setInterval(() => {
                if (wordIndex < words.length) {
                    setDisplayedText(prev => {
                        const newText = prev + (wordIndex === 0 ? '' : ' ') + words[wordIndex];
                        return newText;
                    });
                    wordIndex++;
                    // Scroll to bottom as text is being typed
                    if (onScrollToBottom) {
                        onScrollToBottom();
                    }
                } else {
                    setIsTyping(false);
                    setStreamingComplete(true);
                    clearInterval(timer);
                    // Final scroll to bottom when streaming is complete
                    setTimeout(() => {
                        if (onScrollToBottom) {
                            onScrollToBottom();
                        }
                    }, 50); // Small delay to ensure DOM update
                }
            }, 100); // Adjust speed here (100ms per word)

            return () => clearInterval(timer);
        }
    }, [message.text, message.isUser, message.isStreaming, onScrollToBottom]);

    // Additional scroll when streaming completes to ensure we're at the bottom
    useEffect(() => {
        if (streamingComplete && !message.isUser && onScrollToBottom) {
            setTimeout(() => {
                onScrollToBottom();
            }, 100); // Slight delay to ensure ReactMarkdown has rendered
        }
    }, [streamingComplete, message.isUser, onScrollToBottom]);

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
                            ) : (
                                <div className="streaming-text">
                                    {displayedText}
                                    {isTyping && <span className="typing-cursor">|</span>}
                                </div>
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