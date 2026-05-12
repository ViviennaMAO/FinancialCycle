const { npv, phaseAdjustedRate, PHASE_LABEL, PHASE_ADJUST, fmtMoney } = require('../../utils/finance.js');
const { SCENARIOS } = require('../../data/chapters.js');
const fred = require('../../utils/fred.js');

const PHASE_KEYS = ['despair', 'hope', 'growth', 'optimism'];

Page({
  data: {
    scenarios: [],
    currentScenario: '希望期反弹',
    scenarioDesc: '',
    cashflows: [-100, 5, 25, 30, 35, 40],
    baseRate100: 10,    // slider uses *100 so step=0.5 maps to 0.5%
    baseRatePct: '10.0',
    phaseRows: [],
    bestPhase: 'hope',
    insight: '',
    fredSyncing: false,
    fredSyncMsg: ''
  },

  onLoad() {
    const list = Object.keys(SCENARIOS).map(name => ({ name }));
    this.setData({ scenarios: list });
    this.useScenario({ currentTarget: { dataset: { name: '希望期反弹' } } });
  },

  useScenario(e) {
    const name = e.currentTarget.dataset.name;
    const s = SCENARIOS[name];
    if (!s) return;
    this.setData({
      currentScenario: name,
      scenarioDesc: s.desc,
      cashflows: s.cashflows.slice(),
      baseRate100: s.suggestedRate * 100,
      baseRatePct: (s.suggestedRate * 100).toFixed(1)
    });
    this.compute();
  },

  onCfChange(e) {
    const idx = +e.currentTarget.dataset.idx;
    const raw = e.detail.value;
    const v = raw === '' || raw === '-' ? 0 : Number(raw);
    if (!isFinite(v)) return;
    const arr = this.data.cashflows.slice();
    arr[idx] = v;
    this.setData({ cashflows: arr });
    this.compute();
  },

  onRateChange(e) {
    const v = e.detail.value;
    this.setData({ baseRate100: v, baseRatePct: v.toFixed(1) });
    this.compute();
  },

  syncFromFred() {
    if (this.data.fredSyncing) return;
    if (fred.PROXY_BASE.indexOf('YOUR_PROJECT') !== -1 || fred.PROXY_BASE.indexOf('YOUR_SUBDOMAIN') !== -1) {
      this.setData({ fredSyncMsg: '⚠️ 尚未配置 FRED 代理 — 看 cloudflare-worker/README.md' });
      return;
    }
    this.setData({ fredSyncing: true, fredSyncMsg: '' });
    fred.fetchSeries('DGS10').then(r => {
      if (r.value == null) throw new Error('no data');
      // Use 10Y treasury + 4% equity risk premium as a "market-cycle-neutral" hurdle.
      const rate = r.value + 4;
      const clamped = Math.max(1, Math.min(20, rate));
      this.setData({
        baseRate100: clamped,
        baseRatePct: clamped.toFixed(1),
        fredSyncing: false,
        fredSyncMsg: '✓ 已用 ' + r.date + ' 的 10Y 国债 (' + r.display + '%) + 4% ERP'
      });
      this.compute();
    }).catch(() => {
      this.setData({ fredSyncing: false, fredSyncMsg: '⚠️ 获取失败,检查域名白名单 / 代理部署' });
    });
  },

  compute() {
    const base = this.data.baseRate100 / 100;
    const cfs = this.data.cashflows;

    const rows = PHASE_KEYS.map(k => {
      const r = phaseAdjustedRate(base, k);
      const v = npv(r, cfs);
      return {
        key: k,
        label: PHASE_LABEL[k],
        rate: r,
        ratePct: (r * 100).toFixed(1),
        npv: v,
        npvFmt: (v >= 0 ? '+' : '') + fmtMoney(v, 1)
      };
    });

    // Best phase = highest NPV
    let best = rows[0];
    rows.forEach(r => { if (r.npv > best.npv) best = r; });

    // Build a context-aware insight string.
    const spread = rows.reduce((m, r) => Math.max(m, r.npv), -Infinity) -
                   rows.reduce((m, r) => Math.min(m, r.npv),  Infinity);
    let insight;
    if (spread > Math.abs(cfs[0]) * 0.5) {
      insight = '⚡ NPV 在不同周期阶段间的跨度极大 (' + fmtMoney(spread, 1) +
        '),说明此项目高度久期敏感 — 高 PE / 远期现金流大的项目,其"估值"几乎只是 r 的函数,而非基本面。';
    } else if (rows.every(r => r.npv > 0)) {
      insight = '✅ 全周期 NPV 都为正,说明项目本身就有"经济价值",不依赖周期红利 — 这是巴菲特意义上的"好生意"。';
    } else if (rows.every(r => r.npv < 0)) {
      insight = '🔴 即使在最有利的周期阶段,NPV 仍为负 — 项目本身不创造价值,不要靠"等周期反转"自我安慰。';
    } else {
      insight = '↔️ NPV 在乐观/绝望两极间正负翻转,说明这是个"周期红利依赖型"项目 — 入场点决定一切。希望期年化 +69% 的回报(表 4.1),很大一部分就来自这种翻转。';
    }

    this.setData({ phaseRows: rows, bestPhase: best.key, insight });
  }
});
