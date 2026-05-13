const { CHAPTERS, NOTE_TYPES } = require('../../data/chapters.js');
const CN_NUM = ['零','一','二','三','四','五','六','七','八','九','十','十一','十二'];
const app = getApp();

Page({
  data: {
    chapter: null,
    cnNum: '',
    letters: ['A','B','C','D'],
    noteTypes: NOTE_TYPES,
    answered: false,
    selectedIdx: -1,
    isCorrect: false,
    prevId: null,
    nextId: null
  },

  onLoad(opts) {
    const id = +opts.id || 1;
    const idx = CHAPTERS.findIndex(c => c.id === id);
    if (idx < 0) return;
    const c = CHAPTERS[idx];

    const saved = (app.globalData.progress || {})[id] || {};

    this.setData({
      chapter: c,
      linkSimLabel: c.linkSim ? c.linkSim.sim.toUpperCase() : '',
      cnNum: CN_NUM[c.id],
      prevId: idx > 0 ? CHAPTERS[idx - 1].id : null,
      nextId: idx < CHAPTERS.length - 1 ? CHAPTERS[idx + 1].id : null,
      answered: saved.selectedIdx != null,
      selectedIdx: saved.selectedIdx != null ? saved.selectedIdx : -1,
      isCorrect: !!saved.correct
    });

    wx.setNavigationBarTitle({ title: '第' + CN_NUM[c.id] + '章 · ' + c.title });

    // scroll to top — important when jumping between chapters
    wx.pageScrollTo({ scrollTop: 0, duration: 0 });
  },

  pick(e) {
    if (this.data.answered) return;
    const i = +e.currentTarget.dataset.idx;
    const opt = this.data.chapter.twist.quiz.options[i];
    const correct = !!opt.correct;
    this.setData({ answered: true, selectedIdx: i, isCorrect: correct });
    app.saveProgress(this.data.chapter.id, { selectedIdx: i, correct });
    wx.vibrateShort && wx.vibrateShort({ type: 'light' });
  },

  goPrev() {
    if (!this.data.prevId) return;
    wx.redirectTo({ url: '/pages/chapter/chapter?id=' + this.data.prevId });
  },
  goNext() {
    if (!this.data.nextId) return;
    wx.redirectTo({ url: '/pages/chapter/chapter?id=' + this.data.nextId });
  },
  goSim(e) {
    const sim = e.currentTarget.dataset.sim;
    wx.switchTab({ url: '/pages/' + sim + '/' + sim });
  }
});
