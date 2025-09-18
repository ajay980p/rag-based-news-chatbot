import React from 'react';
import { Newspaper, Zap, Globe, ArrowRight, TrendingUp } from 'lucide-react';
import '../styles/WelcomeScreen.scss';

interface WelcomeScreenProps {
    onSendMessage: (message: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSendMessage }) => {
    const suggestedQuestions = [
        "What are the latest breaking news stories?",
        "Show me today's top headlines",
        "What's happening in technology news?",
        "Give me updates on global politics",
        "What are the trending sports stories?",
        "Tell me about recent business developments"
    ];

    const features = [
        {
            icon: <Globe className="feature-icon" />,
            title: "Global Coverage",
            description: "Access breaking news and stories from around the world in real-time"
        },
        {
            icon: <TrendingUp className="feature-icon" />,
            title: "Trending Analysis",
            description: "Get insights on trending topics and emerging news stories"
        },
        {
            icon: <Zap className="feature-icon" />,
            title: "Instant Updates",
            description: "Receive the latest news updates and summaries instantly"
        }
    ];

    return (
        <div className="welcome-screen">
            <div className="welcome-screen__content">
                <div className="welcome-screen__hero">
                    <div className="welcome-screen__logo">
                        <Newspaper className="logo-icon" />
                    </div>
                    <h1 className="welcome-screen__title">
                        Welcome to NewsBot
                    </h1>
                    <p className="welcome-screen__subtitle">
                        Your AI-powered news assistant that delivers personalized news updates and insights.
                        Ask me about any topic and I'll provide you with the latest news, analysis, and context from trusted sources.
                    </p>
                </div>

                <div className="welcome-screen__features">
                    {features.map((feature, index) => (
                        <div key={index} className="feature-card">
                            {feature.icon}
                            <h3 className="feature-title">{feature.title}</h3>
                            <p className="feature-description">{feature.description}</p>
                        </div>
                    ))}
                </div>

                <div className="welcome-screen__suggestions">
                    <h3 className="suggestions-title">Get started with these news topics:</h3>
                    <div className="suggestions-grid">
                        {suggestedQuestions.map((question, index) => (
                            <button
                                key={index}
                                className="suggestion-card"
                                onClick={() => onSendMessage(question)}
                            >
                                <span className="suggestion-text">{question}</span>
                                <ArrowRight className="suggestion-arrow" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeScreen;