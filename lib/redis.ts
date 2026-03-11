import Redis from "ioredis";

let _redis: Redis | null = null;

function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
    _redis.on("error", (err) => {
      console.error("Redis connection error:", err.message);
    });
  }
  return _redis;
}

export const CACHE_TTL = {
  dailyMatches: 60 * 5,
  matchDetails: 60 * 10,
  teamForm: 60 * 60 * 6,
  h2h: 60 * 60 * 24,
  injuries: 60 * 60 * 2,
  standings: 60 * 60 * 12,
  aiPreview: 60 * 60,
  simulation: 60 * 60 * 2,
};

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const data = await getRedis().get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}

export async function setCache(
  key: string,
  data: unknown,
  ttl: number
): Promise<void> {
  try {
    await getRedis().set(key, JSON.stringify(data), "EX", ttl);
  } catch {
    // Cache write failure is non-fatal
  }
}

export async function incrementApiCallCount(): Promise<number> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const key = `api:calls:count:${today}`;
    const redis = getRedis();
    const count = await redis.incr(key);
    await redis.expire(key, 60 * 60 * 24);
    if (count >= 90) {
      console.warn(`API-Sports call count approaching limit: ${count}/100`);
    }
    return count;
  } catch {
    return 0;
  }
}
