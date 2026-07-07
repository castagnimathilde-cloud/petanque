import Redis from 'ioredis';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const url = process.env.REDIS_URL;

  if (!url) {
    return res.status(503).json({
      ok: false,
      problem: 'REDIS_URL non défini dans les variables Vercel',
      fix: 'Vercel → Settings → Environment Variables → ajouter REDIS_URL',
    });
  }

  // Show masked URL to help diagnose wrong format
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
    redis_url_masked: masked,
    scheme,
    hint: scheme === 'redis'
      ? '⚠️ Upstash nécessite rediss:// (avec TLS). Vérifiez l\'URL dans votre dashboard Upstash.'
      : scheme === 'rediss' ? '✅ Schéma TLS correct' : 'Schéma inconnu',
    ping: pingResult,
    error: pingError,
  });
}
