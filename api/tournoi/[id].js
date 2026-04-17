import { redisGet, redisSet } from '../_redis.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const data = await redisGet(`tournoi:${id}`);
      if (!data) return res.status(404).json({ error: 'Tournoi introuvable' });
      return res.json(data);
    } catch (e) {
      return res.status(503).json({ error: 'Erreur serveur : ' + e.message });
    }
  }

  // Accept both POST and PUT for saving tournament data
  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      await redisSet(`tournoi:${id}`, req.body, 86400 * 7);
      return res.json({ ok: true });
    } catch (e) {
      return res.status(503).json({ error: 'Erreur serveur : ' + e.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
