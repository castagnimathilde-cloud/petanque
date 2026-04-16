import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { tournoiId } = req.query;
  const key = `regs:${tournoiId}`;

  if (req.method === 'GET') {
    const since = Number(req.query.since || 0);
    const regs = (await redis.get(key)) || [];
    return res.json(regs.filter((r) => r._ts > since));
  }

  if (req.method === 'DELETE') {
    const { ids } = req.body;
    const regs = (await redis.get(key)) || [];
    const remaining = regs.filter((r) => !ids.includes(r._id));
    await redis.set(key, remaining, { ex: 86400 });
    return res.json({ ok: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
