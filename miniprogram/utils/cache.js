// Thin TTL cache on top of wx.storage. FRED data is daily/monthly so we
// cache for 12h by default — saves quota and works offline.

const NS = 'fc_cache_';

function get(key) {
  try {
    const raw = wx.getStorageSync(NS + key);
    if (!raw) return null;
    const { value, exp } = raw;
    if (typeof exp === 'number' && exp < Date.now()) return null;
    return value;
  } catch (e) {
    return null;
  }
}

function set(key, value, ttlMs) {
  try {
    wx.setStorageSync(NS + key, {
      value,
      exp: ttlMs ? Date.now() + ttlMs : 0
    });
  } catch (e) {}
}

function age(key) {
  try {
    const raw = wx.getStorageSync(NS + key);
    if (!raw) return null;
    const stored = (raw.exp || 0) - 12 * 3600 * 1000; // reverse from 12h TTL
    return stored ? Date.now() - stored : null;
  } catch (e) {
    return null;
  }
}

module.exports = { get, set, age };
