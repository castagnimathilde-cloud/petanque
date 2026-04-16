import { Redis } from '@upstash/redis';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  let redis;
  try {
    redis = Redis.fromEnv();
  } catch {
    return res.status(503).json({ error: 'API non configurée — variables Redis manquantes dans Vercel.' });
  }

  const { tournoiId } = req.query;
  const key = `regs:${tournoiId}`;

  if (req.method === 'GET') {
    try {
      const since = Number(req.query.since || 0);
      const regs = (await redis.get(key)) || [];
      return res.json(regs.filter((r) => r._ts > since));
    } catch {
      return res.status(503).json({ error: 'Erreur de connexion à la base de données Redis.' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { ids } = req.body;
      const regs = (await redis.get(key)) || [];
      const remaining = regs.filter((r) => !ids.includes(r._id));
      await redis.set(key, remaining, { ex: 86400 });
      return res.json({ ok: true });
    } catch {
      return res.status(503).json({ error: 'Erreur de connexion à la base de données Redis.' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
