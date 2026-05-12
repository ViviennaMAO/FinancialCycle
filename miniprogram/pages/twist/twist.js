const { CHAPTERS } = require('../../data/chapters.js');
const CN_NUM = ['零','一','二','三','四','五','六','七','八','九','十','十一','十二'];

Page({
  data: { items: [] },

  onLoad() {
    const items = CHAPTERS.map(c => Object.assign({}, c, { cnNum: CN_NUM[c.id] }));
    this.setData({ items });
  },

  openChapter(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/chapter/chapter?id=' + id });
  }
});
