const { irr, phaseAdjustedRate, PHASE_LABEL, fmtPct } = require('../../utils/finance.js');
const { SCENARIOS } = require('../../data/chapters.js');

const PHASE_KEYS = ['despair', 'hope', 'growth', 'optimism'];
const BASE_HURDLE = 0.09; // 周期中性的要求回报基线 (≈ 长期股权资本成本)

Page({
  data: {
    scenarios: [],
    currentScenario: '希望期反弹',
    scenarioDesc: '',
    cashflows: [-100, 5, 25, 30, 35, 40],
    irrVal: NaN,
    irrPct: '—',
    irrStatus: '',
    phaseRows: [],
    insight: ''
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
      cashflows: s.cashflows.slice()
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

  compute() {
    const cfs = this.data.cashflows;
    const r = irr(cfs);

    let irrPct, irrStatus;
    if (!isFinite(r) || isNaN(r)) {
      irrPct = '无解';
      irrStatus = '现金流没有符号反转,或无法收敛 — 调整现金流以获得合理 IRR';
    } else {
      irrPct = fmtPct(r, 2);
      if (r > 0.20) irrStatus = '⚠️ IRR > 20%:可能是真正的好项目,也可能是对现金流过度乐观 — 看看分子的可信度';
      else if (r > 0.10) irrStatus = '✅ 高于长期股权资本成本';
      else if (r > 0)    irrStatus = '⚠️ 略高于无风险利率,但未必覆盖风险溢价';
      else               irrStatus = '🔴 IRR 为负 — 项目本身在销毁价值';
    }

    const rows = PHASE_KEYS.map(k => {
      const hurdle = phaseAdjustedRate(BASE_HURDLE, k);
      const beats = isFinite(r) && r > hurdle;
      const spread = isFinite(r) ? ((r - hurdle) * 100).toFixed(1) + '%' : '—';
      return {
        key: k,
        label: PHASE_LABEL[k],
        hurdle,
        hurdlePct: (hurdle * 100).toFixed(1),
        beats,
        spread: (beats && isFinite(r) ? '+' : '') + spread
      };
    });

    let insight;
    if (!isFinite(r)) {
      insight = '现金流结构有问题 — IRR 要求 Σ正现金流 ≠ 0 且至少一次符号反转。';
    } else {
      const beatAll = rows.every(x => x.beats);
      const beatNone = rows.every(x => !x.beats);
      if (beatAll) {
        insight = '✅ 在 4 个周期阶段都跑赢要求回报 — 这是一个"穿越周期"的项目。注意验证现金流假设是否被乐观期情绪所放大。';
      } else if (beatNone) {
        insight = '🔴 即使在最宽松的周期阶段(乐观期)也跑输 — 项目不具备经济上的价值创造能力。';
      } else {
        insight = '↔️ 项目盈亏取决于你"在哪个阶段入场"。本书核心提醒:乐观期 IRR 越高,越要警惕未来现金流是不是被周期高峰系统性高估了。希望期入场是反共识但回报最丰厚的位置。';
      }
    }

    this.setData({
      irrVal: r,
      irrPct,
      irrStatus,
      phaseRows: rows,
      insight
    });
  }
});
