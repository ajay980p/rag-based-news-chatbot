export const API_BASE_URL = "http://localhost:5500"; // backend URL

export interface ChatResponse {
    answer: string;
    sources: Array<{
        score: number;
        title: string;
        content: string;
        url?: string;
    }>;
}

export interface ChatRequest {
    query: string;
}

export async function askChat(query: string): Promise<ChatResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/chat/ask`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ query }),
        });

        if (!response.ok) {
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
