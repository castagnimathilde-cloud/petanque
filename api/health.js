import { redisPing } from './_redis.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const restUrl   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL;
  const restToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (!restUrl || !restToken) {
    return res.status(503).json({
      ok: false,
      problem: 'Variables Upstash REST manquantes',
      upstash_rest_url_set: false,
      upstash_rest_token_set: false,
      fix: 'console.upstash.com → votre base → section "REST API" → copiez UPSTASH_REDIS_REST_URL et UPSTASH_REDIS_REST_TOKEN → Vercel → Settings → Environment Variables',
    });
  }

  let ping = null;
  let error = null;
  try {
    ping = await redisPing();
  } catch (e) {
    error = e.message;
  }

  const ok = ping === 'PONG';
  return res.status(ok ? 200 : 503).json({
    ok,
    upstash_rest_url_set: true,
    upstash_rest_token_set: true,
    url_masked: restUrl.replace(/^(https?:\/\/[^.]+)(.*)$/, '$1***'),
    ping,
    error,
  });
}
