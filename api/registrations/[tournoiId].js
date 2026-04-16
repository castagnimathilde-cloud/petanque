import { redisGet, redisSet } from '../_redis.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { tournoiId } = req.query;
  const key = `regs:${tournoiId}`;

  if (req.method === 'GET') {
    try {
      const since = Number(req.query.since || 0);
      const regs = (await redisGet(key)) || [];
      return res.json(regs.filter((r) => r._ts > since));
    } catch (e) {
      return res.status(503).json({ error: 'Erreur serveur : ' + e.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { ids } = req.body;
      const regs = (await redisGet(key)) || [];
      const remaining = regs.filter((r) => !ids.includes(r._id));
      await redisSet(key, remaining, 86400);
      return res.json({ ok: true });
    } catch (e) {
      return res.status(503).json({ error: 'Erreur serveur : ' + e.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
