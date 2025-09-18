import React, { useState, type KeyboardEvent } from 'react';
import { Send, Loader2, Paperclip, Mic } from 'lucide-react';
import '../styles/ChatInput.scss';

interface ChatInputProps {
    onSendMessage: (message: string) => void;
    disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled = false }) => {
    const [inputValue, setInputValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const handleSend = async () => {
        const trimmedMessage = inputValue.trim();
        if (!trimmedMessage || disabled) return;

        onSendMessage(trimmedMessage);
        setInputValue('');
    };

    const handleKeyPress = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="chat-input">
            <div className={`chat-input__container ${isFocused ? 'chat-input__container--focused' : ''}`}>
                <button className="chat-input__attachment-btn" disabled={disabled}>
                    <Paperclip className="attachment-icon" />
                </button>
                <textarea
                    className="chat-input__field"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Type your message here..."
                    disabled={disabled}
                    rows={1}
                />
                <button className="chat-input__voice-btn" disabled={disabled}>
                    <Mic className="voice-icon" />
                </button>
                <button
                    className={`chat-input__send-btn ${disabled ? 'chat-input__send-btn--loading' : ''}`}
                    onClick={handleSend}
                    disabled={!inputValue.trim() || disabled}
                >
                    {disabled ? (
                        <Loader2 className="send-icon loading" />
                    ) : (
                        <Send className="send-icon" />
                    )}
                </button>
            </div>
        </div>
    );
};

export default ChatInput;