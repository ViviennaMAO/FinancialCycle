App({
  globalData: {
    bookTitle: '金融周期',
    bookEnTitle: 'The Long Good Buy',
    author: 'Peter C. Oppenheimer',
    luffaLang: 'zh',
    user: null
  },

  onLaunch() {
    try {
      const cached = wx.getStorageSync('fc_progress');
      this.globalData.progress = cached || {};
    } catch (e) {
      this.globalData.progress = {};
    }

    if (typeof wx.invokeNativePlugin === 'function') {
      wx.invokeNativePlugin({
        api_name: 'luffaWebRequest',
        data: { methodName: 'language' },
        success: (res) => {
          if (res && res.result) this.globalData.luffaLang = res.result;
        },
        fail: () => {}
      });
    }
  },

  saveProgress(chapterId, payload) {
    const p = this.globalData.progress || {};
    p[chapterId] = Object.assign({}, p[chapterId] || {}, payload, { ts: Date.now() });
    this.globalData.progress = p;
    try { wx.setStorageSync('fc_progress', p); } catch (e) {}
  }
});
