const { QUESTIONS, HISTORICAL_BUBBLES, totalScore, verdictFor, closestHistorical } = require('../../utils/bubble.js');

const STORE_KEY = 'bubble_answers';

Page({
  data: {
    questions: QUESTIONS,
    historicalBubbles: HISTORICAL_BUBBLES,
    answers: {},
    totals: { total: 0, answered: 0, max: 12 },
    verdict: null,
    closest: null
  },

  onLoad() {
    try {
      const cached = wx.getStorageSync(STORE_KEY);
      if (cached && typeof cached === 'object') {
        this.setData({ answers: cached });
        this.recompute();
      }
    } catch (e) {}
  },

  pick(e) {
    const qkey = e.currentTarget.dataset.qkey;
    const score = +e.currentTarget.dataset.score;
    const answers = Object.assign({}, this.data.answers, { [qkey]: score });
    this.setData({ answers });
    this.recompute();
    try { wx.setStorageSync(STORE_KEY, answers); } catch (e) {}
    wx.vibrateShort && wx.vibrateShort({ type: 'light' });
  },

  recompute() {
    const totals = totalScore(this.data.answers);
    if (totals.answered === 0) {
      this.setData({ totals, verdict: null, closest: null });
      return;
    }
    const verdict = verdictFor(totals.total);
    const closest = totals.answered >= 4 ? closestHistorical(totals.total) : null;
    this.setData({ totals, verdict, closest });
  },

  reset() {
    this.setData({ answers: {}, totals: { total: 0, answered: 0, max: 12 }, verdict: null, closest: null });
    try { wx.removeStorageSync(STORE_KEY); } catch (e) {}
  }
});
