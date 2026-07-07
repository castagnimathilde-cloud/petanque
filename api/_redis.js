import Redis from 'ioredis';

let _client = null;

export function getRedis() {
  if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL manquant dans les variables Vercel. Ajoutez-la dans Settings → Environment Variables.');
  }
  if (!_client || _client.status === 'end' || _client.status === 'close') {
    _client = new Redis(process.env.REDIS_URL, {
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
