// FRED proxy — Cloudflare Worker.
//
// Holds the real FRED API key in env so the mini-program never sees it.
// Whitelists which series can be queried (defense in depth).
// Caches at the edge for 1h (FRED data updates daily / monthly).
//
// Deploy:
//   1. npm i -g wrangler
//   2. wrangler login
//   3. wrangler init fred-proxy → drop this file in as src/index.js
//   4. wrangler secret put FRED_API_KEY     (paste your key from research.stlouisfed.org)
//   5. wrangler deploy
//   → copy the printed URL into miniprogram/utils/fred.js PROXY_BASE
//   → add the same URL host to Luffa console request 合法域名 whitelist

const ALLOWED_SERIES = new Set([
  'DGS10',     // 10Y Treasury
  'DGS2',      // 2Y Treasury
  'T10Y2Y',    // 10Y - 2Y spread
  'DFF',       // Federal Funds Rate
  'FEDFUNDS',  // Effective Fed Funds (monthly)
  'UNRATE',    // Unemployment
  'CPIAUCSL',  // CPI all urban consumers
  'GS10',      // 10Y monthly avg
  'CIVPART',   // labor force participation
  'PAYEMS'     // non-farm payrolls
]);

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, OPTIONS',
  'access-control-max-age': '86400'
};

function json(body, status, extraHeaders) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: Object.assign(
      { 'content-type': 'application/json; charset=utf-8' },
      CORS,
      extraHeaders || {}
    )
  });
}

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }
    if (req.method !== 'GET') {
      return json({ error: 'method not allowed' }, 405);
    }

    if (!env.FRED_API_KEY) {
      return json({ error: 'FRED_API_KEY secret not set on the worker' }, 500);
    }

    const url = new URL(req.url);
    const series = url.searchParams.get('series');
    const rawLimit = url.searchParams.get('limit') || '2';
    const limit = Math.max(1, Math.min(50, parseInt(rawLimit, 10) || 2));

    if (!series) {
      return json({
        error: 'missing series',
        allowed: [...ALLOWED_SERIES]
      }, 400);
    }
    if (!ALLOWED_SERIES.has(series)) {
      return json({ error: 'series not in whitelist', series }, 400);
    }

    const fredUrl =
      'https://api.stlouisfed.org/fred/series/observations' +
      '?series_id=' + encodeURIComponent(series) +
      '&api_key=' + encodeURIComponent(env.FRED_API_KEY) +
      '&file_type=json' +
      '&sort_order=desc' +
      '&limit=' + limit;

    let upstream;
    try {
      upstream = await fetch(fredUrl, {
        cf: { cacheTtl: 3600, cacheEverything: true }
      });
    } catch (e) {
      return json({ error: 'upstream fetch failed', detail: String(e) }, 502);
    }

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => '');
      return json({
        error: 'upstream non-2xx',
        status: upstream.status,
        body: text.slice(0, 500)
      }, 502);
    }

    const data = await upstream.json();
    return json(data, 200, {
      'cache-control': 'public, max-age=3600',
      'x-fred-series': series
    });
  }
};
