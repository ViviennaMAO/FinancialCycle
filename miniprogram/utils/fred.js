// FRED (Federal Reserve Economic Data) client.
//
// Talks to a Cloudflare Worker proxy that holds the FRED API key —
// NEVER ship a real API key inside the mini-program bundle.
//
// Deploy the proxy from /cloudflare-worker/fred-proxy.js, then paste
// its URL into PROXY_BASE below.

const cache = require('./cache.js');

// Deployed Vercel proxy. Holds FRED_API_KEY as a Vercel env var,
// never in this bundle. See top-level README.md for redeploy steps.
const PROXY_BASE = 'https://financial-cycle.vercel.app/api/fred';

const TTL_12H = 12 * 3600 * 1000;

// Curated FRED series with human-readable metadata + unit + cycle relevance.
const SERIES = {
  DGS10:    { label: '10Y 国债收益率',  unit: '%',  note: '股票折现率的基石 (本书第十章)' },
  DGS2:     { label: '2Y 国债收益率',   unit: '%',  note: '政策路径预期' },
  T10Y2Y:   { label: '10Y - 2Y 利差',   unit: 'pp', note: '负值 = 收益率曲线倒挂 → 衰退预警' },
  DFF:      { label: '联邦基金利率',     unit: '%',  note: '货币政策松紧度' },
  UNRATE:   { label: '失业率',          unit: '%',  note: '低位 + 高估值 → 熊市信号 (第六章)' },
  CPIAUCSL: { label: 'CPI (头条通胀)',  unit: '%',  note: '同比;>3% 为高通胀 → 紧货币风险' }
};

function fetchSeries(seriesId, opts) {
  opts = opts || {};
  const force = !!opts.force;

  if (!SERIES[seriesId]) {
    return Promise.reject(new Error('Unknown series: ' + seriesId));
  }

  const cacheKey = 'fred_' + seriesId;
  if (!force) {
    const cached = cache.get(cacheKey);
    if (cached) return Promise.resolve(Object.assign({ fromCache: true }, cached));
  }

  // CPI needs 13 observations to compute YoY %; everything else needs 2 for delta.
  const limit = seriesId === 'CPIAUCSL' ? 13 : 2;

  return new Promise((resolve, reject) => {
    const sep = PROXY_BASE.indexOf('?') === -1 ? '?' : '&';
    wx.request({
      url: PROXY_BASE + sep + 'series=' + seriesId + '&limit=' + limit,
      method: 'GET',
      timeout: 8000,
      success: (res) => {
        if (res.statusCode !== 200 || !res.data || !res.data.observations) {
          return reject(new Error('FRED proxy error ' + res.statusCode));
        }
        const parsed = parseObservations(seriesId, res.data.observations);
        cache.set(cacheKey, parsed, TTL_12H);
        resolve(Object.assign({ fromCache: false }, parsed));
      },
      fail: (err) => reject(err)
    });
  });
}

function parseObservations(seriesId, obs) {
  // Most recent first (proxy uses sort_order=desc).
  const meta = SERIES[seriesId];
  const points = obs
    .filter(o => o.value !== '.' && o.value != null)
    .map(o => ({ date: o.date, value: parseFloat(o.value) }));

  if (!points.length) return { id: seriesId, label: meta.label, unit: meta.unit, note: meta.note, value: null, date: null };

  const latest = points[0];
  const prev   = points[1];

  let display, delta = null, deltaSign = null;

  if (seriesId === 'CPIAUCSL') {
    // YoY change: compare today vs ~12 obs ago
    const yoyBase = points.find((_, i) => i >= 11) || points[points.length - 1];
    if (yoyBase) {
      const yoy = (latest.value / yoyBase.value - 1) * 100;
      display = yoy.toFixed(2);
      // delta vs prior month-on-month YoY (using prev pair)
      if (points.length >= 13) {
        const prevYoy = (points[1].value / points[12].value - 1) * 100;
        delta = (yoy - prevYoy).toFixed(2);
        deltaSign = yoy >= prevYoy ? 1 : -1;
      }
    } else {
      display = latest.value.toFixed(2);
    }
  } else {
    display = latest.value.toFixed(2);
    if (prev) {
      delta = (latest.value - prev.value).toFixed(2);
      deltaSign = latest.value >= prev.value ? 1 : -1;
    }
  }

  return {
    id: seriesId,
    label: meta.label,
    unit: meta.unit,
    note: meta.note,
    value: latest.value,
    display,
    date: latest.date,
    delta,
    deltaSign
  };
}

function fetchPanel(force) {
  const ids = ['DGS10', 'DGS2', 'T10Y2Y', 'DFF', 'UNRATE', 'CPIAUCSL'];
  return Promise.all(ids.map(id =>
    fetchSeries(id, { force }).catch(err => ({
      id, label: SERIES[id].label, unit: SERIES[id].unit,
      note: SERIES[id].note, value: null, display: '—',
      error: (err && err.message) || 'fetch failed'
    }))
  ));
}

module.exports = { fetchSeries, fetchPanel, SERIES, PROXY_BASE };
