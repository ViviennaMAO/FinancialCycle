// 泡沫体检 — 基于第八章的 6 共性,每条 0/1/2 分,总分 0-12。

const QUESTIONS = [
  {
    key: 'priceSurge',
    title: '① 价格惊人涨幅',
    hint: '看主要指数 + 龙头股,过去 3 年累计涨幅。',
    options: [
      { score: 0, text: '过去 3 年累计 < 30%(平淡)' },
      { score: 1, text: '过去 3 年累计 30% - 100%' },
      { score: 2, text: '过去 3 年累计 > 100% 且龙头加速' }
    ]
  },
  {
    key: 'narrative',
    title: '② "新时代"叙事',
    hint: '"这次不一样" / "范式转变" 出现频率。',
    options: [
      { score: 0, text: '没什么新叙事' },
      { score: 1, text: '偶尔听到,但不主流' },
      { score: 2, text: '每天都看到 "AI / 科技革命颠覆一切"' }
    ]
  },
  {
    key: 'credit',
    title: '③ 信贷扩张 / 放松管制',
    hint: '利率水平 + 监管态度。',
    options: [
      { score: 0, text: '利率偏高 + 货币紧 + 监管严' },
      { score: 1, text: '正常区间' },
      { score: 2, text: '零利率或负利率 + 持续 QE + 监管放松' }
    ]
  },
  {
    key: 'valuation',
    title: '④ 新估值方法',
    hint: '不用利润 / 现金流而用别的指标做估值。',
    options: [
      { score: 0, text: 'PE / PB 仍是主流估值依据' },
      { score: 1, text: '部分公司用 P/S、用户数估值' },
      { score: 2, text: 'MAU / 日活 / TPV / "Eyeballs" 流行,亏损公司能 IPO' }
    ]
  },
  {
    key: 'accounting',
    title: '⑤ 财务异常',
    hint: '关注会计准则、IPO 数量、SPAC 等。',
    options: [
      { score: 0, text: '常规,SEC 审查严格' },
      { score: 1, text: '零星 SPAC + 少量 restate' },
      { score: 2, text: '会计准则改革 + IPO 创历史 + 大量 restate + SPAC 浪潮' }
    ]
  },
  {
    key: 'participants',
    title: '⑥ 新参与者涌入',
    hint: '散户开户数、自媒体讨论度、IPO 量。',
    options: [
      { score: 0, text: '没什么变化,散户活跃度低' },
      { score: 1, text: '有点活跃,自媒体多了' },
      { score: 2, text: '散户开户暴增 + Reddit / 抖音爆炸 + IPO 爆量' }
    ]
  }
];

// 历史对照 — 基于书第八章和广为引用的估值数据
const HISTORICAL_BUBBLES = [
  {
    name: '1929 美国大泡沫',
    score: 11,
    notes: '"咆哮 20 年代" + 杠杆融资普及 + 道指 5 年涨 4×。1929 崩盘后跌 89%,1954 年才回前高。'
  },
  {
    name: '1972 漂亮 50',
    score: 10,
    notes: '宝丽来 90× PE、麦当劳 85×、迪士尼 82×。"成长永续"叙事。后续熊市龙头平均跌 80%。'
  },
  {
    name: '1989 日本',
    score: 12,
    notes: '日经 PE 80×、地产 + 股票双泡沫、日本市值占全球 45%、皇居 ≈ 加州。30 年未收复高点。'
  },
  {
    name: '2000 互联网',
    score: 11,
    notes: '思科 PE 196× + "clicks per page"估值法 + 散户开户狂潮。纳指 -78%,思科 24 年没回。'
  },
  {
    name: '2007 房地产',
    score: 9,
    notes: '次贷 + ABS 信贷扩张 + "房价永不下跌"叙事。但股市估值未到极端,所以分数稍低于 2000。'
  },
  {
    name: '2021 SPAC + 加密',
    score: 8,
    notes: 'SPAC 1000 亿融资 + 散户 meme stock + 比特币 6 万 + "代码即货币"叙事。已部分破裂。'
  }
];

const VERDICT = [
  { min: 0,  max: 3,  level: '平静', color: '#22c55e', desc: '没什么泡沫迹象。如果估值不算贵,大概率仍在希望/增长期。' },
  { min: 4,  max: 6,  level: '警惕', color: '#f0b429', desc: '某些象限已出现过热迹象。注意持仓集中度,准备好"如果再来一次 2018Q4 怎么办"的预案。' },
  { min: 7,  max: 9,  level: '高烧', color: '#f97316', desc: '多数共性已经触发。历史上这个区间往往是周期末段,12-24 个月内可能见顶。' },
  { min: 10, max: 12, level: '泡沫顶部', color: '#ef4444', desc: '所有泡沫共性几乎集齐。历史上 1929 / 1989 / 2000 三大泡沫都在这区间,接下来 5 年回报极差。' }
];

function totalScore(answers) {
  let total = 0, answered = 0;
  for (const q of QUESTIONS) {
    if (answers && typeof answers[q.key] === 'number') {
      total += answers[q.key];
      answered++;
    }
  }
  return { total, answered, max: QUESTIONS.length * 2 };
}

function verdictFor(score) {
  return VERDICT.find(v => score >= v.min && score <= v.max) || VERDICT[0];
}

function closestHistorical(score) {
  let best = null, bestDiff = Infinity;
  for (const h of HISTORICAL_BUBBLES) {
    const d = Math.abs(h.score - score);
    if (d < bestDiff) { bestDiff = d; best = h; }
  }
  return best;
}

module.exports = { QUESTIONS, HISTORICAL_BUBBLES, VERDICT, totalScore, verdictFor, closestHistorical };
