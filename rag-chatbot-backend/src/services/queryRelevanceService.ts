import { chatLogger } from '../utils/logger';

/**
 * Check if a user query is related to news or if it's a casual/irrelevant question
 */
export const isNewsRelatedQuery = (query: string): boolean => {
    const normalizedQuery = query.toLowerCase().trim();

    // Common casual/irrelevant questions that should get simple responses
    const casualPatterns = [
        // Greetings and casual conversation
        /^(hi|hello|hey|good morning|good evening|good afternoon)$/,
        /^(how are you|what are you doing|what's up|how's it going)$/,
        /^(who are you|what are you|tell me about yourself)$/,
        /^(thanks|thank you|bye|goodbye|see you)$/,

        // Basic questions about the bot
        /^(what can you do|how do you work|what is your purpose)$/,
        /^(are you (a )?bot|are you (an )?ai|are you real)$/,

        // Random non-news questions
        /^(what time is it|what day is it|what's the weather)$/,
        /^(tell me a joke|sing a song|play a game)$/,
        /^(how old are you|where are you from|do you have feelings)$/,

        // Very short or unclear queries
        /^(yes|no|ok|okay|sure|maybe|idk|i don't know)$/,
        /^(test|testing|hello world)$/
    ];

    // Check if query matches any casual pattern
    for (const pattern of casualPatterns) {
        if (pattern.test(normalizedQuery)) {
            chatLogger.info(`Query identified as casual/irrelevant: "${query}"`);
            return false;
        }
    }

    // News-related keywords that indicate a legitimate news query
    const newsKeywords = [
        'news', 'latest', 'breaking', 'today', 'recent', 'current', 'happening',
        'update', 'development', 'story', 'report', 'announcement', 'trending',
        'politics', 'technology', 'business', 'sports', 'entertainment', 'health',
        'economy', 'startup', 'government', 'industry', 'market', 'company',
        'india', 'indian', 'global', 'world', 'international', 'local',
        'what happened', 'tell me about', 'what are the', 'give me', 'show me',
        'what is', 'how is', 'why is', 'when did', 'where is'
    ];

    // Check if query contains news-related keywords
    const hasNewsKeywords = newsKeywords.some(keyword =>
        normalizedQuery.includes(keyword)
    );

    // If query is longer than 10 characters and doesn't match casual patterns,
    // it's likely a legitimate question (even if it doesn't have explicit news keywords)
    const isSubstantialQuery = normalizedQuery.length > 10 &&
        !casualPatterns.some(pattern => pattern.test(normalizedQuery));

    const isNewsRelated = hasNewsKeywords || isSubstantialQuery;

    chatLogger.info(`Query relevance check: "${query}" -> ${isNewsRelated ? 'NEWS-RELATED' : 'CASUAL/IRRELEVANT'}`);

    return isNewsRelated;
};

/**
 * Generate appropriate response for casual/irrelevant queries
 */
export const generateCasualResponse = (query: string): string => {
    const normalizedQuery = query.toLowerCase().trim();

    // Personalized responses based on query type
    if (/^(hi|hello|hey|good morning|good evening|good afternoon)$/.test(normalizedQuery)) {
        return "Hello! I'm a News AI Chatbot. I'm here to help you stay updated with the latest news and information. Please ask me questions related to news, current events, or any specific topics you'd like to know about!";
    }

    if (/^(how are you|what are you doing|what's up|how's it going)$/.test(normalizedQuery)) {
        return "I'm a News AI Chatbot, and I'm just reading and analyzing the latest news! Please ask me questions related to news, current events, or any specific topics you'd like to stay informed about.";
    }

    if (/^(who are you|what are you|tell me about yourself)$/.test(normalizedQuery)) {
        return "I'm a News AI Chatbot designed to help you stay informed about current events and news. I can provide you with the latest updates on technology, business, politics, sports, and more. Please ask me about any news topic you're interested in!";
    }

    if (/^(what can you do|how do you work|what is your purpose)$/.test(normalizedQuery)) {
        return "I'm a News AI Chatbot that helps you stay updated with current events. I can answer questions about the latest news in various categories like technology, business, politics, sports, and more. Just ask me about any news topic you're curious about!";
    }

    if (/^(thanks|thank you|bye|goodbye|see you)$/.test(normalizedQuery)) {
        return "You're welcome! Feel free to ask me about any news topics whenever you want to stay informed. Have a great day!";
    }

    // Default response for other casual/irrelevant queries
    return "I'm a News AI Chatbot focused on providing news and current events information. Please ask me questions related to news, such as the latest developments in technology, business, politics, sports, or any other news topics you're interested in!";
};