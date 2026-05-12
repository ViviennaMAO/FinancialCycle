// Generator: GUIDE.md → 互动书操作指南.docx
//
// Usage:
//   npm install -g docx
//   NODE_PATH=$(npm root -g) node gen-docx.js
//
// Output: 互动书操作指南.docx in the repo root.
const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, LevelFormat, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageBreak, PageOrientation, ExternalHyperlink,
  TableOfContents, PageNumber, Footer, Header
} = require('docx');

// ─── helpers ────────────────────────────────────────────────────────────

const FONT = 'Arial';            // Word will substitute CJK as needed
const MONO = 'Menlo';            // mac native monospace; fallback Consolas on Win
const ACCENT = 'B45309';         // dark gold for headings / tags
const MUTED = '64748B';
const CODE_BG = 'F1F5F9';
const TBL_HEAD_BG = '0F172A';
const TBL_HEAD_FG = 'F8FAFC';
const TBL_BORDER = { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' };
const CELL_BORDERS = { top: TBL_BORDER, bottom: TBL_BORDER, left: TBL_BORDER, right: TBL_BORDER };

function txt(s, opts = {}) {
  return new TextRun(Object.assign({ text: s, font: FONT }, opts));
}
function bold(s) { return txt(s, { bold: true }); }
function muted(s) { return txt(s, { color: MUTED }); }
function inlineCode(s) { return new TextRun({ text: s, font: MONO, size: 20, shading: { fill: CODE_BG, type: ShadingType.CLEAR } }); }
function p(children, opts = {}) {
  const c = Array.isArray(children) ? children : [children];
  const runs = c.map(x => typeof x === 'string' ? txt(x) : x);
  return new Paragraph(Object.assign({ children: runs, spacing: { after: 120 } }, opts));
}
function pStr(s, opts = {}) { return p([txt(s)], opts); }
function h1(s) { return new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, children: [txt(s, { bold: true, size: 36, color: ACCENT })], spacing: { before: 240, after: 200 } }); }
function h1NoBreak(s) { return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [txt(s, { bold: true, size: 36, color: ACCENT })], spacing: { before: 240, after: 200 } }); }
function h2(s) { return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [txt(s, { bold: true, size: 28, color: ACCENT })], spacing: { before: 280, after: 140 } }); }
function h3(s) { return new Paragraph({ heading: HeadingLevel.HEADING_3, children: [txt(s, { bold: true, size: 24 })], spacing: { before: 200, after: 100 } }); }
function bullet(children) {
  const c = Array.isArray(children) ? children : [typeof children === 'string' ? txt(children) : children];
  return new Paragraph({ numbering: { reference: 'bullets', level: 0 }, children: c, spacing: { after: 80 } });
}
function bulletStr(s) { return bullet([txt(s)]); }
function numbered(children, level = 0) {
  const c = Array.isArray(children) ? children : [typeof children === 'string' ? txt(children) : children];
  return new Paragraph({ numbering: { reference: 'nums', level }, children: c, spacing: { after: 80 } });
}
function code(text) {
  // multi-line: each line a paragraph with monospace + bg shading
  const lines = text.split('\n');
  return lines.map((line, i) =>
    new Paragraph({
      children: [new TextRun({ text: line || ' ', font: MONO, size: 18 })],
      shading: { fill: CODE_BG, type: ShadingType.CLEAR },
      spacing: { after: i === lines.length - 1 ? 160 : 0, before: i === 0 ? 80 : 0, line: 240 },
      indent: { left: 200 }
    })
  );
}
function blockquote(s) {
  return new Paragraph({
    children: [txt(s, { italics: true, color: MUTED })],
    indent: { left: 360 },
    border: { left: { style: BorderStyle.SINGLE, size: 18, color: ACCENT, space: 8 } },
    spacing: { before: 100, after: 160 }
  });
}

// table with the first row as header
function tbl(headers, rows, colWidths) {
  const totalWidth = 9360;
  const widths = colWidths || headers.map(() => Math.floor(totalWidth / headers.length));
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      borders: CELL_BORDERS,
      width: { size: widths[i], type: WidthType.DXA },
      shading: { fill: TBL_HEAD_BG, type: ShadingType.CLEAR },
      margins: { top: 100, bottom: 100, left: 140, right: 140 },
      children: [new Paragraph({ children: [txt(h, { bold: true, color: TBL_HEAD_FG, size: 22 })] })]
    }))
  });
  const dataRows = rows.map(r => new TableRow({
    children: r.map((cell, i) => {
      const cellRuns = Array.isArray(cell) ? cell : [typeof cell === 'string' ? txt(cell, { size: 22 }) : cell];
      return new TableCell({
        borders: CELL_BORDERS,
        width: { size: widths[i], type: WidthType.DXA },
        margins: { top: 100, bottom: 100, left: 140, right: 140 },
        children: [new Paragraph({ children: cellRuns })]
      });
    })
  }));
  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: widths,
    rows: [headerRow, ...dataRows]
  });
}

function divider() {
  return new Paragraph({
    children: [txt('')],
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1', space: 1 } },
    spacing: { before: 200, after: 200 }
  });
}

// ─── content ────────────────────────────────────────────────────────────

const body = [];

// COVER
body.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [txt('在 Luffa SuperBox 上生成「互动书」小程序', { bold: true, size: 48, color: ACCENT })],
  spacing: { before: 2400, after: 200 }
}));
body.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [txt('详尽操作指南', { bold: true, size: 36, color: ACCENT })],
  spacing: { after: 600 }
}));
body.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [txt('把任何一本(非虚构)书变成一个可交互的学习小程序', { italics: true, color: MUTED, size: 24 })],
  spacing: { after: 80 }
}));
body.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [txt('案例项目:《金融周期》— Peter C. Oppenheimer', { italics: true, color: MUTED, size: 22 })],
  spacing: { after: 1200 }
}));
body.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [
    new ExternalHyperlink({
      children: [new TextRun({ text: 'github.com/ViviennaMAO/FinancialCycle', style: 'Hyperlink', font: FONT, size: 22 })],
      link: 'https://github.com/ViviennaMAO/FinancialCycle'
    })
  ],
  spacing: { after: 80 }
}));
body.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [
    new ExternalHyperlink({
      children: [new TextRun({ text: 'financial-cycle.vercel.app/api/fred', style: 'Hyperlink', font: FONT, size: 22 })],
      link: 'https://financial-cycle.vercel.app/api/fred'
    })
  ]
}));

// === SECTION: 这份指南覆盖什么 ===
body.push(h1('这份指南覆盖什么'));
body.push(tbl(
  ['阶段', '你产出什么'],
  [
    ['Phase 0 · 内容设计',  '章节地图 + 3 个核心模拟器 + 每章一个反预期事件'],
    ['Phase 1 · 控制台',    'Luffa 小程序 AppID'],
    ['Phase 2 · 项目脚手架', 'miniprogram/ 目录 + tabBar 配置 + 全局样式'],
    ['Phase 3 · 数学 & 数据', 'utils/finance.js(纯函数,Node 可测) + data/chapters.js'],
    ['Phase 4 · 页面',      '6 个页面(5 个 tabBar + 1 个子页)'],
    ['Phase 5 · 实时数据',   'Vercel serverless 函数代理 + FRED API'],
    ['Phase 6 · 部署',      'Luffa Cloud-Devtools 上传 + 控制台域名白名单'],
    ['Phase 7 · 上线',      '审核提交 + 发布']
  ],
  [3000, 6360]
));
body.push(p([
  txt('每一步都包含:'),
  bold('做什么 → 怎么验证 → 卡住时怎么办'),
  txt('。')
]));

// === 总览 ===
body.push(h1('总览 · 互动书的心智模型'));
body.push(p([txt('互动书 = '), bold('内容 + 模拟器 + 反预期事件'), txt('。')]));

body.push(...code(`        书 (PDF / 知识源)
            │
            ▼
    [Phase 0 · 内容设计]
    ┌───────────────────────────────────────┐
    │  抽 3-5 个"核心数学/概念框架"  →  模拟器  │
    │  抽 N 个"违反直觉的事实"      →  反预期  │
    │  抽章节地图 + 关键引用 + 数据表           │
    └───────────────────────────────────────┘
            │
            ▼
        [Phase 2-4 · 实现]
            │
            ▼
   实时数据 (可选) ──→ [Phase 5 · Vercel 代理]
            │
            ▼
        [Phase 6-7 · 部署 + 上线]
            │
            ▼
        Luffa SuperBox 用户`));

body.push(h2('关键原则'));
body.push(bullet([bold('不要把整本书塞进去'), txt('。互动书的价值是"重写为可玩的形式",不是"在小屏上再读一遍"。')]));
body.push(bullet([bold('模拟器要"反预期"'), txt('。用户改参数 → 看到与直觉相反的结果 → 留下记忆。这是教育产品的真正护城河。')]));
body.push(bullet([bold('API key 永远不在小程序包里'), txt('。所有外部 API(FRED、OpenAI、股价等)都走后端代理。')]));

// === PHASE 0 ===
body.push(h1('Phase 0 · 内容设计'));
body.push(blockquote('花在这一步的时间是最值的。'));

body.push(h2('0.1 读完书,定 3 项'));
body.push(pStr('把 PDF / 实体书读完后,在白纸上写 3 件事:'));

body.push(numbered([bold('3 个"核心数学/概念框架"'), txt(' — 这本书的工具箱里最常用的 3 个操作是什么?')]));
body.push(bulletStr('《金融周期》→ NPV / IRR / WACC(估值与资本预算)'));
body.push(bulletStr('《精益创业》→ MVP 假设清单 / 单元经济学 / 转化漏斗'));
body.push(bulletStr('《思考快与慢》→ 框架效应模拟 / 锚定测试 / 概率直觉测试'));
body.push(bulletStr('《原则》→ 决策日志 / 雷氏可信度加权 / 反思矩阵'));

body.push(numbered([bold('每章一个反预期事件'), txt(' — 这一章里有什么是读者"以为是 A,其实是 B"的?')]));
body.push(bulletStr('必须有书中具体数据 / 历史案例支撑 — 这是和"心灵鸡汤"的分界线'));
body.push(bulletStr('配一道 3 选项判断题 + 答错的解释("为什么大家都猜错了")'));

body.push(numbered([bold('章节地图'), txt(' — Part / Chapter / 摘要 / 反预期 hook,做成结构化数据')]));

body.push(h2('0.2 把章节地图写成 JSON-like 数据'));
body.push(p([txt('打开 '), inlineCode('miniprogram/data/chapters.js'), txt(' 作为模板。每章一个对象:')]));
body.push(...code(`{
  id: 3,
  part: '第一部分 · 来自过去的经验',
  title: '股市周期的四个阶段',
  summary: '...',
  twist: {
    hook: '"经济最差的时候是最差的买点" — 错。',
    body: '...具体数据 / 历史 / 表格引用...',
    quiz: {
      q: '股票回报最高的是哪个阶段?',
      options: [
        { t: '增长期', correct: false },
        { t: '乐观期', correct: false },
        { t: '希望期', correct: true  }
      ],
      why: '...为什么是这个答案,以及大家直觉为什么错...'
    }
  }
}`));

body.push(h2('0.3 为模拟器设计"情景模板"'));
body.push(pStr('光给一个空白计算器不够 — 用户不知道怎么玩。预设 4-6 个故事化情景,每个对应书里的一个论点。'));
body.push(p([bold('《金融周期》的 NPV/IRR 情景:')]));
body.push(tbl(
  ['情景名', '故事', '现金流', '教学点'],
  [
    ['希望期反弹',    '衰退底部入场,1 年后强劲反弹',  [inlineCode('[-100, -5, 30, 55, 70, 80]')],   ['IRR ≈ +24%,对应表 4.1 希望期 +69%'].map(s => txt(s, { size: 20 }))],
    ['增长期成熟',    '盈利到顶,逐年放缓',           [inlineCode('[-100, 25, 22, 20, 18, 16]')],   ['IRR ≈ +0.4%,对应表 4.1 增长期 +2%'].map(s => txt(s, { size: 20 }))],
    ['泡沫追高',      '500 倍 PE 买龙头',            [inlineCode('[-500, 20, 22, 24, 26, 28]')],   ['IRR ≈ −33%,漂亮 50 的命运'].map(s => txt(s, { size: 20 }))],
    ['科技革命赢家',  '前期亏损,后期指数级回报',      [inlineCode('[-200, -30, 10, 60, 120, 200]')], ['IRR ≈ +14%,长期赢家但要忍'].map(s => txt(s, { size: 20 }))]
  ],
  [1500, 2500, 3000, 2360]
));

body.push(h3('设计要点'));
body.push(bulletStr('IRR 跨度要大(本例:−33% / +0.4% / +14% / +24%),用户切换情景能立刻看出反差'));
body.push(bulletStr('数字尽量对齐书里的真实数据(本例:+0.4% ≈ 表 4.1 增长期 +2%)'));
body.push(bullet([bold('必须在 Node 里跑过一遍'), txt('确认 IRR 算出来跟你设计意图一致(Phase 3.3 教怎么测)')]));

body.push(h2('0.4 这一步要花多少时间?'));
body.push(pStr('不带恐慌写出来,《金融周期》这本约 250 页的书,Phase 0 全过程约 4-6 小时。'));
body.push(p([bold('省这一步的代价'), txt(':做出来的小程序是"能跑但没用",用户打开 30 秒就关掉。')]));

// === PHASE 1 ===
body.push(h1('Phase 1 · Luffa 控制台注册 + AppID'));
body.push(blockquote('一次性,约 10 分钟'));

body.push(h2('1.1 注册 + 创建小程序'));
body.push(numbered('打开 Luffa Cloud 开发者控制台'));
body.push(numbered([txt('右上 '), bold('注册账号'), txt(' → 邮箱/手机注册')]));
body.push(numbered([txt('登录后 '), bold('创建小程序'), txt(',填:')]));
body.push(bulletStr('名称(中文 ≤ 20 字符)'));
body.push(bulletStr('分类(教育 / 工具 / 阅读)'));
body.push(bulletStr('描述(≥ 50 字,要说清"是什么 / 为谁 / 做什么")'));
body.push(bulletStr('图标(512×512 PNG)'));

body.push(h2('1.2 拿到 AppID'));
body.push(p([txt('控制台会自动发,形如 '), inlineCode('mpkboyj2fc3l4u7q'), txt('(16 位字母数字)。')]));
body.push(p([bold('复制保存'), txt(' — 这是接下来 IDE 唯一的"识别码"。')]));

body.push(h2('1.3 暂时不要配域名白名单'));
body.push(pStr('留到 Phase 5 部署完代理之后再配。如果现在配,会指向一个还不存在的 URL。'));

// === PHASE 2 ===
body.push(h1('Phase 2 · 项目脚手架'));
body.push(blockquote('约 30 分钟'));

body.push(h2('2.1 选 native 还是 Taro'));
body.push(tbl(
  ['', 'Native (WXML/WXSS/JS)', 'Taro 4 + React + TS'],
  [
    ['包体',     '极小(本项目 ~200 KB)',  '较大(~600 KB 起)'],
    ['学习曲线', '几乎为零',                '已会 React 才舒服'],
    ['适合',     '内容型 / 数学型应用',     '复杂 UI / 现有 React 库要复用']
  ],
  [1500, 4000, 3860]
));
body.push(p([bold('互动书优先选 Native'), txt('。Taro 的 runtime 开销对一个学习 app 来说浪费。')]));

body.push(h2('2.2 目录结构'));
body.push(...code(`miniprogram/
├── project.config.json   # IDE 配置 + AppID
├── app.json              # tabBar + 全局窗口
├── app.js                # 全局生命周期 + 进度持久化
├── app.wxss              # 全局样式
├── sitemap.json
├── utils/
│   ├── luffa.js          # wx.invokeNativePlugin Promise 桥接
│   ├── cache.js          # wx.storage 上的 TTL 缓存
│   ├── finance.js        # 纯数学,Node 可测
│   └── fred.js           # 外部 API 客户端(可选)
├── data/
│   └── chapters.js       # Phase 0 设计的章节素材
└── pages/
    ├── index/            # 首页 (tabBar)
    ├── sim1/             # 模拟器 1 (tabBar)
    ├── sim2/             # 模拟器 2 (tabBar)
    ├── sim3/             # 模拟器 3 (tabBar)
    ├── twist/            # 反预期总览 (tabBar)
    └── chapter/          # 章节详情 (子页)`));
body.push(p([bold('tabBar 最多 5 个'), txt(' — 这是 SuperBox(及微信)的硬限制。本项目把首页和 3 个模拟器各占一席,再加一个"反预期总览"凑满。')]));

body.push(h2('2.3 关键 app.json 配置'));
body.push(...code(`{
  "pages": [
    "pages/index/index",
    "pages/sim1/sim1",
    "pages/sim2/sim2",
    "pages/sim3/sim3",
    "pages/twist/twist",
    "pages/chapter/chapter"
  ],
  "window": {
    "navigationBarBackgroundColor": "#0a1628",
    "navigationBarTextStyle": "white"
  },
  "tabBar": {
    "color": "#7a8aa3",
    "selectedColor": "#f0b429",
    "backgroundColor": "#0a1628",
    "list": [
      { "pagePath": "pages/index/index", "text": "目录" },
      ...
    ]
  }
}`));

body.push(h3('注意'));
body.push(bullet([bold('不放 iconPath'), txt(',纯文字 tabBar,省一堆 PNG 资源(本项目 0 张图)')]));
body.push(bulletStr('颜色和品牌色对齐,文字色暗、选中色亮'));

body.push(h2('2.4 关键 project.config.json'));
body.push(...code(`{
  "TCMPPappid": "ms你的真实AppID",
  "miniprogramRoot": "./",
  "libVersion": "2.30.4",
  "setting": {
    "urlCheck": true,      ← 真机一定为 true,IDE 调试可临时关
    "es6": true,
    "minified": true
  }
}`));
body.push(p([txt('第一次在 Luffa Cloud-Devtools 打开时,IDE 会自动写入 '), inlineCode('LuffaToolsappid'), txt(' 等字段,'), bold('不要手动改'), txt(',让 IDE 维护。')]));

// === PHASE 3 ===
body.push(h1('Phase 3 · 数学 & 数据'));
body.push(blockquote('约 1-2 小时'));

body.push(h2('3.1 把数学全部写成纯函数'));
body.push(p([inlineCode('utils/finance.js'), txt(' 不依赖任何 wx.* API。规则:')]));
body.push(bulletStr('输入是数字 / 数组,输出是数字 / 对象'));
body.push(p([txt('• 没有副作用,没有 '), inlineCode('console.log')]));
body.push(p([txt('• 可以 '), inlineCode('node -e "..."'), txt(' 直接跑测试')]));

body.push(p([txt('例子:')]));
body.push(...code(`function npv(rate, cashflows) {
  let v = 0;
  for (let t = 0; t < cashflows.length; t++) {
    v += cashflows[t] / Math.pow(1 + rate, t);
  }
  return v;
}

function irr(cashflows, guess) {
  // 1. Newton-Raphson 主算法
  // 2. 不收敛 → 二分兜底
  // 3. 现金流没有符号反转 → 返回 NaN
}`));

body.push(h2('3.2 关键设计 · 让数学感知周期阶段'));
body.push(pStr('光实现"教材版 NPV"还不够 — 互动书的高级感来自"同一公式在不同语境下结果完全不同"。'));
body.push(...code(`const PHASE_ADJUST = {
  despair: +0.04,    // 绝望期投资者要求更高回报
  hope:    -0.02,    // 希望期愿意接受更低折现率
  growth:   0.00,
  optimism:-0.015
};

function phaseAdjustedRate(baseRate, phase) {
  return Math.max(0.001, baseRate + (PHASE_ADJUST[phase] || 0));
}`));
body.push(pStr('这样 NPV 页就能展示同一现金流在 4 个阶段下的 NPV 翻转 — 直观地把抽象概念"周期红利"具象化。'));

body.push(h2('3.3 在 Node 里测数学(必做)'));
body.push(...code(`cd miniprogram && node -e "
const { npv, irr, wacc } = require('./utils/finance.js');
console.log('NPV 教材题:', npv(0.10, [-100,30,30,30,30,30]).toFixed(4), '(应为 ~13.7236)');
console.log('IRR 教材题:', (irr([-100,30,30,30,30,30])*100).toFixed(4), '% (应为 ~15.24%)');
"`));
body.push(p([
  txt('把至少 3 道教材标准答案验过去。这是'),
  bold('唯一'),
  txt('能在小程序之外捕获数学 bug 的机会。本项目 Phase 0.3 设计的"增长期成熟"情景 IRR 算出来是 −13.5%,与"经济仍在增长 → 应略正"的设计意图矛盾 — 全靠这一步才捕获到。')
]));

body.push(h2('3.4 章节数据 = 模拟器的"参数库"'));
body.push(p([txt('让 '), inlineCode('data/chapters.js'), txt(' 同时承担两个角色:')]));
body.push(numbered([txt('给 '), inlineCode('index/twist/chapter'), txt(' 页面提供章节内容')]));
body.push(numbered([txt('给 '), inlineCode('sim1/sim2/sim3'), txt(' 提供预设的"情景模板"('), inlineCode('SCENARIOS'), txt(')')]));
body.push(pStr('这样章节和模拟器自然交叉引用 — 用户在第三章页面点 "→ NPV" 按钮直接跳到 NPV 页并加载"希望期反弹"情景。这种联动是"互动书"和"普通计算器 app"的核心差别。'));

// === PHASE 4 ===
body.push(h1('Phase 4 · 页面'));
body.push(blockquote('约 3-5 小时'));

body.push(h2('4.1 模拟器页的通用骨架'));
body.push(pStr('每个模拟器页都长这样:'));
body.push(...code(`┌─────────────────────────────────┐
│  概念卡片                        │  ← 公式 + 1 段说明
├─────────────────────────────────┤
│  情景模板按钮 (4-6 个)            │  ← 一键切换,改变下方所有数据
├─────────────────────────────────┤
│  参数输入 (滑块 / 输入框)         │  ← 让用户改
├─────────────────────────────────┤
│  实时结果 (大号金色数字)          │  ← compute() 即时更新
├─────────────────────────────────┤
│  对照表 / 周期阶段对比表           │  ← 体现"反直觉"
├─────────────────────────────────┤
│  关键观察 (动态生成的文字)         │  ← 互动书的"导师视角"
└─────────────────────────────────┘`));
body.push(p([
  txt('任何参数变 → 调 '), inlineCode('this.compute()'), txt(' → setData 整套结果。'),
  bold('不要做 throttle / debounce'), txt(' — 这种 app 计算 < 1ms,直接重算最干净。')
]));

body.push(h2('4.2 「关键观察」动态文字(这是关键)'));
body.push(p([txt('最容易让用户"哇"的一招:根据用户当前输入的参数,给出'), bold('有针对性'), txt('的解读。例:')]));
body.push(...code(`let insight;
if (spread > Math.abs(cfs[0]) * 0.5) {
  insight = '⚡ NPV 在不同周期阶段间跨度极大 — 此项目高度久期敏感';
} else if (rows.every(r => r.npv > 0)) {
  insight = '✅ 全周期 NPV 都为正 — 巴菲特意义上的"好生意"';
} else if (rows.every(r => r.npv < 0)) {
  insight = '🔴 即使最有利的周期阶段 NPV 仍为负 — 不要靠"等周期反转"自我安慰';
} else {
  insight = '↔️ 这是"周期红利依赖型"项目 — 入场点决定一切';
}`));
body.push(p([
  bold('写法:'), txt('先列出用户可能的 3-4 种参数组合,每种给一句来自书里的洞察。这是把作者的智慧灌进交互的关键 — 远比写一段静态说明文字有效。')
]));

body.push(h2('4.3 章节详情页 = 反预期事件演示场'));
body.push(pStr('每章详情页结构:'));
body.push(numbered('章节标题 + 摘要(从 chapters.js 拉)'));
body.push(numbered('反预期 hook(紫色卡片高亮)'));
body.push(numbered('详细解释 + 数据 / 案例引用'));
body.push(numbered('3 选项判断题(选错变红,选对变绿,显示「为什么」)'));
body.push(numbered('上一章 / 下一章导航'));
body.push(numbered([bold('联动模拟器按钮'), txt(' → NPV / IRR / WACC')]));

body.push(h2('4.4 进度持久化'));
body.push(p([txt('用 '), inlineCode('wx.setStorageSync'), txt(' 在 '), inlineCode('app.js'), txt(' 里维护用户的答题进度:')]));
body.push(...code(`// app.js
saveProgress(chapterId, payload) {
  const p = this.globalData.progress || {};
  p[chapterId] = Object.assign({}, p[chapterId] || {}, payload, { ts: Date.now() });
  this.globalData.progress = p;
  try { wx.setStorageSync('fc_progress', p); } catch (e) {}
}`));
body.push(pStr('用户答过的题再回来不会重置 — 这是基本的"学习应用"体验。'));

body.push(h2('4.5 Luffa 原生桥接(utils/luffa.js)'));
body.push(p([txt('即使 MVP 不用钱包,也'), bold('先包一层 Promise'), txt(':')]));
body.push(...code(`function luffa(methodName, data) {
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
}`));
body.push(p([txt('未来要加分享 / 钱包 / 链调用,直接调 '), inlineCode("luffa('share', ...)"), txt(',不用重构。')]));

// === PHASE 5 ===
body.push(h1('Phase 5 · 实时数据集成(可选)'));
body.push(blockquote('约 30-60 分钟'));
body.push(pStr('互动书的「活」靠数据。让模拟器里的折现率 / 无风险利率跟着今天的市场跑,体验完全不同。'));

body.push(h2('5.1 为什么必须走代理'));
body.push(p([bold('Luffa SuperBox 红线:'), txt(' API key 不能放在小程序包里 — 静态资源会被反编译。')]));
body.push(p([bold('解决方案:'), txt(' 你的小程序 → 你部署的代理 → 外部 API。代理在云端持 key,小程序看不到。')]));
body.push(p([txt('本项目选 '), bold('Vercel'), txt(' 做代理(免费、零运维、push 即部署),备选 '), bold('Cloudflare Workers'), txt('(同样免费,wrangler CLI 部署)。')]));

body.push(h2('5.2 Vercel 路径(推荐)'));

body.push(h3('5.2.1 项目结构'));
body.push(...code(`仓库根/
├── api/
│   └── fred.js          ← Vercel 自动识别为 serverless 函数
├── miniprogram/
└── README.md`));
body.push(p([txt('把 '), inlineCode('api/fred.js'), txt(' 放在仓库根 — Vercel 0 配置识别。')]));

body.push(h3('5.2.2 函数代码骨架'));
body.push(p([txt('参考 '), inlineCode('api/fred.js'), txt('。关键点:')]));
body.push(...code(`const ALLOWED_SERIES = new Set([
  'DGS10', 'T10Y2Y', 'UNRATE', 'CPIAUCSL', ...
]);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const key = process.env.FRED_API_KEY;
  if (!key) return res.status(500).json({ error: 'env not set' });

  const series = req.query.series;
  if (!ALLOWED_SERIES.has(series)) {
    return res.status(400).json({ error: 'not whitelisted' });
  }

  const upstream = await fetch('https://api.stlouisfed.org/...?api_key=' + key + ...);
  const data = await upstream.json();
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.status(200).json(data);
};`));

body.push(p([bold('3 个关键防御:')]));
body.push(bullet([txt('✅ '), bold('白名单'), txt(':只放行预设的 series,即使有人拿到你的代理 URL 也滥用不了')]));
body.push(bullet([txt('✅ '), bold('CORS 全开'), txt(':小程序请求不会带浏览器的 origin 头,全开无风险')]));
body.push(bullet([txt('✅ '), bold('1h 边缘缓存'), txt(':实际打到上游 API 的请求趋近于零')]));

body.push(h3('5.2.3 GitHub + Vercel 部署(一次性)'));
body.push(...code(`# 1. 本地 git 初始化
cd 你的项目根
git init -b main
git add -A
git commit -m "Initial commit"

# 2. 在 GitHub 创建空仓库, 然后:
git remote add origin https://github.com/你/项目.git
git push -u origin main

# 3. 在 https://vercel.com 用 GitHub 登录
#    → New Project → Import 这个仓库
#    → Framework: Other, Root Directory: 默认, Build/Output: 全空
#    → 展开 Environment Variables, 加:
#         Name: FRED_API_KEY
#         Value: 你的 32 位 key
#         Environments: ✓ Production ✓ Preview ✓ Development
#    → Deploy

# 4. 拿到 URL, 形如 https://你的项目.vercel.app`));

body.push(h3('5.2.4 验证代理通了'));
body.push(...code(`curl "https://你的项目.vercel.app/api/fred?series=DGS10"`));
body.push(pStr('期望:'));
body.push(...code(`{ "observations": [{ "date": "2026-05-08", "value": "4.38" }, ...] }`));

body.push(p([bold('坑 1:'), txt(' 返回 '), inlineCode('"FRED_API_KEY env not set"'), txt(' — env var 没生效。原因 99% 是 Vercel '), bold('加 env var 后没重新部署'), txt('。Vercel 不会自动 redeploy 现有函数,要么:')]));
body.push(bulletStr('手动:Deployments → ⋯ → Redeploy'));
body.push(bullet([txt('自动:'), inlineCode('git commit --allow-empty -m "trigger" && git push'), txt('(本项目用这招)')]));

body.push(p([bold('坑 2:'), txt(' '), inlineCode('SSL_ERROR_SYSCALL'), txt(' 短暂出现 — Vercel 正在切换部署版本,等 5-10 秒重试。')]));

body.push(h2('5.3 小程序端接代理'));
body.push(p([inlineCode('utils/fred.js'), txt(' 关键设计点:')]));
body.push(...code(`const PROXY_BASE = 'https://你的项目.vercel.app/api/fred';

function fetchSeries(seriesId, opts) {
  // 1. 先查本地 12h 缓存 - 离线也能用
  const cached = cache.get('fred_' + seriesId);
  if (cached && !opts.force) return Promise.resolve(cached);

  // 2. URL 拼接要兼容 Vercel (/api/fred?series=) 和 Cloudflare (?series=)
  const sep = PROXY_BASE.indexOf('?') === -1 ? '?' : '&';
  return new Promise((resolve, reject) => {
    wx.request({
      url: PROXY_BASE + sep + 'series=' + seriesId,
      success: (res) => {
        const parsed = parseObservations(seriesId, res.data.observations);
        cache.set('fred_' + seriesId, parsed, 12 * 3600 * 1000);
        resolve(parsed);
      },
      fail: reject
    });
  });
}`));

body.push(p([bold('3 件事必须有:')]));
body.push(numbered([bold('本地缓存'), txt(':同 series 12h 内不重复请求(经济数据日级 / 月级,够用)')]));
body.push(numbered([bold('优雅降级'), txt(':'), inlineCode('PROXY_BASE'), txt(' 还是占位时,UI 显示"未配置代理"提示,其他功能照常')]));
body.push(numbered([bold('错误隔离'), txt(':'), inlineCode('Promise.all([...])'), txt(' 包一层 '), inlineCode('.catch(err => ({error}))'), txt(',一个 series 挂掉不影响其他 5 个')]));

body.push(h2('5.4 真正点亮 UI · 实时仪表盘'));
body.push(pStr('在首页 hero 下方加一个 FRED 卡片,渲染 6 个核心指标 + 自动预警:'));
body.push(...code(`// pages/index/index.js
loadFred() {
  fred.fetchPanel().then(rows => {
    const t10y2y = rows.find(r => r.id === 'T10Y2Y');
    if (t10y2y && t10y2y.value < 0) {
      this.setData({
        yieldCurveWarning: '收益率曲线已倒挂 ... 历史上几乎所有美国经济衰退之前都出现过这一信号'
      });
    }
    this.setData({ fredPanel: rows });
  });
}`));
body.push(pStr('T10Y2Y 倒挂自动弹出书中「6 维熊市指标」的解读 — 这就是「用实时数据让书的论点在用户眼前发生」。'));

// === PHASE 6 ===
body.push(h1('Phase 6 · 部署到 Luffa'));
body.push(blockquote('约 30 分钟'));

body.push(h2('6.1 Luffa 控制台配域名白名单'));
body.push(blockquote('必做,否则真机上 wx.request 全部失败,IDE 模拟器即使勾「不校验合法域名」也只是绕过 IDE 自身。'));
body.push(numbered('Luffa 控制台 → 你的小程序 → 开发设置(或服务器配置)'));
body.push(numbered([bold('request 合法域名'), txt(' 列表里添加:')]));
body.push(...code(`https://你的项目.vercel.app`));
body.push(p([txt('注意:')]));
body.push(p([txt('• 只到域,'), bold('不带路径'), txt('('), inlineCode('/api/fred'), txt(' 这种不要写进白名单)')]));
body.push(p([txt('• 必须 HTTPS,HTTP 一定被拒')]));
body.push(numbered([txt('保存 → 等 '), bold('约 1 分钟'), txt(' Luffa 控制台缓存刷新')]));

body.push(h2('6.2 Luffa Cloud-Devtools 上传'));
body.push(numbered('下载 Luffa Cloud-Devtools(Mac/Windows/Linux 都有)'));
body.push(numbered('用注册的同一账号登录'));
body.push(numbered([bold('打开项目'), txt(' → 选 '), inlineCode('miniprogram/'), txt(' 目录(Native)或 '), inlineCode('dist/'), txt('(Taro build 后)')]));
body.push(numbered([txt('AppID 用下拉选,'), bold('不要手动输')]));
body.push(numbered('在 IDE 里:'));
body.push(bullet([bold('预览'), txt(':扫码用真机过一遍核心路径')]));
body.push(bulletStr('  · 首页所有章节卡片能点开'));
body.push(bulletStr('  · 模拟器切换情景表格实时更新'));
body.push(bulletStr('  · 滑块拖动结果跟着变'));
body.push(bulletStr('  · 选错答案变红、选对变绿'));
body.push(bulletStr('  · tabBar 5 个 tab 切换无白屏'));
body.push(bulletStr('  · FRED 仪表盘有真实数据(域名白名单生效后)'));
body.push(bullet([bold('包体检查'), txt(':IDE 显示的包大小必须 < 2 MB。本项目 ~200 KB。')]));
body.push(bullet([bold('上传'), txt(':点上传 → 版本号('), inlineCode('1.0.0'), txt(')→ 更新说明 → 提交')]));

body.push(h2('6.3 常见上传错误'));
body.push(tbl(
  ['错误', '原因', '解决'],
  [
    ['AppID 不匹配', 'project.config.json TCMPPappid 不对', '从控制台复制粘贴,不要手敲'],
    ['包体超过 2 MB', '引了 lodash / moment / 图片', '改成按需引用,删图标'],
    ['wx.invokeNativePlugin is not a function', '不在 Luffa IDE 内运行', '这是预期 — utils/luffa.js 已做 try/catch 降级']
  ],
  [3000, 3200, 3160]
));

// === PHASE 7 ===
body.push(h1('Phase 7 · 提交审核 + 发布'));

body.push(h2('7.1 审核前准备'));
body.push(pStr('在控制台填:'));
body.push(bullet([bold('功能分类'), txt(':教育 / 工具 / 阅读')]));
body.push(bullet([bold('测试账号'), txt(':互动书一般不需要(无登录)')]));
body.push(bullet([bold('隐私合规'), txt('(最容易被打回!)')]));
body.push(bulletStr('  · 写明"本应用不收集任何用户个人数据"'));
body.push(bulletStr('  · 写明"答题进度仅在本地 wx.storage 缓存,不上传"'));
body.push(bulletStr('  · 如果接了实时 API:"使用 [FRED 等] 公开数据 API,通过我方代理调用,不传输任何用户数据"'));
body.push(bullet([bold('金融建议免责声明'), txt('(教育 / 财经类必加)')]));
body.push(bulletStr('  · "本应用基于公开出版的 [书名] 一书的互动学习,不构成投资建议"'));
body.push(bulletStr('  · "示例情景与历史数据均来源于公开资料,不构成对任何标的的预测"'));

body.push(h2('7.2 提交'));
body.push(p([txt('控制台 → 版本管理 → 找到刚上传的「开发版本」→ '), bold('提交审核'), txt('。')]));
body.push(pStr('等 1-3 个工作日。被打回 → 看具体原因 → 改 → 重传 → 重提交。'));

body.push(h2('7.3 发布'));
body.push(p([txt('审核通过 → 状态「Approved」→ 团队管理员点 '), bold('发布'), txt(' → 状态变「Online」。')]));
body.push(pStr('扫描控制台给你的二维码即可在真机 SuperBox 中打开。'));

// === APPENDIX: ERROR TABLE ===
body.push(h1('附录 A · 排错速查表'));
body.push(tbl(
  ['现象', '最可能原因', '怎么修'],
  [
    ['IDE 模拟器里数学结果不对',  'Node 测试通过但 IDE 里错 = Page 数据流问题',  '检查 setData / compute 调用顺序'],
    ['FRED 卡片"加载失败"',       '域名白名单没生效 / 代理 env 没配',           '1) 等 1 分钟 2) curl 验证代理 3) 检查 PROXY_BASE 是否还是占位'],
    ['Vercel 函数返回 env not set','env 配了但函数没 redeploy',                ['git commit --allow-empty && git push 触发自动 redeploy'].map(s => txt(s, { font: MONO, size: 18 }))],
    ['真机能扫开但 fetch 失败',    'IDE 关了 urlCheck,真机走白名单',           '控制台加白名单,等 1 分钟'],
    ['包体上传报超过 2 MB',        '引了大库或图片资源',                       '`du -sh miniprogram/` 找大文件;改按需 import'],
    ['审核打回"金融建议"',        '描述里没免责',                             '加"基于公开出版书籍的教育 / 互动学习,不构成投资建议"'],
    ['审核打回"钱包披露缺失"',    '用了 connect/signMessage 但隐私政策没说',  '隐私政策加"读取钱包地址用于 X 功能"']
  ],
  [2500, 2700, 4160]
));

// === APPENDIX: WORKFLOW ===
body.push(h1('附录 B · 工作流速查'));
body.push(pStr('改完代码后怎么生效?'));
body.push(tbl(
  ['改了什么', '怎么生效'],
  [
    ['api/fred.js(代理逻辑)',                     'git push → Vercel 自动重新部署(~30s)'],
    ['miniprogram/utils/*.js 或页面',              '在 Luffa Cloud-Devtools 里 Cmd+B 重新编译 → 预览或上传新版本'],
    ['FRED_API_KEY(Vercel env)',                  'Settings → Env → 改后必须 Redeploy 才生效'],
    ['data/chapters.js(反预期内容)',              '同小程序代码,要重新上传'],
    ['新增 FRED series',                           '改 ALLOWED_SERIES + 改 SERIES → push + 重新上传'],
    ['Luffa 控制台白名单',                         '保存后等约 1 分钟,无需重新上传小程序']
  ],
  [3500, 5860]
));

// === APPENDIX: BONUS FEATURES ===
body.push(h1('附录 C · 互动书的「加分项」清单'));
body.push(pStr('按性价比排:'));
body.push(numbered([bold('联动按钮 ($) '), txt('— 章节详情页底部一行"→ 跳到 NPV / IRR / WACC"。30 行代码,体验飞跃。')]));
body.push(numbered([bold('动态 insight ($) '), txt('— 根据用户参数生成有针对性的解读。把作者的脑子灌进交互。')]));
body.push(numbered([bold('实时数据集成 ($$) '), txt('— 用今天的市场让书的论点"活"起来。本指南 Phase 5。')]));
body.push(numbered([bold('进度持久化 + 答对率 ($$) '), txt('— 11/11 全对解锁徽章。需要再加一个 stats 页。')]));
body.push(numbered([bold('中英双语 ($$) '), txt('— app.js 探测 Luffa 用户语言,chapters.js 加 _en 字段。')]));
body.push(numbered([bold('可视化图表 ($$$) '), txt('— wx canvas-2d 画 4 阶段回报柱状图。最贵但最炫。')]));
body.push(numbered([bold('NFT 学习徽章 ($$$$) '), txt('— 答对超 N 题 mint Endless 链 NFT。需要 Endless SDK + 合约。')]));
body.push(numbered([bold('群分享 hook ($$$) '), txt('— 每章反预期一键分享到 Luffa 群聊,附原书引用。luffa("share", ...) 调用。')]));

// === APPENDIX: COOKBOOK ===
body.push(h1('附录 D · 一次完整 cookbook · 复制粘贴版'));
body.push(pStr('把这一节当 checklist:'));
body.push(...code(`# === Phase 0: 内容设计 (人工, 不写代码) ===
# 1. 读完书
# 2. 列出 3 个核心模拟器
# 3. 每章列出一条"反预期事实 + 判断题"
# 4. 设计 4-6 个情景模板(带具体现金流/参数)

# === Phase 1: Luffa 控制台 ===
# 1. 注册账号 → 创建小程序 → 拿 AppID

# === Phase 2: 项目脚手架 ===
mkdir -p 你的项目/miniprogram/{pages/{index,sim1,sim2,sim3,twist,chapter},utils,data}
# 复制本项目的 app.json / app.wxss / project.config.json 作为模板

# === Phase 3: 数学 & 数据 ===
# 1. 写 utils/finance.js (纯函数,无 wx.*)
# 2. 写 data/chapters.js (Phase 0 设计的全部素材)
# 3. node 验证:
node -e "const f = require('./miniprogram/utils/finance.js'); console.log(...)"

# === Phase 4: 页面 ===
# 6 个页面 × 4 个文件 = 24 个文件
# 用本项目的 npv/wacc/chapter 作为模板

# === Phase 5: Vercel 代理 (可选) ===
git init -b main
git add -A && git commit -m "Initial commit"
git remote add origin https://github.com/你/你的repo.git
git push -u origin main
# → vercel.com 导入 → 加 FRED_API_KEY env → Deploy
# → 拿到 URL 填到 miniprogram/utils/fred.js
git add miniprogram/utils/fred.js && git commit -m "Wire proxy" && git push

# === Phase 6: 上传 ===
# 1. Luffa 控制台配域名白名单 https://你的项目.vercel.app, 等 1 分钟
# 2. 打开 Luffa Cloud-Devtools → 打开 miniprogram/ → 预览 → 上传

# === Phase 7: 上线 ===
# 控制台 → 版本管理 → 提交审核 (填教育分类 + 免责) → 等 1-3 天 → 发布`));

// === REAL CASE STUDY ===
body.push(h1('附录 E · 本指南覆盖的真实项目'));
body.push(p([
  new ExternalHyperlink({
    children: [new TextRun({ text: 'ViviennaMAO/FinancialCycle', style: 'Hyperlink', font: FONT })],
    link: 'https://github.com/ViviennaMAO/FinancialCycle'
  }),
  txt(' — 基于本指南完整流程做出的《金融周期》互动小程序:')
]));
body.push(bullet([bold('包体:'), txt('约 200 KB')]));
body.push(bullet([bold('文件:'), txt('40 个')]));
body.push(bullet([bold('时间:'), txt('从读完书到上传 IDE,约 8-12 小时')]));
body.push(p([
  bold('Vercel 代理:'),
  new ExternalHyperlink({
    children: [new TextRun({ text: ' https://financial-cycle.vercel.app/api/fred', style: 'Hyperlink', font: FONT })],
    link: 'https://financial-cycle.vercel.app/api/fred'
  })
]));
body.push(p([bold('Luffa AppID:'), txt(' '), inlineCode('mpkboyj2fc3l4u7q')]));

// === FINAL: MINDSET ===
body.push(h1('心法'));
body.push(numbered([bold('互动书的核心不是「小屏幕上的书」,是「能动手玩的概念」'), txt('。')]));
body.push(numbered([bold('反预期 ≠ 噱头'), txt('。每一条「违反直觉」都要有书里具体数据 / 案例支撑,否则就是震惊文案。')]));
body.push(numbered([bold('数学一定先在 Node 里测一遍'), txt('。IDE 里的 setData 流让 bug 难定位。')]));
body.push(numbered([bold('API key 永远不进包'), txt('。代理是不可省略的一层,别图省事。')]));
body.push(numbered([bold('少即是多'), txt(':5 个 tabBar、≤ 500 KB 包体、≤ 2000 行代码。这是 SuperBox 的甜区。')]));

// closing
body.push(divider());
body.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [txt('— 文档结束 —', { color: MUTED, italics: true })],
  spacing: { before: 240 }
}));

// ─── document ───────────────────────────────────────────────────────────

const doc = new Document({
  creator: 'Claude (for Vivienna MAO)',
  title: '在 Luffa SuperBox 上生成互动书小程序 · 详尽操作指南',
  styles: {
    default: { document: { run: { font: FONT, size: 22 } } },
    paragraphStyles: [
      {
        id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 36, bold: true, font: FONT, color: ACCENT },
        paragraph: { spacing: { before: 280, after: 200 }, outlineLevel: 0 }
      },
      {
        id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 28, bold: true, font: FONT, color: ACCENT },
        paragraph: { spacing: { before: 240, after: 140 }, outlineLevel: 1 }
      },
      {
        id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 24, bold: true, font: FONT },
        paragraph: { spacing: { before: 180, after: 100 }, outlineLevel: 2 }
      }
    ]
  },
  numbering: {
    config: [
      {
        reference: 'bullets',
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      },
      {
        reference: 'nums',
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      }
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: '互动书操作指南 · 第 ', font: FONT, size: 18, color: MUTED }),
            new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 18, color: MUTED }),
            new TextRun({ text: ' 页', font: FONT, size: 18, color: MUTED })
          ]
        })]
      })
    },
    children: body
  }]
});

Packer.toBuffer(doc).then(buf => {
  const outPath = '/Users/vivienna/Desktop/VibeCoding/金融周期/互动书操作指南.docx';
  fs.writeFileSync(outPath, buf);
  console.log('✅ Wrote:', outPath, '(' + (buf.length / 1024).toFixed(1) + ' KB)');
}).catch(err => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
