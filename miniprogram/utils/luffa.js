// Promise-ified wrapper around the Luffa SuperBox native bridge.
// Even though the MVP is content-only, this is wired so that future
// versions (NFT progress badges, share-to-Luffa, login) can use it
// without re-architecting.

function luffa(methodName, data) {
  return new Promise((resolve, reject) => {
    if (typeof wx === 'undefined' || typeof wx.invokeNativePlugin !== 'function') {
      return reject(new Error('Not running inside Luffa SuperBox'));
    }
    wx.invokeNativePlugin({
      api_name: 'luffaWebRequest',
      data: Object.assign({ methodName }, data || {}),
      success: resolve,
      fail: reject
    });
  });
}

function safeLuffa(methodName, data) {
  return luffa(methodName, data).catch(() => null);
}

function shareToLuffa(title, desc, url) {
  return safeLuffa('share', { title, desc, url });
}

module.exports = { luffa, safeLuffa, shareToLuffa };
