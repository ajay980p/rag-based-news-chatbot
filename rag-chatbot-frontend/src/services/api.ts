export const API_BASE_URL = "http://localhost:5500"; // backend URL

export interface ChatMessage {
    role: "user" | "bot";
    content: string;
    timestamp: string;
    sources?: Array<{
        score: number;
        title: string;
        content: string;
        url?: string;
    }>;
}

export interface ChatResponse {
    answer: string;
    sources: Array<{
        score: number;
        title: string;
        content: string;
        url?: string;
    }>;
    history?: ChatMessage[];
}

export interface SessionResponse {
    sessionId: string;
}

export interface SessionHistoryResponse {
    messages: ChatMessage[];
}

export interface ChatRequest {
    query: string;
    sessionId?: string;
}

// Session Management APIs
export async function startSession(): Promise<string> {
    try {
        const response = await fetch(`${API_BASE_URL}/session/start`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: "Network error" }));
            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data: SessionResponse = await response.json();
        return data.sessionId;
    } catch (error) {
        console.error("❌ API Error starting session:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to start session");
    }
}

export async function getSessionHistory(sessionId: string): Promise<ChatMessage[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/session/${sessionId}/history`, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("Session expired or not found");
            }
            const errorData = await response.json().catch(() => ({ error: "Network error" }));
            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data: SessionHistoryResponse = await response.json();
        return data.messages;
    } catch (error) {
        console.error("❌ API Error getting session history:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to get session history");
    }
}

export async function resetSession(sessionId: string): Promise<void> {
    try {
        const response = await fetch(`${API_BASE_URL}/session/${sessionId}/reset`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("Session not found");
            }
            const errorData = await response.json().catch(() => ({ error: "Network error" }));
            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        console.error("❌ API Error resetting session:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to reset session");
    }
}

// Enhanced Chat API with Session Support
export async function askChat(query: string, sessionId?: string): Promise<ChatResponse> {
    try {
        const requestBody: ChatRequest = { query };
        if (sessionId) {
            requestBody.sessionId = sessionId;
        }

        const response = await fetch(`${API_BASE_URL}/chat/ask`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            if (response.status === 404 && sessionId) {
                throw new Error("Session expired or not found");
            }
            const errorData = await response.json().catch(() => ({ error: "Network error" }));
            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data: ChatResponse = await response.json();
        return data;
    } catch (error) {
        console.error("❌ API Error:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to connect to the server");
    }
}

// Backward compatibility - original askChat without session
export async function askChatWithoutSession(query: string): Promise<ChatResponse> {
    return askChat(query);
}