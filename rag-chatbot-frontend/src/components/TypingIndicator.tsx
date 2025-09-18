import React from 'react';
import { Bot } from 'lucide-react';
import '../styles/TypingIndicator.scss';

const TypingIndicator: React.FC = () => {
    return (
        <div className="typing-indicator">
            <div className="typing-indicator__avatar">
                <Bot className="avatar-icon" />
            </div>
            <div className="typing-indicator__content">
                <div className="typing-indicator__bubble">
                    <div className="typing-dots">
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TypingIndicator;