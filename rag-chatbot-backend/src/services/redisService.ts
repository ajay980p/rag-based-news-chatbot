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

export async function setSession(sessionId: string, data: any) {
    await client.set(sessionId, JSON.stringify(data));
    console.log(`💾 Session [${sessionId}] saved to Redis`);
}

export async function getSession(sessionId: string) {
    const data = await client.get(sessionId);
    console.log(`📥 Session [${sessionId}] fetched from Redis`);
    return data ? JSON.parse(data) : null;
}

export async function clearSession(sessionId: string) {
    await client.del(sessionId);
    console.log(`🗑️ Session [${sessionId}] cleared from Redis`);
}

export { client };