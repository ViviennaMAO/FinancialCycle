// 周期定位算法:用 4 个直觉问题的"投票",落点到绝望/希望/增长/乐观之一。
// 设计思路:每个问题的 4 个选项一一对应 4 个阶段;最终多数决,有平局取均值。

const QUESTIONS = [
  {
    key: 'ism',
    title: 'ISM 制造业指数(经济动能)',
    hint: 'ISM 是美国制造业景气度,50 为荣枯分水。',
    options: [
      { text: '低于 50,还在下降',  phase: 'despair'  },
      { text: '低于 50,但开始回升', phase: 'hope'     },
      { text: '高于 50,持续上升',  phase: 'growth'   },
      { text: '高于 50,但已经回落', phase: 'optimism' }
    ]
  },
  {
    key: 'earnings',
    title: '企业利润同比',
    hint: '看 S&P 500 整体 EPS 的同比走势。',
    options: [
      { text: '正在快速下滑',          phase: 'despair'  },
      { text: '刚刚见底,即将转正',     phase: 'hope'     },
      { text: '强劲增长中',           phase: 'growth'   },
      { text: '增长但开始放缓',        phase: 'optimism' }
    ]
  },
  {
    key: 'valuation',
    title: '估值水平(Shiller PE)',
    hint: '历史百分位:30 以下偏便宜,70 以上偏贵。',
    options: [
      { text: '极便宜(30 分位以下)',    phase: 'despair'  },
      { text: '偏便宜(30-50 分位)',     phase: 'hope'     },
      { text: '中等到偏贵(50-75 分位)',  phase: 'growth'   },
      { text: '极贵(75 分位以上)',      phase: 'optimism' }
    ]
  },
  {
    key: 'unemployment',
    title: '失业率走势',
    hint: '看失业率绝对水平 + 短期方向。',
    options: [
      { text: '历史高位,还在上升',      phase: 'despair'  },
      { text: '高位回落中',            phase: 'hope'     },
      { text: '历史低位,且稳定下降',     phase: 'growth'   },
      { text: '已在低位,开始回升',      phase: 'optimism' }
    ]
  }
];

// Phase advice — 一句"该做什么 / 警惕什么"
const PHASE_GUIDANCE = {
  despair: {
    do:    '逐步加仓权益(尤其高 Beta、深价值、新兴市场);保留少量现金应对最后下跌。',
    avoid: '完全清仓后等"数据转好再入场" — 那时已经错过 60%+ 反弹。',
    quote: '"在最坏的消息中,提前定价复苏。"'
  },
  hope: {
    do:    '满仓权益,偏向高 Beta + 小盘 + 周期股;新兴市场尤甚。',
    avoid: '在 PE 已经飙升的时候才回头嫌"太贵"而踏空 —— 希望期就是先涨估值再涨盈利。',
    quote: '"涨幅最大的不是数据最好的时候,是数据最差但二阶导转正的时候。"'
  },
  growth: {
    do:    '从高 Beta 切换到质量 / 现金流;大宗商品可能跑赢。',
    avoid: '继续追逐已经跑了一年的"主题股";盈利驱动期 PE 通常不再扩张。',
    quote: '"This is the boring chapter of the cycle — but it lasts the longest."'
  },
  optimism: {
    do:    '逐步减仓;检查每个仓位的"如果 PE 杀回中位数,你愿意承受多少跌幅";现金比重提升。',
    avoid: '"新时代"叙事让你重仓追高;新参与者涌入是高度警示。',
    quote: '"Bull markets die on euphoria." — 邓普顿'
  }
};

function classify(answers) {
  // answers: { ism: phaseKey, earnings: phaseKey, valuation: phaseKey, unemployment: phaseKey }
  const tally = { despair: 0, hope: 0, growth: 0, optimism: 0 };
  const unanswered = [];
  for (const q of QUESTIONS) {
    const v = answers && answers[q.key];
    if (v && tally[v] != null) tally[v]++;
    else unanswered.push(q.key);
  }
  // Sort by count desc, then by canonical order to break ties deterministically.
  const order = ['despair', 'hope', 'growth', 'optimism'];
  const ranking = order.slice().sort((a, b) => tally[b] - tally[a]);
  const top = ranking[0];
  const secondTop = ranking[1];
  const tie = tally[top] > 0 && tally[top] === tally[secondTop];
  return {
    tally,
    answeredCount: 4 - unanswered.length,
    unanswered,
    topPhase: tally[top] > 0 ? top : null,
    secondPhase: tie ? secondTop : null,
    tie
  };
}

module.exports = { QUESTIONS, PHASE_GUIDANCE, classify };
