import Redis from 'ioredis';

let _client = null;

export function getRedis() {
  const url = process.env.KV_URL || process.env.REDIS_URL;
  if (!url) {
    throw new Error('KV_URL / REDIS_URL manquant dans les variables Vercel.');
  }
  if (!_client || _client.status === 'end' || _client.status === 'close') {
    _client = new Redis(url, {
      maxRetriesPerRequest: 1,
      connectTimeout: 4000,
      commandTimeout: 4000,
      lazyConnect: true,
      enableReadyCheck: false,
    });
    _client.on('error', () => {}); // prevent unhandled error crash
  }
  return _client;
}

export async function redisSet(key, value, ttlSeconds) {
  const redis = getRedis();
  const payload = JSON.stringify(value);
  if (ttlSeconds) {
    await redis.set(key, payload, 'EX', ttlSeconds);
  } else {
    await redis.set(key, payload);
  }
}

export async function redisGet(key) {
  const redis = getRedis();
  const raw = await redis.get(key);
  if (raw === null) return null;
  return JSON.parse(raw);
}
