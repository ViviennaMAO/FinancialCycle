// 基于本书表 4.1 的资产 4 阶段表现,给出"阶段 × 风险偏好"的配置矩阵。
// 每个组合 = 政府债 / 黄金或大宗 / 股票 / 现金 比例(总和=100)。
//
// 配置依据:
//   绝望期 → 防御资产领先 → 重债 + 黄金,股票低配但开始建仓
//   希望期 → 股票一骑绝尘(高 Beta、深价值、新兴市场) → 满仓股
//   增长期 → 大宗商品 + 周期股领先 → 股票仍重 + 大宗占一席
//   乐观期 → 估值脱离基本面 → 减仓,提现金,股票降为温和配置

const ASSET_LABELS = {
  bonds:    '政府债 / 长债',
  alt:      '黄金 / 大宗',     // 绝望/希望期是黄金;增长/乐观期是大宗商品
  stocks:   '股票',
  cash:     '现金'
};

const ALT_FLAVOR = {
  despair:  '黄金为主',
  hope:     '黄金为主',
  growth:   '大宗商品为主',
  optimism: '大宗商品 + 黄金'
};

const STYLE_TILT = {
  despair:  { primary: '防御股 / 必需消费 / 公用事业', secondary: '低 Beta、高股息' },
  hope:     { primary: '高 Beta 周期股 / 小盘 / 深价值 / 新兴市场', secondary: '"被砸得最惨的反弹最猛"' },
  growth:   { primary: '质量龙头 / 高 ROE / 强现金流', secondary: '从 Beta 切到质量' },
  optimism: { primary: '减仓为先;余下偏向必需消费 / 公用事业', secondary: '警惕"新时代"高估值赛道' }
};

// 配置矩阵 — 4 阶段 × 3 风险偏好 → bonds/alt/stocks/cash
const ALLOCATIONS = {
  despair: {
    conservative: { bonds: 60, alt: 20, stocks:  5, cash: 15 },
    balanced:     { bonds: 40, alt: 15, stocks: 35, cash: 10 },
    aggressive:   { bonds: 20, alt: 10, stocks: 65, cash:  5 }
  },
  hope: {
    conservative: { bonds: 30, alt: 10, stocks: 50, cash: 10 },
    balanced:     { bonds: 15, alt:  5, stocks: 75, cash:  5 },
    aggressive:   { bonds:  0, alt:  0, stocks:100, cash:  0 }
  },
  growth: {
    conservative: { bonds: 35, alt: 10, stocks: 40, cash: 15 },
    balanced:     { bonds: 20, alt: 15, stocks: 60, cash:  5 },
    aggressive:   { bonds:  5, alt: 25, stocks: 70, cash:  0 }
  },
  optimism: {
    conservative: { bonds: 40, alt:  5, stocks: 30, cash: 25 },
    balanced:     { bonds: 25, alt:  5, stocks: 55, cash: 15 },
    aggressive:   { bonds: 15, alt:  5, stocks: 65, cash: 15 }
  }
};

// 该阶段配置背后的"一句话理由"
const RATIONALE = {
  despair:  '盈利仍在下行 + 利率下行 + 通胀压力消退 → 长期国债与黄金跑赢风险资产。股票低配但保留头寸,因为接下来希望期会暴涨。',
  hope:     '盈利还没起来,但贴现率下降 + 增长预期改善 → 股票估值大幅扩张,这是周期内回报最集中的阶段。Goldman 内部数据:希望期年化 +69%。',
  growth:   '盈利接力 PE 驱动,实物需求上升 → 大宗商品 + 周期股领先,但 PE 已经走平。这是周期内"看起来最好但平均回报只有 +2%" 的尴尬段。',
  optimism: '估值脱离基本面 + 情绪推动 → 还有最后一段涨幅,但每多涨 1% 都是借来的。提高现金比重,减仓"新时代"赛道,等下一次绝望期重新入场。'
};

// 颜色映射 — 用于饼图各 segment
const ASSET_COLOR = {
  bonds:  '#3b82f6',  // 蓝
  alt:    '#f0b429',  // 金(代表黄金 / 大宗)
  stocks: '#22c55e',  // 绿
  cash:   '#94a3b8'   // 灰
};

function getAllocation(phase, risk) {
  return (ALLOCATIONS[phase] && ALLOCATIONS[phase][risk]) || null;
}

module.exports = {
  ASSET_LABELS,
  ALT_FLAVOR,
  STYLE_TILT,
  ALLOCATIONS,
  RATIONALE,
  ASSET_COLOR,
  getAllocation
};
