import type {
    ChatMessage,
    ChatResponse,
    ChatRequest,
    SessionResponse,
    SessionHistoryResponse,
    SessionListResponse,
    SessionMetadata
} from '../types';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5500"; // backend URL

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

export async function deleteSession(sessionId: string): Promise<void> {
    try {
        const response = await fetch(`${API_BASE_URL}/session/${sessionId}/delete`, {
            method: "DELETE",
            headers: {
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
        console.error("❌ API Error deleting session:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to delete session");
    }
}

export async function getAllSessions(): Promise<SessionMetadata[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/session/list`, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: "Network error" }));
            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data: SessionListResponse = await response.json();
        return data.sessions;
    } catch (error) {
        console.error("❌ API Error getting all sessions:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to get sessions");
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