import React, { useEffect, useRef, useCallback } from 'react';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import '../styles/ChatScreen.scss';
import type { Message } from '../types';

interface ChatScreenProps {
    messages: Message[];
    isTyping?: boolean;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ messages, isTyping = false }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback((smooth: boolean = true, force: boolean = false) => {
        if (messagesEndRef.current) {
            // If force is true, use a timeout to ensure DOM is updated
            const doScroll = () => {
                messagesEndRef.current?.scrollIntoView({
                    behavior: smooth ? 'smooth' : 'auto',
                    block: 'end'
                });
            };

            if (force) {
                // Force scroll with slight delay for DOM updates
                setTimeout(doScroll, 50);
            } else {
                doScroll();
            }
        }
    }, []);

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Scroll to bottom when typing status changes
    useEffect(() => {
        if (isTyping) {
            scrollToBottom();
        }
    }, [isTyping, scrollToBottom]);

    // Scroll to bottom immediately when component mounts (opening chat)
    useEffect(() => {
        scrollToBottom(false); // Instant scroll on mount
    }, [scrollToBottom]);

    return (
        <div className="chat-screen">
            <div className="chat-screen__messages" ref={messagesContainerRef}>
                {messages.map((message) => (
                    <ChatMessage
                        key={message.id}
                        message={message}
                        onScrollToBottom={() => scrollToBottom(true, true)} // Force scroll for streaming messages
                    />
                ))}
                {isTyping && <TypingIndicator />}
                {/* Invisible element to scroll to */}
                <div ref={messagesEndRef} className="chat-screen__scroll-anchor" />
            </div>
        </div>
    );
};

export default ChatScreen;