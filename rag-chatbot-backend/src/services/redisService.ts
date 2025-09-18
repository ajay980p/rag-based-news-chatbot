import { createClient } from "redis";

const client = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
});

// Event listeners for better debugging
client.on("connect", () => console.log("🔌 Redis client is connecting..."));
client.on("ready", () => console.log("✅ Redis client connected and ready to use"));
client.on("error", (err) => console.error("❌ Redis Client Error:", err));
client.on("end", () => console.log("🛑 Redis client disconnected"));

export async function initRedis() {
    if (!client.isOpen) {
        await client.connect();
        console.log("🚀 Redis connection established");
    } else {
        console.log("ℹ️ Redis client already connected");
    }
}

export async function setSession(sessionId: string, data: any, ttlSeconds?: number) {
    const key = `session:${sessionId}`;

    if (ttlSeconds) {
        // Set with TTL
        await client.set(key, JSON.stringify(data), { EX: ttlSeconds });
        console.log(`💾 Session [${sessionId}] saved to Redis with TTL: ${ttlSeconds}s`);
    } else {
        // Set without TTL
        await client.set(key, JSON.stringify(data));
        console.log(`💾 Session [${sessionId}] saved to Redis`);
    }
}

export async function getSession(sessionId: string) {
    const key = `session:${sessionId}`;
    const data = await client.get(key);
    console.log(`📥 Session [${sessionId}] fetched from Redis`);
    return data ? JSON.parse(data) : null;
}

export async function clearSession(sessionId: string) {
    const key = `session:${sessionId}`;
    await client.del(key);

    // Also remove from session metadata
    await client.sRem("sessions:list", sessionId);
    await client.del(`session:meta:${sessionId}`);

    console.log(`🗑️ Session [${sessionId}] cleared from Redis`);
}

// Session metadata management
export async function setSessionMetadata(sessionId: string, metadata: {
    title: string;
    lastMessage: string;
    timestamp: string;
    messageCount: number;
}, ttlSeconds?: number) {
    console.log(`🔍 DEBUG: setSessionMetadata called for ${sessionId}`, metadata);

    const metaKey = `session:meta:${sessionId}`;

    if (ttlSeconds) {
        await client.set(metaKey, JSON.stringify(metadata), { EX: ttlSeconds });
        console.log(`🔍 DEBUG: Set metadata with TTL ${ttlSeconds}s for ${sessionId}`);
    } else {
        await client.set(metaKey, JSON.stringify(metadata));
        console.log(`🔍 DEBUG: Set metadata without TTL for ${sessionId}`);
    }

    // Add session ID to the sessions list (set ensures uniqueness)
    await client.sAdd("sessions:list", sessionId);
    console.log(`🔍 DEBUG: Added ${sessionId} to sessions:list`);

    console.log(`📋 Session metadata [${sessionId}] updated: ${metadata.title}`);
}

export async function getSessionMetadata(sessionId: string) {
    const metaKey = `session:meta:${sessionId}`;
    const data = await client.get(metaKey);
    return data ? JSON.parse(data) : null;
}

/**
 * Get all sessions stored in Redis
 * Each session is stored as: session:<id> -> JSON array of messages
 */
export async function getAllSessions() {
    console.log(`🔍 DEBUG: Starting getAllSessions()`);

    // 1. Fetch all keys matching "session:*"
    const keys = await client.keys("session:*");
    console.log(`🔍 DEBUG: Found ${keys.length} session keys`, keys);

    const sessions: any[] = [];

    for (const key of keys) {
        console.log(`🔍 DEBUG: Processing ${key}`);

        const data = await client.get(key);
        if (data) {
            const messages = JSON.parse(data);

            // Pick metadata: last message timestamp or first message if needed
            const lastMessage = messages[messages.length - 1] || null;

            sessions.push({
                id: key.replace("session:", ""), // strip prefix
                lastMessage,
                timestamp: lastMessage?.user_timestamp || lastMessage?.bot_timestamp || null,
            });

            console.log(`✅ DEBUG: Added session ${key}`);
        } else {
            console.log(`⚠️ DEBUG: No data found for ${key}`);
        }
    }

    // 2. Sort sessions by timestamp (newest first)
    sessions.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    console.log(`📋 Retrieved ${sessions.length} sessions from Redis`);
    return sessions;
}



// Debug function to inspect Redis state
export async function debugRedisState() {
    console.log(`🔍 DEBUG: Inspecting Redis state...`);

    // Check sessions list
    const sessionIds = await client.sMembers("sessions:list");
    console.log(`🔍 Sessions in list:`, sessionIds);

    // Check all session keys
    const sessionKeys = await client.keys("session:*");
    console.log(`🔍 All session keys:`, sessionKeys);

    // Check all metadata keys
    const metaKeys = await client.keys("session:meta:*");
    console.log(`🔍 All metadata keys:`, metaKeys);

    // Sample a few metadata entries
    for (const metaKey of metaKeys.slice(0, 5)) {
        const data = await client.get(metaKey);
        console.log(`🔍 ${metaKey}:`, data);
    }
}

export { client };