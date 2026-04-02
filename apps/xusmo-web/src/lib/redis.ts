// =============================================================================
// Redis Connection (ioredis)
// Shared Redis client for BullMQ queues and caching.
// Usage: import { redis } from "@/lib/redis";
// =============================================================================

import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

function createRedisClient() {
  const client = new Redis(process.env.REDIS_URL ?? "redis://localhost:6380", {
    maxRetriesPerRequest: null, // Required by BullMQ
    retryStrategy(times) {
      if (times > 10) return null; // Stop retrying after 10 attempts
      return Math.min(times * 200, 5000); // Exponential backoff, max 5s
    },
    reconnectOnError(err) {
      const targetErrors = ["READONLY", "ECONNRESET", "ETIMEDOUT"];
      return targetErrors.some((e) => err.message.includes(e));
    },
  });

  client.on("error", (err) => {
    console.error("[Redis] Connection error:", err.message);
  });

  return client;
}

export const redis = globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;
