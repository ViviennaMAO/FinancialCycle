const { CHAPTERS } = require('../../data/chapters.js');
const fred = require('../../utils/fred.js');

const CN_NUM = ['零','一','二','三','四','五','六','七','八','九','十','十一','十二'];

function fmtRelativeTime(d) {
  if (!d) return '';
  const diffMs = Date.now() - d.getTime();
  const m = Math.floor(diffMs / 60000);
  if (m < 1) return '刚刚 ·';
  if (m < 60) return m + '分钟前 ·';
  const h = Math.floor(m / 60);
  if (h < 24) return h + '小时前 ·';
  return Math.floor(h / 24) + '天前 ·';
}

Page({
  data: {
    chapters: [],
    fredEnabled: false,
    fredLoading: false,
    fredPanel: [],
    fredUpdatedAt: '',
    yieldCurveWarning: ''
  },

  onLoad() {
    const decorated = CHAPTERS.map(c => Object.assign({}, c, { cnNum: CN_NUM[c.id] }));
    this.setData({ chapters: decorated });

    // FRED is enabled only if the proxy URL has been customized away from the placeholder.
    const enabled = fred.PROXY_BASE && fred.PROXY_BASE.indexOf('YOUR_PROJECT') === -1 && fred.PROXY_BASE.indexOf('YOUR_SUBDOMAIN') === -1;
    this.setData({ fredEnabled: enabled });
    if (enabled) this.loadFred(false);
  },

  onShow() {
    if (this.data.fredEnabled && !this.data.fredPanel.length) this.loadFred(false);
  },

  refreshFred() {
    if (!this.data.fredEnabled || this.data.fredLoading) return;
    this.loadFred(true);
  },

  loadFred(force) {
    this.setData({ fredLoading: true });
    fred.fetchPanel(force).then(rows => {
      const update = { fredPanel: rows, fredLoading: false };

      const t10y2y = rows.find(r => r.id === 'T10Y2Y');
      if (t10y2y && t10y2y.value != null && t10y2y.value < 0) {
        update.yieldCurveWarning =
          '收益率曲线已倒挂 (' + t10y2y.display + 'pp) — 历史上几乎所有美国经济衰退之前都出现过这一信号。叠加高失业率低位 + 高估值,本书第六章的"6 维熊市指标"已触发多项。';
      } else {
        update.yieldCurveWarning = '';
      }

      const anyLoaded = rows.some(r => r.value != null);
      if (anyLoaded) {
        update.fredUpdatedAt = fmtRelativeTime(new Date()) + ' 已更新';
      } else {
        update.fredUpdatedAt = '加载失败 — 检查代理是否部署';
      }
      this.setData(update);
    }).catch(() => {
      this.setData({ fredLoading: false, fredUpdatedAt: '加载失败' });
    });
  },

  openChapter(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/chapter/chapter?id=' + id });
  }
});
