export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const matchingKeys = Object.keys(process.env).filter(
    (k) => k.includes('UPSTASH') || k.includes('KV_') || k.includes('REDIS')
  );

  res.json({
    matching_keys: matchingKeys,
    upstash_url_length: (process.env.UPSTASH_REDIS_REST_URL || '').length,
    upstash_token_length: (process.env.UPSTASH_REDIS_REST_TOKEN || '').length,
    kv_url_length: (process.env.KV_REST_API_URL || '').length,
    kv_token_length: (process.env.KV_REST_API_TOKEN || '').length,
    redis_url_length: (process.env.REDIS_URL || '').length,
  });
}
