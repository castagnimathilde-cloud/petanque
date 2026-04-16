import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { tournoiId, nom, j1, j2, j3, empl } = req.body;

  if (!nom || !j1) return res.status(400).json({ error: 'Nom et Joueur 1 obligatoires' });

  const tournoi = await redis.get(`tournoi:${tournoiId}`);
  if (!tournoi) return res.status(404).json({ error: 'Tournoi introuvable' });

  const key = `regs:${tournoiId}`;
  const existing = (await redis.get(key)) || [];

  const duplicate = existing.find(
    (r) => r.nom.toLowerCase() === nom.trim().toLowerCase()
  );
  if (duplicate) return res.status(409).json({ error: "Ce nom d'équipe est déjà en attente d'inscription" });

  const reg = {
    _id: Date.now() + Math.random(),
    _ts: Date.now(),
    tournoiId,
    nom: nom.trim(),
    j1: (j1 || '').trim(),
    j2: (j2 || '').trim(),
    j3: (j3 || '').trim(),
    empl: (empl || '').trim(),
  };

  existing.push(reg);
  await redis.set(key, existing, { ex: 86400 });

  return res.json({ ok: true });
}
