import { getRedis } from './_redis.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const redisUrlSet = !!process.env.REDIS_URL;
  const redisUrlPreview = process.env.REDIS_URL
    ? process.env.REDIS_URL.replace(/:[^:@]+@/, ':***@').substring(0, 60) + '...'
    : 'non défini';

  if (!redisUrlSet) {
    return res.status(503).json({
      ok: false,
      error: 'REDIS_URL non défini dans les variables d\'environnement Vercel',
      redis_url: redisUrlPreview,
    });
  }

  try {
    const redis = getRedis();
    await redis.ping();
    return res.json({
      ok: true,
      message: 'Redis connecté avec succès ✅',
      redis_url: redisUrlPreview,
    });
  } catch (e) {
    return res.status(503).json({
      ok: false,
      error: e.message,
      redis_url: redisUrlPreview,
    });
  }
}
