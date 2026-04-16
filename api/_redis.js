import Redis from 'ioredis';

let _client = null;

/**
 * Returns a singleton ioredis client using REDIS_URL env var.
 * Recreates the client if it has disconnected.
 */
export function getRedis() {
  if (!process.env.REDIS_URL) {
    throw new Error("REDIS_URL manquant dans les variables d'environnement Vercel.");
  }
  if (!_client || _client.status === 'end') {
    _client = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: false,
      connectTimeout: 5000,
      lazyConnect: false,
    });
  }
  return _client;
}

/** Store a JS value as JSON with optional TTL in seconds */
export async function redisSet(key, value, ttlSeconds) {
  const redis = getRedis();
  if (ttlSeconds) {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } else {
    await redis.set(key, JSON.stringify(value));
  }
}

/** Retrieve and parse a JSON value (returns null if missing) */
export async function redisGet(key) {
  const redis = getRedis();
  const raw = await redis.get(key);
  if (raw === null) return null;
  return JSON.parse(raw);
}
