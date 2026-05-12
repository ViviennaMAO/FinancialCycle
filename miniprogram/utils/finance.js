// Pure-math finance primitives. No wx.* calls — testable in any JS env.
//
// Conventions:
//   cashflows[0] is the year-0 outflow (usually negative).
//   cashflows[1..n] are subsequent net cash flows.
//   rate / discount inputs are decimals (0.08 = 8%).

function npv(rate, cashflows) {
  let v = 0;
  for (let t = 0; t < cashflows.length; t++) {
    v += cashflows[t] / Math.pow(1 + rate, t);
  }
  return v;
}

// Derivative dNPV/dr — used by Newton iteration.
function dnpv(rate, cashflows) {
  let v = 0;
  for (let t = 1; t < cashflows.length; t++) {
    v += -t * cashflows[t] / Math.pow(1 + rate, t + 1);
  }
  return v;
}

// IRR with Newton-Raphson; falls back to bisection on divergence.
function irr(cashflows, guess) {
  const sumPos = cashflows.filter(c => c > 0).reduce((a, b) => a + b, 0);
  const sumNeg = cashflows.filter(c => c < 0).reduce((a, b) => a + b, 0);
  if (sumPos === 0 || sumNeg === 0) return NaN;

  let r = typeof guess === 'number' ? guess : 0.1;
  for (let i = 0; i < 60; i++) {
    const f = npv(r, cashflows);
    const fp = dnpv(r, cashflows);
    if (Math.abs(f) < 1e-7) return r;
    if (!isFinite(fp) || fp === 0) break;
    const next = r - f / fp;
    if (!isFinite(next) || next <= -0.9999) break;
    if (Math.abs(next - r) < 1e-8) return next;
    r = next;
  }

  // Bisection fallback over a wide bracket.
  let lo = -0.95, hi = 10;
  let fLo = npv(lo, cashflows);
  let fHi = npv(hi, cashflows);
  if (fLo * fHi > 0) return NaN; // no sign-change — IRR undefined
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const fMid = npv(mid, cashflows);
    if (Math.abs(fMid) < 1e-7 || (hi - lo) < 1e-9) return mid;
    if (fMid * fLo < 0) { hi = mid; fHi = fMid; }
    else                { lo = mid; fLo = fMid; }
  }
  return (lo + hi) / 2;
}

// CAPM cost of equity: Re = Rf + beta · ERP
function costOfEquityCAPM(rf, beta, erp) {
  return rf + beta * erp;
}

// After-tax WACC:  (E/V)·Re + (D/V)·Rd·(1-t)
function wacc({ equity, debt, costEquity, costDebt, taxRate }) {
  const v = equity + debt;
  if (v <= 0) return NaN;
  const we = equity / v;
  const wd = debt / v;
  return we * costEquity + wd * costDebt * (1 - taxRate);
}

// Map the book's 4 stock-cycle phases to a discount-rate adjustment.
// Numbers tuned from the book: 绝望 -44% / 希望 +69% / 增长 +2% / 乐观 +48% (Table 4.1).
// Despair → higher required return; Hope/Optimism → market accepts lower discount;
// Growth → near-neutral.
const PHASE_ADJUST = {
  despair: +0.04,  // panic — investors demand 400bps extra ERP
  hope:    -0.02,  // re-rating wave — discount compresses
  growth:   0.00,  // textbook
  optimism:-0.015  // late-cycle complacency
};

const PHASE_LABEL = {
  despair:  '绝望期',
  hope:     '希望期',
  growth:   '增长期',
  optimism: '乐观期'
};

function phaseAdjustedRate(baseRate, phase) {
  const delta = PHASE_ADJUST[phase] || 0;
  return Math.max(0.001, baseRate + delta);
}

function fmtPct(x, digits) {
  if (!isFinite(x)) return '—';
  return (x * 100).toFixed(digits == null ? 2 : digits) + '%';
}

function fmtMoney(x, digits) {
  if (!isFinite(x)) return '—';
  const sign = x < 0 ? '-' : '';
  const abs = Math.abs(x);
  return sign + abs.toFixed(digits == null ? 2 : digits);
}

module.exports = {
  npv, irr, wacc,
  costOfEquityCAPM,
  phaseAdjustedRate,
  PHASE_ADJUST, PHASE_LABEL,
  fmtPct, fmtMoney
};
