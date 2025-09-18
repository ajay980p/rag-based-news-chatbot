/**
 * Utility functions for formatting messages and responses
 */

import type { Source } from '../types';

/**
 * Formats bot response with sources
 */
export const formatBotResponse = (
    answer: string,
    sources: Source[]
): string => {
    let formattedResponse = answer;

    if (sources && sources.length > 0) {
        formattedResponse += '\n\n📰 **Sources:**\n';
        sources.slice(0, 3).forEach((source, index) => {
            formattedResponse += `\n${index + 1}. **${source.title}** (Relevance: ${(source.score * 100).toFixed(1)}%)\n`;
            if (source.url) {
                formattedResponse += `   🔗 [Read more](${source.url})\n`;
            }
        });
    }

    return formattedResponse;
};

/**
 * Generates a chat title from the first message
 */
export const generateChatTitle = (firstMessage: string): string => {
    const words = firstMessage.split(' ').slice(0, 6);
    return words.join(' ') + (firstMessage.split(' ').length > 6 ? '...' : '');
};