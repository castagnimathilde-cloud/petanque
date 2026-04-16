import { Redis } from '@upstash/redis';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  let redis;
  try {
    redis = Redis.fromEnv();
  } catch {
    return res.status(503).json({ error: 'API non configurée — variables UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN manquantes dans Vercel.' });
  }

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const data = await redis.get(`tournoi:${id}`);
      if (!data) return res.status(404).json({ error: 'Tournoi introuvable' });
      return res.json(data);
    } catch {
      return res.status(503).json({ error: 'Erreur de connexion à la base de données Redis.' });
    }
  }

  if (req.method === 'PUT') {
    try {
      await redis.set(`tournoi:${id}`, req.body, { ex: 86400 * 7 });
      return res.json({ ok: true });
    } catch {
      return res.status(503).json({ error: 'Erreur de connexion à la base de données Redis.' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
