import React from 'react';
import { Plus, MessageSquare, Trash2, Menu, X } from 'lucide-react';
import type { ChatSession } from '../types';
import '../styles/ChatHistorySidebar.scss';

interface ChatHistorySidebarProps {
    chatSessions: ChatSession[];
    currentChatId: string | null;
    onSelectChat: (chatId: string) => void;
    onNewChat: () => void;
    onDeleteChat: (chatId: string) => void;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
    chatSessions,
    currentChatId,
    onSelectChat,
    onNewChat,
    onDeleteChat,
    isCollapsed = false,
    onToggleCollapse,
}) => {
    const formatTime = (date: Date | undefined) => {
        if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
            return 'Unknown';
        }

        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            });
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
            });
        }
    };

    const truncateText = (text: string | undefined, maxLength: number = 30) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    return (
        <div className={`chat-sidebar ${isCollapsed ? 'chat-sidebar--collapsed' : ''}`}>
            <div className="chat-sidebar__header">
                <button
                    className="chat-sidebar__toggle"
                    onClick={onToggleCollapse}
                    title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {isCollapsed ? <Menu size={20} /> : <X size={20} />}
                </button>

                {!isCollapsed && (
                    <button className="chat-sidebar__new-chat" onClick={onNewChat}>
                        <Plus size={16} />
                        <span>New Chat</span>
                    </button>
                )}
            </div>

            {!isCollapsed && (
                <div className="chat-sidebar__content">
                    <div className="chat-sidebar__section">
                        <h3 className="chat-sidebar__section-title">Recent Chats</h3>
                        <div className="chat-sidebar__list">
                            {!chatSessions || chatSessions.length === 0 ? (
                                <div className="chat-sidebar__empty">
                                    <MessageSquare size={24} className="chat-sidebar__empty-icon" />
                                    <p>No chat history yet</p>
                                    <p className="chat-sidebar__empty-subtitle">
                                        Start a conversation to see your chat history here
                                    </p>
                                </div>
                            ) : (
                                chatSessions.filter(session => session && session.id).map((session) => (
                                    <div
                                        key={session.id}
                                        className={`chat-sidebar__item ${currentChatId === session.id ? 'chat-sidebar__item--active' : ''
                                            }`}
                                        onClick={() => onSelectChat(session.id)}
                                    >
                                        <div className="chat-sidebar__item-content">
                                            <div className="chat-sidebar__item-icon">
                                                <MessageSquare size={16} />
                                            </div>
                                            <div className="chat-sidebar__item-text">
                                                <div className="chat-sidebar__item-title">
                                                    {truncateText(session?.title)}
                                                </div>
                                                <div className="chat-sidebar__item-preview">
                                                    {truncateText(session?.lastMessage, 40)}
                                                </div>
                                            </div>
                                            <div className="chat-sidebar__item-meta">
                                                <span className="chat-sidebar__item-time">
                                                    {formatTime(session?.timestamp)}
                                                </span>
                                                <div className="chat-sidebar__item-actions">
                                                    <button
                                                        className="chat-sidebar__action-btn chat-sidebar__action-btn--delete"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onDeleteChat(session.id);
                                                        }}
                                                        title="Delete chat"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatHistorySidebar;