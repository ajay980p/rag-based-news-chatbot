export const API_BASE_URL = "http://localhost:5500"; // update to deployed backend later

export async function askChat(query: string) {
    const response = await fetch(`${API_BASE_URL}/chat/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
    });
    if (!response.ok) throw new Error("Failed to fetch response");
    return response.json();
}