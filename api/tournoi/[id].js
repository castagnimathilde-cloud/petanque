import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;

  if (req.method === 'GET') {
    const data = await kv.get(`tournoi:${id}`);
    if (!data) return res.status(404).json({ error: 'Tournoi introuvable' });
    return res.json(data);
  }

  if (req.method === 'PUT') {
    await kv.set(`tournoi:${id}`, req.body, { ex: 86400 * 7 }); // 7 jours TTL
    return res.json({ ok: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
