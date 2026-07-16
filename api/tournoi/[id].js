function getCredentials() {
  const url   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error('UPSTASH_REDIS_REST_URL / TOKEN manquant dans Vercel.');
  return { url, token };
}

async function rGet(key) {
  const { url, token } = getCredentials();
  const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (data.result === null || data.result === undefined) return null;
  return JSON.parse(data.result);
}

async function rSet(key, value, ttl) {
  const { url, token } = getCredentials();
  const body = ['SET', key, JSON.stringify(value)];
  if (ttl) body.push('EX', ttl);
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
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

  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      await rSet(`tournoi:${id}`, req.body, 86400 * 7);
      return res.json({ ok: true });
    } catch (e) {
      return res.status(503).json({ error: 'Erreur serveur : ' + e.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
