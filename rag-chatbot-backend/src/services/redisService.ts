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
    console.log(`🗑️ Session [${sessionId}] cleared from Redis`);
}

export { client };