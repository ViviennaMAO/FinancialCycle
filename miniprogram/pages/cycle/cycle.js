const { QUESTIONS, PHASE_GUIDANCE, classify } = require('../../utils/cycle.js');
const { PHASE_LABEL, PHASE_EMOJI, PHASE_COLOR, PHASE_RETURN_STATS, fmtSignedPct } = require('../../utils/finance.js');

const app = getApp();
const STORE_KEY = 'cycle_answers';

Page({
  data: {
    questions: QUESTIONS,
    phaseLabel: PHASE_LABEL,
    phaseEmoji: PHASE_EMOJI,
    phaseColor: PHASE_COLOR,
    phaseGuide: PHASE_GUIDANCE,
    phaseReturn: PHASE_RETURN_STATS,
    phaseRows: [],
    answers: {},
    result: { topPhase: null }
  },

  onLoad() {
    const phaseRows = ['despair', 'hope', 'growth', 'optimism'].map(k => ({
      key: k,
      meanPct: fmtSignedPct(PHASE_RETURN_STATS[k].mean, 0),
      medianPct: fmtSignedPct(PHASE_RETURN_STATS[k].median, 0)
    }));
    this.setData({ phaseRows });

    // Restore persisted answers (so people can navigate away and back).
    try {
      const cached = wx.getStorageSync(STORE_KEY);
      if (cached && typeof cached === 'object') {
        this.setData({ answers: cached, result: classify(cached) });
      }
    } catch (e) {}
  },

  pick(e) {
    const qkey = e.currentTarget.dataset.qkey;
    const phase = e.currentTarget.dataset.phase;
    const answers = Object.assign({}, this.data.answers, { [qkey]: phase });
    const result = classify(answers);
    this.setData({ answers, result });
    try { wx.setStorageSync(STORE_KEY, answers); } catch (e) {}
  },

  reset() {
    this.setData({ answers: {}, result: { topPhase: null } });
    try { wx.removeStorageSync(STORE_KEY); } catch (e) {}
  },

  goAssets() {
    // Pass the resolved phase so the next page can pre-select it.
    if (this.data.result && this.data.result.topPhase) {
      try { wx.setStorageSync('cycle_phase', this.data.result.topPhase); } catch (e) {}
    }
    wx.switchTab({ url: '/pages/assets/assets' });
  }
});
