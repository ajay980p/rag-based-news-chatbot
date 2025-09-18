import { createClient } from "redis";
import { redisLogger } from "../utils/logger";

const client = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
});

// Event listeners for better debugging
client.on("connect", () => redisLogger.info("Redis client is connecting..."));
client.on("ready", () => redisLogger.info("Redis client connected and ready to use"));
client.on("error", (err) => redisLogger.error("Redis Client Error:", err));
client.on("end", () => redisLogger.info("Redis client disconnected"));

export async function initRedis() {
    if (!client.isOpen) {
        await client.connect();
        redisLogger.info("Redis connection established");
    } else {
        redisLogger.info("Redis client already connected");
    }
}

export async function setSession(sessionId: string, data: any, ttlSeconds?: number) {
    const key = `session:${sessionId}`;

    if (ttlSeconds) {
        // Set with TTL
        await client.set(key, JSON.stringify(data), { EX: ttlSeconds });
        redisLogger.info(`Session [${sessionId}] saved to Redis with TTL: ${ttlSeconds}s`);
    } else {
        // Set without TTL
        await client.set(key, JSON.stringify(data));
        redisLogger.info(`Session [${sessionId}] saved to Redis`);
    }
}

export async function getSession(sessionId: string) {
    const key = `session:${sessionId}`;
    const data = await client.get(key);
    redisLogger.debug(`Session [${sessionId}] fetched from Redis`);
    return data ? JSON.parse(data) : null;
}

export async function clearSession(sessionId: string) {
    const key = `session:${sessionId}`;
    await client.del(key);

    // Also remove from session metadata
    await client.sRem("sessions:list", sessionId);
    await client.del(`session:meta:${sessionId}`);

    redisLogger.info(`Session [${sessionId}] cleared from Redis`);
}

// Session metadata management
export async function setSessionMetadata(sessionId: string, metadata: {
    title: string;
    lastMessage: string;
    timestamp: string;
    messageCount: number;
}, ttlSeconds?: number) {
    redisLogger.debug(`setSessionMetadata called for ${sessionId}`, metadata);

    const metaKey = `session:meta:${sessionId}`;

    if (ttlSeconds) {
        await client.set(metaKey, JSON.stringify(metadata), { EX: ttlSeconds });
        redisLogger.debug(`Set metadata with TTL ${ttlSeconds}s for ${sessionId}`);
    } else {
        await client.set(metaKey, JSON.stringify(metadata));
        redisLogger.debug(`Set metadata without TTL for ${sessionId}`);
    }

    // Add session ID to the sessions list (set ensures uniqueness)
    await client.sAdd("sessions:list", sessionId);
    redisLogger.debug(`Added ${sessionId} to sessions:list`);

    redisLogger.info(`Session metadata [${sessionId}] updated: ${metadata.title}`);
}

export async function getSessionMetadata(sessionId: string) {
    const metaKey = `session:meta:${sessionId}`;
    const data = await client.get(metaKey);
    return data ? JSON.parse(data) : null;
}

/**
 * Get all sessions stored in Redis
 * Uses session metadata for efficient listing
 */
export async function getAllSessions() {
    const sessionIds = await client.sMembers("sessions:list");
    const sessions = [];

    redisLogger.debug(`Found ${sessionIds.length} session IDs in sessions:list`, sessionIds);

    for (const sessionId of sessionIds) {
        redisLogger.debug(`Loading metadata for session ${sessionId}`);
        const metadata = await getSessionMetadata(sessionId);
        if (metadata) {
            sessions.push({
                id: sessionId,
                ...metadata
            });
            redisLogger.debug(`Added session ${sessionId} with metadata:`, metadata);
        } else {
            // Clean up orphaned session ID
            redisLogger.warn(`No metadata found for session ${sessionId}, removing from list`);
            await client.sRem("sessions:list", sessionId);
        }
    }

    // Sort by timestamp (newest first)
    sessions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    redisLogger.info(`Retrieved ${sessions.length} sessions from Redis`);
    return sessions;
}



// Debug function to inspect Redis state
export async function debugRedisState() {
    redisLogger.debug(`Inspecting Redis state...`);

    // Check sessions list
    const sessionIds = await client.sMembers("sessions:list");
    redisLogger.debug(`Sessions in list:`, sessionIds);

    // Check all session keys
    const sessionKeys = await client.keys("session:*");
    redisLogger.debug(`All session keys:`, sessionKeys);

    // Check all metadata keys
    const metaKeys = await client.keys("session:meta:*");
    redisLogger.debug(`All metadata keys:`, metaKeys);

    // Sample a few metadata entries
    for (const metaKey of metaKeys.slice(0, 5)) {
        const data = await client.get(metaKey);
        redisLogger.debug(`${metaKey}:`, data);
    }
}

export { client };