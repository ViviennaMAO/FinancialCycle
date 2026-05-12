const { wacc, costOfEquityCAPM } = require('../../utils/finance.js');
const fred = require('../../utils/fred.js');

// All slider values are stored *10 or *100 to dodge integer-only step problems.
// Convert at compute time.

Page({
  data: {
    equityPct: 60,   // E/V in %
    rf10: 25,        // Rf*10 → 2.5%
    rfPct: '2.5',
    beta10: 12,      // β*10 → 1.2
    beta: '1.2',
    erp100: 55,      // ERP*100 → 5.5%
    erpPct: '5.5',
    rd10: 50,        // Rd*10 → 5.0%
    rdPct: '5.0',
    tax100: 25,
    taxPct: '25',

    rePct: '—',
    rdAtPct: '—',
    waccPct: '—',
    insight: '',
    snapshots: [],
    fredSyncing: false,
    fredSyncMsg: ''
  },

  onLoad() { this.compute(); },

  syncRfFromFred() {
    if (this.data.fredSyncing) return;
    if (fred.PROXY_BASE.indexOf('YOUR_PROJECT') !== -1 || fred.PROXY_BASE.indexOf('YOUR_SUBDOMAIN') !== -1) {
      this.setData({ fredSyncMsg: '⚠️ 尚未配置 FRED 代理' });
      return;
    }
    this.setData({ fredSyncing: true, fredSyncMsg: '' });
    fred.fetchSeries('DGS10').then(r => {
      if (r.value == null) throw new Error('no data');
      // slider is rf10 = Rf * 10 (so 25 → 2.5%)
      const slider = Math.max(0, Math.min(80, Math.round(r.value * 10)));
      this.setData({
        rf10: slider,
        rfPct: (slider / 10).toFixed(1),
        fredSyncing: false,
        fredSyncMsg: '✓ 已用 ' + r.date + ' 的 10Y 国债 ' + r.display + '% 作为 Rf'
      });
      this.compute();
    }).catch(() => {
      this.setData({ fredSyncing: false, fredSyncMsg: '⚠️ 获取失败,检查代理与白名单' });
    });
  },

  onEquityChange(e) { this.setData({ equityPct: e.detail.value }); this.compute(); },
  onRfChange(e)     { const v = e.detail.value; this.setData({ rf10: v, rfPct: (v/10).toFixed(1) }); this.compute(); },
  onBetaChange(e)   { const v = e.detail.value; this.setData({ beta10: v, beta: (v/10).toFixed(1) }); this.compute(); },
  onErpChange(e)    { const v = e.detail.value; this.setData({ erp100: v, erpPct: (v/10).toFixed(1) }); this.compute(); },
  onRdChange(e)     { const v = e.detail.value; this.setData({ rd10: v, rdPct: (v/10).toFixed(1) }); this.compute(); },
  onTaxChange(e)    { const v = e.detail.value; this.setData({ tax100: v, taxPct: String(v) }); this.compute(); },

  compute() {
    const eW = this.data.equityPct / 100;
    const dW = 1 - eW;
    const rf  = this.data.rf10  / 1000;
    const beta = this.data.beta10 / 10;
    const erp = this.data.erp100 / 1000;
    const rd  = this.data.rd10  / 1000;
    const tax = this.data.tax100 / 100;

    const re = costOfEquityCAPM(rf, beta, erp);
    const rdAt = rd * (1 - tax);
    const w = wacc({
      equity: eW, debt: dW,
      costEquity: re, costDebt: rd, taxRate: tax
    });

    // Three historical snapshots — using user's current β / equity weight,
    // changing only Rf and ERP to match the era.
    const snaps = [
      { name: '1980s 高通胀', rf: 8.0,  erp: 4.0 },
      { name: '1990s 大稳健', rf: 5.0,  erp: 5.0 },
      { name: '2020s 零利率', rf: 0.5,  erp: 6.5 }
    ].map(s => {
      const sRf  = s.rf  / 100;
      const sErp = s.erp / 100;
      const sRe  = costOfEquityCAPM(sRf, beta, sErp);
      const sWacc = wacc({
        equity: eW, debt: dW,
        costEquity: sRe,
        costDebt: Math.max(sRf + 0.015, 0.005),
        taxRate: tax
      });
      return {
        name: s.name,
        rf:  s.rf.toFixed(1),
        erp: s.erp.toFixed(1),
        wacc: (sWacc * 100).toFixed(2)
      };
    });

    let insight;
    if (rf < 0.01) {
      insight = '🌊 零利率会大幅压低 WACC,显著推高所有"长久期资产"的估值 — 这是 2010s 成长股、地产、长债同时大涨的根本动因。但第十章警告:如果 Rf 接近 0 是因为市场预期 g 也接近 0,降息红利会被增长崩塌抵消。';
    } else if (re > 0.15) {
      insight = '⚠️ 股权成本 > 15%:或 Beta 偏高,或 ERP 反映极度避险情绪 — 这种环境下,只有真正 IRR 远超 15% 的项目才值得做。这往往是绝望期的特征。';
    } else if (w < 0.05) {
      insight = '⚡ WACC < 5%:接近历史地板,所有 DCF 模型都会得出极高估值。这是泡沫的温床 — 第八章列出的"新估值方法"通常诞生于此环境。';
    } else {
      insight = '⚖️ WACC 处于"正常"区间。注意:WACC 不仅是估值的折现率,也是企业项目立项的"准入门槛"。本书反复提醒,IRR-WACC 的差是 alpha 的真正来源,而非 IRR 本身。';
    }

    this.setData({
      rePct:  (re * 100).toFixed(2),
      rdAtPct: (rdAt * 100).toFixed(2),
      waccPct: (w * 100).toFixed(2),
      insight,
      snapshots: snaps
    });
  }
});
