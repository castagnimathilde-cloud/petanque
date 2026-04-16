import Redis from 'ioredis';

let _redis = null;
function getRedis() {
  if (!process.env.REDIS_URL) throw new Error("REDIS_URL manquant dans les variables d'environnement Vercel.");
  if (!_redis || _redis.status === 'end') {
    _redis = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 3, enableReadyCheck: false, connectTimeout: 5000 });
  }
  return _redis;
}
async function rGet(key) {
  const raw = await getRedis().get(key);
  return raw === null ? null : JSON.parse(raw);
}
async function rSet(key, value, ttl) {
  await getRedis().set(key, JSON.stringify(value), 'EX', ttl);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const data = await rGet(`tournoi:${id}`);
      if (!data) return res.status(404).json({ error: 'Tournoi introuvable' });
      return res.json(data);
    } catch (e) {
      return res.status(503).json({ error: 'Erreur serveur : ' + e.message });
    }
  }

  if (req.method === 'PUT') {
    try {
      await rSet(`tournoi:${id}`, req.body, 86400 * 7);
      return res.json({ ok: true });
    } catch (e) {
      return res.status(503).json({ error: 'Erreur serveur : ' + e.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
