const { CHAPTERS } = require('../../data/chapters.js');
const CN_NUM = ['零','一','二','三','四','五','六','七','八','九','十','十一','十二'];

Page({
  data: { items: [] },

  onLoad() {
    const items = CHAPTERS.map(c => Object.assign({}, c, {
      cnNum: CN_NUM[c.id],
      headerLabel: c.displayLabel || ('第' + CN_NUM[c.id] + '章')
    }));
    this.setData({ items });
  },

  openChapter(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/chapter/chapter?id=' + id });
  }
});
