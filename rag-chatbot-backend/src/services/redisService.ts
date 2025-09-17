import { createClient } from "redis";

const client = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379"
});

client.on("error", (err) => console.error("Redis Client Error", err));

export async function initRedis() {
    await client.connect();
}

export async function setSession(sessionId: string, data: any) {
    await client.set(sessionId, JSON.stringify(data));
}

export async function getSession(sessionId: string) {
    const data = await client.get(sessionId);
    return data ? JSON.parse(data) : null;
}

export async function clearSession(sessionId: string) {
    await client.del(sessionId);
}