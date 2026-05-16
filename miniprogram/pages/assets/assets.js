const { PHASE_LABEL, PHASE_EMOJI } = require('../../utils/finance.js');
const { ASSET_LABELS, ALT_FLAVOR, STYLE_TILT, RATIONALE, ASSET_COLOR, getAllocation } = require('../../utils/portfolio.js');

const RISKS = [
  { key: 'conservative', name: '保守',  emoji: '🛡', desc: '抗回撤优先' },
  { key: 'balanced',     name: '平衡',  emoji: '⚖️', desc: '股债均衡' },
  { key: 'aggressive',   name: '激进',  emoji: '🚀', desc: '回报优先' }
];

const RISK_LABEL = { conservative: '保守', balanced: '平衡', aggressive: '激进' };

const ASSET_ORDER = ['stocks', 'bonds', 'alt', 'cash'];

Page({
  data: {
    phaseKeys: ['despair', 'hope', 'growth', 'optimism'],
    phaseLabel: PHASE_LABEL,
    phaseEmoji: PHASE_EMOJI,
    risks: RISKS,
    phase: null,
    risk: 'balanced',
    riskLabel: '平衡',
    phaseFromCycle: null,
    allocation: null,
    bars: [],
    altFlavor: '',
    rationale: '',
    styleTilt: { primary: '', secondary: '' }
  },

  onShow() {
    // Pick up the phase the user just resolved on the cycle page (if any).
    try {
      const fromCycle = wx.getStorageSync('cycle_phase');
      if (fromCycle && !this.data.phase) {
        this.setData({ phaseFromCycle: fromCycle, phase: fromCycle });
        this.recompute();
      } else if (!this.data.phase) {
        // default to growth so the page isn't empty on first visit
        this.setData({ phase: 'growth' });
        this.recompute();
      }
    } catch (e) {}
  },

  pickPhase(e) {
    this.setData({ phase: e.currentTarget.dataset.phase });
    this.recompute();
  },

  pickRisk(e) {
    const risk = e.currentTarget.dataset.risk;
    this.setData({ risk, riskLabel: RISK_LABEL[risk] });
    this.recompute();
  },

  recompute() {
    const { phase, risk } = this.data;
    if (!phase || !risk) return;
    const a = getAllocation(phase, risk);
    if (!a) return;
    const bars = ASSET_ORDER.map(k => ({
      key: k,
      name: ASSET_LABELS[k],
      pct: a[k],
      color: ASSET_COLOR[k]
    }));
    this.setData({
      allocation: a,
      bars,
      altFlavor: ALT_FLAVOR[phase],
      rationale: RATIONALE[phase],
      styleTilt: STYLE_TILT[phase]
    });
  }
});
