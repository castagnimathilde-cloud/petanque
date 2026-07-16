import Redis from 'ioredis';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const kvUrl    = process.env.KV_URL;
  const redisUrl = process.env.REDIS_URL;
  const url      = kvUrl || redisUrl;

  if (!url) {
    return res.status(503).json({
      ok: false,
      problem: 'KV_URL et REDIS_URL sont tous les deux absents',
      kv_url_set: false,
      redis_url_set: false,
      fix: 'Vercel → Storage → redis-cinereous-door → Connect to Project',
    });
  }

  const masked = url.replace(/:[^:@]+@/, ':***@').substring(0, 80);
  const scheme = url.split('://')[0];

  let pingResult = null;
  let pingError  = null;
  try {
    const redis = new Redis(url, {
      maxRetriesPerRequest: 1,
      connectTimeout: 4000,
      commandTimeout: 4000,
      lazyConnect: true,
      enableReadyCheck: false,
    });
    redis.on('error', () => {});
    await redis.ping();
    pingResult = 'PONG';
    redis.disconnect();
  } catch (e) {
    pingError = e.message;
  }

  const ok = pingResult === 'PONG';
  return res.status(ok ? 200 : 503).json({
    ok,
    url_source: kvUrl ? 'KV_URL' : 'REDIS_URL',
    kv_url_set: !!kvUrl,
    redis_url_set: !!redisUrl,
    url_masked: masked,
    scheme,
    hint: scheme === 'redis'
      ? '⚠️ Upstash nécessite rediss:// (TLS). Vérifiez votre URL.'
      : scheme === 'rediss' ? '✅ Schéma TLS correct' : 'Schéma inconnu',
    ping: pingResult,
    error: pingError,
  });
}
