// Vercel serverless function: FRED API proxy.
//
// Routed to /api/fred automatically by Vercel.
// Reads FRED_API_KEY from Vercel env vars — NEVER ship the key in the mini-program.
//
// Deploy:
//   1. Push this repo to GitHub.
//   2. Import on vercel.com → New Project → pick the repo.
//   3. Add env var FRED_API_KEY in the project settings.
//   4. Deploy. Function URL = https://<your-project>.vercel.app/api/fred

const ALLOWED_SERIES = new Set([
  'DGS10',     // 10Y Treasury
  'DGS2',      // 2Y Treasury
  'T10Y2Y',    // 10Y - 2Y spread
  'DFF',       // Fed funds rate (daily)
  'FEDFUNDS',  // Fed funds rate (monthly)
  'UNRATE',    // Unemployment
  'CPIAUCSL',  // CPI all urban consumers
  'GS10',      // 10Y monthly avg
  'CIVPART',   // labor force participation
  'PAYEMS'     // non-farm payrolls
]);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'method not allowed' });

  const key = process.env.FRED_API_KEY;
  if (!key) {
    return res.status(500).json({ error: 'FRED_API_KEY env not set on Vercel project' });
  }

  const series = (req.query && req.query.series) || '';
  const rawLimit = (req.query && req.query.limit) || '2';
  const limit = Math.max(1, Math.min(50, parseInt(rawLimit, 10) || 2));

  if (!series) {
    return res.status(400).json({
      error: 'missing series',
      allowed: [...ALLOWED_SERIES]
    });
  }
  if (!ALLOWED_SERIES.has(series)) {
    return res.status(400).json({ error: 'series not in whitelist', series });
  }

  const fredUrl =
    'https://api.stlouisfed.org/fred/series/observations' +
    '?series_id=' + encodeURIComponent(series) +
    '&api_key=' + encodeURIComponent(key) +
    '&file_type=json' +
    '&sort_order=desc' +
    '&limit=' + limit;

  try {
    const upstream = await fetch(fredUrl);
    if (!upstream.ok) {
      const text = await upstream.text().catch(() => '');
      return res.status(502).json({
        error: 'upstream non-2xx',
        status: upstream.status,
        body: text.slice(0, 500)
      });
    }
    const data = await upstream.json();
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.setHeader('X-Fred-Series', series);
    return res.status(200).json(data);
  } catch (e) {
    return res.status(502).json({ error: 'upstream fetch failed', detail: String(e) });
  }
};
