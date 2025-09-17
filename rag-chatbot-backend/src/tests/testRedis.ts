import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

async function testRedis() {
    // Create client from .env
    const client = createClient({
        username: 'default',
        password: 'I8EhcRH5ZTmF3J2gA5JpxknhFMm1RrPi',
        socket: {
            host: 'redis-18825.c273.us-east-1-2.ec2.redns.redis-cloud.com',
            port: 18825
        }
    });

    client.on("error", (err) => console.error("❌ Redis Client Error:", err));

    try {
        console.log("⏳ Connecting to Redis Cloud...");
        await client.connect();
        console.log("✅ Connected to Redis Cloud");

        // Test SET
        await client.set("foo", "bar");
        console.log("📥 Inserted key 'foo' with value 'bar'");

        // Test GET
        const value = await client.get("foo");
        console.log("🔎 Retrieved key 'foo':", value);

        // Test DEL
        await client.del("foo");
        console.log("🗑️ Deleted key 'foo'");

        // Confirm deletion
        const deleted = await client.get("foo");
        console.log("🔎 After delete, 'foo':", deleted);

    } catch (err) {
        console.error("❌ Test failed:", err);
    } finally {
        await client.disconnect();
        console.log("🔌 Disconnected from Redis");
    }
}

testRedis();