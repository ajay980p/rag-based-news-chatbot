import React from 'react';
import { RotateCcw, Newspaper, Sparkles } from 'lucide-react';
import '../styles/ChatHeader.scss';

interface ChatHeaderProps {
    onReset: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onReset }) => {
    return (
        <header className="chat-header">
            <div className="chat-header__content">
                <div className="chat-header__title">
                    <div className="chat-header__logo">
                        <Newspaper className="chat-header__icon" />
                        <Sparkles className="chat-header__sparkle" />
                    </div>
                    <div className="chat-header__text">
                        <h1>NewsBot</h1>
                        <span className="chat-header__status">
                            <span className="status-dot"></span>
                            Live News Feed
                        </span>
                    </div>
                </div>
                <button
                    className="chat-header__reset-btn"
                    onClick={onReset}
                    title="Reset Chat"
                >
                    <RotateCcw className="reset-icon" />
                    <span>Reset</span>
                </button>
            </div>
        </header>
    );
};

export default ChatHeader;