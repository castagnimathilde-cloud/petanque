function getCredentials() {
  const url   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    throw new Error(
      'UPSTASH_REDIS_REST_URL et UPSTASH_REDIS_REST_TOKEN manquants. ' +
      'Ajoutez-les dans Vercel → Settings → Environment Variables depuis console.upstash.com → REST API.'
    );
  }
  return { url, token };
}

export async function redisGet(key) {
  const { url, token } = getCredentials();
  const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (data.result === null || data.result === undefined) return null;
  return JSON.parse(data.result);
}

export async function redisSet(key, value, ttlSeconds) {
  const { url, token } = getCredentials();
  const body = ['SET', key, JSON.stringify(value)];
  if (ttlSeconds) body.push('EX', ttlSeconds);
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.result;
}

export async function redisPing() {
  const { url, token } = getCredentials();
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(['PING']),
  });
  const data = await res.json();
  return data.result;
}
