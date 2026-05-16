// Shared formatting + cycle-phase constants used across the three tools.
// (Earlier versions of this file held NPV/IRR/WACC math — those are gone
//  along with the corresponding pages.)

const PHASE_KEYS = ['despair', 'hope', 'growth', 'optimism'];

const PHASE_LABEL = {
  despair:  '绝望期',
  hope:     '希望期',
  growth:   '增长期',
  optimism: '乐观期'
};

const PHASE_EMOJI = {
  despair:  '🥶',
  hope:     '🌅',
  growth:   '🌱',
  optimism: '🎉'
};

const PHASE_COLOR = {
  despair:  '#3b82f6',  // blue · cold
  hope:     '#22c55e',  // green · spring
  growth:   '#f0b429',  // gold · daylight
  optimism: '#ef4444'   // red · hot
};

// Source: Table 4.1 of the book — average annualized returns for US equities
// across 1973–2019 (6 cycles).
const PHASE_RETURN_STATS = {
  despair:  { mean: -0.44, median: -0.40, label: '平均年化 -44%' },
  hope:     { mean: +0.69, median: +0.77, label: '平均年化 +69%' },
  growth:   { mean: +0.02, median: +0.05, label: '平均年化 +2%'  },
  optimism: { mean: +0.48, median: +0.31, label: '平均年化 +48%' }
};

function fmtPct(x, digits) {
  if (!isFinite(x)) return '—';
  const d = digits == null ? 1 : digits;
  return (x * 100).toFixed(d) + '%';
}

function fmtSignedPct(x, digits) {
  if (!isFinite(x)) return '—';
  const d = digits == null ? 1 : digits;
  const v = x * 100;
  return (v >= 0 ? '+' : '') + v.toFixed(d) + '%';
}

module.exports = {
  PHASE_KEYS,
  PHASE_LABEL,
  PHASE_EMOJI,
  PHASE_COLOR,
  PHASE_RETURN_STATS,
  fmtPct,
  fmtSignedPct
};
