import { createClient } from "redis";

/**
 * Shared Redis / Valkey client.
 *
 * Used for:
 * - job queues (BullMQ)
 * - ingestion idempotency (fingerprints)
 *
 * Single connection, reused everywhere.
 */

export const redis = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
});

redis.on("error", (err) => {
    console.error("[redis] connection error", err);
});

redis.on("connect", () => {
    console.log("[redis] connected");
});

// Ensure connection is established on startup
await redis.connect();
