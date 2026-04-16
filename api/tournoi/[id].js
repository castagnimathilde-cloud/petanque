import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;

  if (req.method === 'GET') {
    const data = await redis.get(`tournoi:${id}`);
    if (!data) return res.status(404).json({ error: 'Tournoi introuvable' });
    return res.json(data);
  }

  if (req.method === 'PUT') {
    await redis.set(`tournoi:${id}`, req.body, { ex: 86400 * 7 });
    return res.json({ ok: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
