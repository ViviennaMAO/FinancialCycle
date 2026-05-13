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
  ShadingType, PageOrientation, ExternalHyperlink,
  PageNumber, Footer
} = require('docx');

// ─── helpers ────────────────────────────────────────────────────────────

const FONT = 'Arial';
const MONO = 'Menlo';
const ACCENT = 'B45309';
const MUTED = '64748B';
const PURPLE = '7C3AED';
const TBL_HEAD_BG = '0F172A';
const TBL_HEAD_FG = 'F8FAFC';
const HOOK_BG = 'FEF3C7';
const QUOTE_BG = 'F8FAFC';
const TBL_BORDER = { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' };
const CELL_BORDERS = { top: TBL_BORDER, bottom: TBL_BORDER, left: TBL_BORDER, right: TBL_BORDER };

function txt(s, opts = {}) {
  return new TextRun(Object.assign({ text: s, font: FONT }, opts));
}
function bold(s, opts = {}) { return txt(s, Object.assign({ bold: true }, opts)); }
function muted(s) { return txt(s, { color: MUTED }); }
function p(children, opts = {}) {
  const c = Array.isArray(children) ? children : [children];
  const runs = c.map(x => typeof x === 'string' ? txt(x) : x);
  return new Paragraph(Object.assign({ children: runs, spacing: { after: 140 }, alignment: AlignmentType.JUSTIFIED }, opts));
}
function pStr(s, opts = {}) { return p([txt(s)], opts); }
function h1(s, opts = {}) {
  return new Paragraph(Object.assign({
    heading: HeadingLevel.HEADING_1,
    children: [txt(s, { bold: true, size: 36, color: ACCENT })],
    spacing: { before: 320, after: 220 }
  }, opts));
}
function h1Break(s) { return h1(s, { pageBreakBefore: true }); }
function h2(s) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [txt(s, { bold: true, size: 28, color: ACCENT })],
    spacing: { before: 320, after: 140 }
  });
}
function h3(s) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [txt(s, { bold: true, size: 24 })],
    spacing: { before: 220, after: 100 }
  });
}
function bullet(children) {
  const c = Array.isArray(children) ? children : [typeof children === 'string' ? txt(children) : children];
  return new Paragraph({ numbering: { reference: 'bullets', level: 0 }, children: c, spacing: { after: 90 } });
}
function bulletStr(s) { return bullet([txt(s)]); }
function numbered(children) {
  const c = Array.isArray(children) ? children : [typeof children === 'string' ? txt(children) : children];
  return new Paragraph({ numbering: { reference: 'nums', level: 0 }, children: c, spacing: { after: 90 } });
}
function checkbox(s) {
  return new Paragraph({
    children: [txt('☐  ' + s)],
    spacing: { after: 80 },
    indent: { left: 360 }
  });
}
function blockquote(s, opts = {}) {
  return new Paragraph(Object.assign({
    children: [txt(s, { italics: true, color: MUTED })],
    indent: { left: 360 },
    border: { left: { style: BorderStyle.SINGLE, size: 18, color: ACCENT, space: 8 } },
    spacing: { before: 140, after: 180 },
    shading: { fill: QUOTE_BG, type: ShadingType.CLEAR }
  }, opts));
}
function callout(children, bg = HOOK_BG) {
  const c = Array.isArray(children) ? children : [typeof children === 'string' ? txt(children) : children];
  return new Paragraph({
    children: c,
    shading: { fill: bg, type: ShadingType.CLEAR },
    spacing: { before: 160, after: 200 },
    indent: { left: 200, right: 200 },
    border: {
      top: { style: BorderStyle.SINGLE, size: 4, color: ACCENT, space: 8 },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: ACCENT, space: 8 },
      left: { style: BorderStyle.SINGLE, size: 4, color: ACCENT, space: 8 },
      right: { style: BorderStyle.SINGLE, size: 4, color: ACCENT, space: 8 }
    }
  });
}
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
      const runs = Array.isArray(cell) ? cell : [typeof cell === 'string' ? txt(cell, { size: 22 }) : cell];
      return new TableCell({
        borders: CELL_BORDERS,
        width: { size: widths[i], type: WidthType.DXA },
        margins: { top: 100, bottom: 100, left: 140, right: 140 },
        children: [new Paragraph({ children: runs })]
      });
    })
  }));
  return new Table({ width: { size: totalWidth, type: WidthType.DXA }, columnWidths: widths, rows: [headerRow, ...dataRows] });
}
function divider() {
  return new Paragraph({
    children: [txt('')],
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1', space: 1 } },
    spacing: { before: 240, after: 240 }
  });
}

// ─── content ────────────────────────────────────────────────────────────

const body = [];

// ============ COVER ============
body.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [txt('在 Luffa SuperBox 上做一本', { bold: true, size: 40, color: ACCENT })],
  spacing: { before: 2400, after: 40 }
}));
body.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [txt('「互动书」', { bold: true, size: 56, color: ACCENT })],
  spacing: { after: 600 }
}));
body.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [txt('把你最爱的非虚构书,变成读者能动手玩的小程序', { italics: true, color: MUTED, size: 26 })],
  spacing: { after: 80 }
}));
body.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [txt('8-12 小时,AI Coder 帮你做 80% 的工作', { italics: true, color: MUTED, size: 22 })],
  spacing: { after: 1400 }
}));
body.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [txt('—— 案例项目 ——', { color: MUTED, size: 20 })],
  spacing: { after: 80 }
}));
body.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [txt('《金融周期》Peter C. Oppenheimer 著', { italics: true, color: MUTED, size: 22 })],
  spacing: { after: 800 }
}));
body.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [new ExternalHyperlink({
    children: [new TextRun({ text: 'github.com/ViviennaMAO/FinancialCycle', style: 'Hyperlink', font: FONT, size: 22 })],
    link: 'https://github.com/ViviennaMAO/FinancialCycle'
  })],
  spacing: { after: 60 }
}));
body.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [new ExternalHyperlink({
    children: [new TextRun({ text: 'financial-cycle.vercel.app/api/fred', style: 'Hyperlink', font: FONT, size: 22 })],
    link: 'https://financial-cycle.vercel.app/api/fred'
  })]
}));

// ============ 开头: 为什么要做这件事 ============
body.push(h1Break('为什么要做这件事'));

body.push(pStr('想象一下:你读完一本让你激动的非虚构书 ——《金融周期》《思考快与慢》《精益创业》《原则》。合上书的那一刻你觉得"懂了",但三周后再被人问起,你只剩一两句口号还在脑子里。'));

body.push(p([txt('这是因为'), bold('阅读是被动的'), txt('。书里的每个观点、每张图表、每个反直觉的事实,在你眼前流过去时确实点亮了你的某个神经元,但没有"用过"的知识不会留下。')]));

body.push(pStr('互动书想解决的就是这件事。'));

body.push(p([txt('一本书不再是静态的文字,而是一个'), bold('让你能动手把书里的论点玩出来的小程序'), txt(':')]));

body.push(bullet([txt('改一个参数,看看作者的模型在什么条件下会'), bold('失效'), txt('。')]));
body.push(bullet([txt('做一道选择题,发现自己的直觉'), bold('错在哪'), txt(',以及为什么大多数人都错。')]));
body.push(bullet([txt('用今天真实的市场数据,跑一下作者 2020 年写下的那个判断,'), bold('它现在还成立吗?')]));

body.push(p([txt('读完之后,书里的智慧才真正从纸上'), bold('长进'), txt('你的脑子里。')]));

body.push(pStr('这份指南讲的是怎么从零开始做出这样一本互动书,部署到 Luffa SuperBox 上,让任何人都能扫码玩。整个过程 8-12 小时,前提是你愿意把一半时间花在认真想"做什么内容"上,另一半交给 AI Coder 写代码。'));

// ============ 为谁写 ============
body.push(h1Break('这份指南为谁写'));

body.push(h2('👨‍💻 AI Coder 用户(用 Claude Code / Cursor / Windsurf 等)'));
body.push(pStr('你已经习惯让 AI 帮你写代码。但"做一个完整产品并上线"和"让 AI 写一个 demo"是两回事。这份指南会告诉你:'));
body.push(bullet([bold('AI 能帮你做到哪一步'), txt(':几乎所有的页面代码、数学函数、API 集成。')]));
body.push(bullet([bold('哪些事必须你亲手做'), txt(':控制台注册、AppID 获取、域名白名单、env 配置、审核合规话术 —— 这些 AI 一行代码都帮不了你。')]));
body.push(bullet([bold('AI 做出来的方案哪里最容易翻车'), txt(':数学公式没在 Node 里测、API key 被直接塞进前端、Vercel env 配了但忘了 redeploy。')]));
body.push(bullet([bold('怎么把 AI 当作团队成员而不是工具'), txt(':你是项目经理 + 内容总监,AI 是工程实现。AI 的输出永远要对照你 Phase 0 想清楚的内容回归到位。')]));
body.push(p([txt('读完后你会有一份'), bold('完整心智模型'), txt(',下一次拿到一本想做的书,你能立刻知道"问 AI 什么、自己做什么、什么时候喊停"。')]));

body.push(h2('📚 爱读书的技术小白'));
body.push(pStr('你不需要写过一行代码,但你想知道:有没有可能,把那本一直让你念念不忘的书,变成一个能给朋友/学生/同事玩的工具?'));
body.push(p([txt('这份指南'), bold('不会逼你学 React 或 JavaScript'), txt('。它会用大白话告诉你:')]));
body.push(bullet([bold('一本互动书的「骨架」长什么样'), txt(':模拟器是什么、反预期事件怎么设计、为什么需要章节地图。')]));
body.push(bullet([bold('哪些事情可以放心交给 AI 做'), txt(':写代码、做页面、对接 API。')]));
body.push(bullet([bold('哪些事情你必须自己想清楚'), txt('(没人能代劳):书里最有价值的 3 个工具 / 公式 / 框架是什么?每章哪个事实最反直觉?读者按完模拟器之后应该"哇"在哪里?')]));
body.push(bullet([bold('一些不让你被 AI 绕晕的常识'), txt(':为什么 API key 必须放代理、为什么打开率受"包体大小"影响、什么样的描述能通过 Luffa 审核。')]));
body.push(p([txt('读完后你不会变成程序员,但你会变成一个'), bold('能指挥 AI Coder 做出一本互动书的产品经理'), txt('。这是这个时代最有杠杆的角色之一。')]));

// ============ 流程总览 ============
body.push(h1Break('整个流程,一句话讲完'));
body.push(callout([bold('想清楚 → AI 写代码 → 你做必须人工的关键节点 → 上线。', { size: 26 })]));
body.push(pStr('展开来,7 个阶段、各自的主导者和大致时长:'));
body.push(tbl(
  ['阶段', '谁主导', '大致时长'],
  [
    [[bold('Phase 0'), txt(' · 内容设计')], [bold('你'), txt('(AI 只能辅助)')], '4-6 小时'],
    [[bold('Phase 1'), txt(' · 注册 Luffa 控制台拿 AppID')], '你(纯手工)', '10 分钟'],
    [[bold('Phase 2'), txt(' · 项目脚手架')], 'AI(你审查)', '30 分钟'],
    [[bold('Phase 3'), txt(' · 数学和数据')], 'AI(你必须验证数学)', '1-2 小时'],
    [[bold('Phase 4'), txt(' · 页面')], 'AI(你定 UI 优先级)', '3-5 小时'],
    [[bold('Phase 5'), txt(' · 实时数据集成(可选)')], 'AI 写代码 + 你做云端配置', '30-60 分钟'],
    [[bold('Phase 6'), txt(' · 部署 Luffa')], '你(必须人工)', '30 分钟'],
    [[bold('Phase 7'), txt(' · 审核 + 发布')], '你 + Luffa 审核员', '1-3 工作日']
  ],
  [3700, 3700, 1960]
));

// ============ 总览 · 心智模型 ============
body.push(h1Break('总览 · 互动书的心智模型'));
body.push(p([txt('一本互动书等于三样东西的组合:'), bold('内容'), txt(' + '), bold('模拟器'), txt(' + '), bold('反预期事件'), txt('。')]));

body.push(p([bold('内容'), txt('是书的章节地图和摘要 —— 但不是把整本书塞进小程序。互动书的核心价值是"重写",不是"复刻"。如果用户想完整读这本书,他应该去买实体书。')]));

body.push(p([bold('模拟器'), txt('是把作者的核心思考工具变成可玩的计算器。一本财经书有 NPV/IRR/WACC;一本心理学书有"框架效应模拟器";一本商业书有"单元经济学计算器"。模拟器的关键不是漂亮,是'), bold('让用户改参数后看到反直觉的结果'), txt('。')]));

body.push(p([bold('反预期事件'), txt('是每一章里那个"以为是 A,其实是 B"的核心事实。配上一道三选项判断题 + 答错的解释,读者就在 30 秒内同时被打脸 + 长记性。这是互动书相比纯文本的最大教育优势。')]));

body.push(h2('三个不能违反的原则'));
body.push(numbered([bold('不要把整本书塞进去'), txt('。互动书的价值在"重写为可玩",不在"在小屏幕上再读一遍"。')]));
body.push(numbered([bold('模拟器必须反预期'), txt('。如果用户改参数后结果跟他猜的差不多,他根本不会改。设计模拟器时,'), bold('把"令人意外的输出"当目标'), txt(',而不是"功能完整"。')]));
body.push(numbered([bold('API key 永远不在小程序包里'), txt('。所有外部 API(FRED 经济数据、OpenAI、股价等)都要走云端代理。小程序包会被反编译,密钥放进去等于公开。')]));

// ============ PHASE 0 ============
body.push(h1Break('Phase 0 · 内容设计'));
body.push(blockquote('这是整个流程里最不能交给 AI 的一步,也是花时间最值的一步。'));

body.push(p([bold('省这一步的代价'), txt(':做出来的小程序"能跑但没用",用户打开 30 秒就关掉。')]));
body.push(pStr('读完书(电子版/纸质都行)后,在白纸上写三件事。'));

body.push(h2('0.1 三个「核心数学 / 概念框架」'));
body.push(p([txt('这本书的工具箱里,最常用的 3 个'), bold('操作'), txt('是什么?注意是操作,不是概念 —— 概念是"机会成本",操作是"NPV 计算"。')]));
body.push(pStr('几个例子:'));
body.push(bullet([bold('《金融周期》(Oppenheimer)'), txt(' → NPV / IRR / WACC(估值与资本预算)')]));
body.push(bullet([bold('《精益创业》(Ries)'), txt(' → MVP 假设清单 / 单元经济学 / 转化漏斗')]));
body.push(bullet([bold('《思考快与慢》(Kahneman)'), txt(' → 框架效应模拟 / 锚定测试 / 概率直觉测试')]));
body.push(bullet([bold('《原则》(Dalio)'), txt(' → 决策日志 / 可信度加权 / 反思矩阵')]));
body.push(p([txt('每个操作对应一个模拟器页面。'), bold('最多 3 个'), txt(',贪多就稀释了。')]));

body.push(h2('0.2 每章一个反预期事件'));
body.push(p([txt('翻完每一章后问自己:'), bold('这一章里有什么是大多数读者会"以为是 A,其实是 B"的?')]));
body.push(pStr('对这条反预期的要求:'));
body.push(bullet([txt('必须有书里'), bold('具体的数据 / 表格 / 历史案例'), txt('支撑。这是和"心灵鸡汤"的分界线。')]));
body.push(bulletStr('写成一句"钩子句"(hook),够短够冲击 —— 例:"经济最差的时候是最差的买点 —— 错。"'));
body.push(bulletStr('配一段详细解释,把数据 / 案例完整摆出来。'));
body.push(bulletStr('设计一道三选项判断题,让用户在被告知"真相"之前先猜一次。'));
body.push(bulletStr('写好"答错的解释",讲清为什么大多数人都猜错。'));
body.push(p([txt('11 章书就有 11 个反预期。这是互动书里'), bold('单点价值密度最高'), txt('的内容。')]));

body.push(h2('0.3 章节地图'));
body.push(pStr('把这本书的所有章节做成结构化清单。每一章包含:章节号、所属"大部分"(如果书分了 part)、章名、一两句话的摘要、这一章的反预期事件(hook、详细解释、判断题、答错解释)。'));
body.push(p([txt('这份清单是后面 AI 写代码时'), bold('最重要的"原料表"'), txt('。把它做扎实了,后面的代码生成 AI 几乎不会卡壳。')]));

body.push(h2('0.4 给模拟器设计「情景模板」'));
body.push(p([txt('光给一个空白计算器,用户不知道怎么玩。'), bold('预设 4-6 个故事化情景'), txt(',每个对应书里的一个论点。点一下情景按钮,所有参数自动填好,用户立刻看到该情景下的反差。')]));
body.push(p([txt('以《金融周期》的 NPV/IRR 模拟器为例:')]));
body.push(tbl(
  ['情景名', '故事', '教学点'],
  [
    ['希望期反弹',    '衰退底部入场,1 年后强劲反弹',  'IRR ≈ +24%,对应原书表 4.1 希望期 +69%'],
    ['增长期成熟',    '盈利到顶,逐年放缓',           'IRR ≈ +0.4%,对应表 4.1 增长期 +2%'],
    ['泡沫追高',      '500 倍 PE 买龙头股',           'IRR ≈ −33%,漂亮 50 的命运'],
    ['科技革命赢家',  '前期亏损,后期指数级回报',      'IRR ≈ +14%,长期赢家但要忍前期']
  ],
  [2000, 3360, 4000]
));
body.push(p([bold('设计原则'), txt(':情景间的结果跨度要大(本例 −33% 到 +24%),用户切换时能立刻看到反差。数字尽量对齐书里的真实数据(本例 +0.4% ≈ 表 4.1 增长期 +2%),让模拟器和书形成强对照。')]));

body.push(h2('0.5 这一步要花多少时间?'));
body.push(p([txt('读完一本约 250 页的书加上 Phase 0 全过程,大约 '), bold('4-6 小时'), txt('。')]));
body.push(p([bold('这是整个项目里最值得的时间'), txt('。把这一步草草做完,后面所有代码都救不回来。')]));

// ============ PHASE 1 ============
body.push(h1Break('Phase 1 · 注册 Luffa 控制台,拿 AppID'));
body.push(blockquote('一次性,约 10 分钟。AI 帮不了你,纯手工。'));

body.push(pStr('打开 Luffa Cloud 开发者控制台,右上角"注册账号"。注册完登录后,点"创建小程序",填几件事:'));
body.push(bullet([bold('名称'), txt(':中文 ≤ 20 字符。比如"金融周期 · 互动学习"。')]));
body.push(bullet([bold('分类'), txt(':选"教育"或"工具"或"阅读"。')]));
body.push(bullet([bold('描述'), txt(':≥ 50 字,要说清"是什么 / 为谁 / 做什么"。这段会进审核,认真写。')]));
body.push(bullet([bold('图标'), txt(':512×512 PNG。可以让 AI 帮你画一个简洁的几何图标。')]));
body.push(p([txt('控制台会自动发一个 AppID,形如 16 位字母数字。'), bold('复制保存'), txt(' —— 这是接下来 IDE 里唯一的"识别码"。')]));

body.push(callout([
  bold('关键提醒'),
  txt(':这一步'),
  bold('不要'),
  txt('马上配域名白名单。如果你打算用实时数据(Phase 5),要等代理部署完拿到真实 URL 后再配。现在配会指向不存在的地址。')
]));

// ============ PHASE 2 ============
body.push(h1Break('Phase 2 · 项目脚手架'));
body.push(blockquote('30 分钟。AI 主导,你做技术决策 + 审查。'));

body.push(h2('2.1 第一个决策:native 还是 Taro?'));
body.push(tbl(
  ['', 'Native (WXML/WXSS/JS)', 'Taro 4 + React + TypeScript'],
  [
    ['包体', '极小(本项目约 200 KB)', '较大(600 KB 起)'],
    ['学习曲线', '几乎为零', '已经会 React 才舒服'],
    ['适合', '内容型 / 数学型应用', '复杂 UI / 现有 React 库要复用']
  ],
  [1800, 3800, 3760]
));
body.push(p([bold('互动书优先选 Native'), txt('。Taro 的 runtime 开销对一个学习型应用是浪费。让 AI 知道你选了 native,它就不会引入 React/Vue/TypeScript 等不必要的层。')]));

body.push(h2('2.2 一个小程序长什么样'));
body.push(pStr('最终的项目目录里,你会看到:'));
body.push(bullet([txt('一个'), bold('根配置文件'), txt(',告诉小程序"我有哪些页面、底部 tab bar 是什么样的、整体配色如何"。')]));
body.push(bullet([txt('一个'), bold('全局逻辑文件'), txt(',负责跨页面的状态,比如用户答题进度的本地缓存。')]));
body.push(bullet([txt('一个'), bold('全局样式文件'), txt(',定义品牌色、字体、卡片样式。')]));
body.push(bullet([txt('一个'), bold('utils 文件夹'), txt(',放可被多个页面复用的工具:数学函数(NPV / IRR / WACC)、缓存(本地存储 + TTL)、Luffa 原生桥接、外部 API 客户端。')]));
body.push(bullet([txt('一个'), bold('data 文件夹'), txt(',放 Phase 0 设计的章节地图和情景模板。')]));
body.push(bullet([txt('一个'), bold('pages 文件夹'), txt(',放六个页面:首页(目录 + 实时仪表盘)、3 个模拟器、1 个反预期总览、1 个章节详情子页。')]));

body.push(h2('2.3 tabBar 的硬限制'));
body.push(p([txt('底部 tab bar '), bold('最多 5 个'), txt('(SuperBox 和微信都一样)。本项目的分配:目录 / 模拟器 1 / 模拟器 2 / 模拟器 3 / 反预期总览。章节详情是从首页或反预期页跳过来的子页,不占 tab。')]));
body.push(pStr('设计建议:'));
body.push(bullet([bold('不放图标,只用文字'), txt('。省一堆 PNG 资源,符合"包体越小越好"原则。')]));
body.push(bullet([bold('配色和品牌色对齐'), txt(':tabBar 文字色暗、选中色亮(本项目暗灰 + 金色)。')]));

body.push(h2('2.4 三个配置文件的角色'));
body.push(bullet([bold('project.config.json'), txt(' —— IDE 配置。最关键的是 AppID 字段。另外有个"是否检查域名白名单"开关,在 IDE 里调试时可以临时关,但'), bold('真机一定要为 true'), txt('。')]));
body.push(bullet([bold('app.json'), txt(' —— 小程序自己的配置。告诉运行时:"我有这 6 个页面要注册"、"tabBar 显示哪 5 个"、"全局窗口背景色和字体颜色"。')]));
body.push(bullet([bold('sitemap.json'), txt(' —— 搜索引擎索引规则。互动书一般全部允许,一行配置搞定。')]));
body.push(pStr('让 AI 一次性生成这三个文件 + 上面 2.2 提到的目录结构,然后你打开 Luffa Cloud-Devtools 试着"打开项目"指向这个目录。如果模拟器能渲染出空首页,Phase 2 就过了。'));

// ============ PHASE 3 ============
body.push(h1Break('Phase 3 · 数学和数据'));
body.push(blockquote('1-2 小时。AI 写代码,你必须亲自验证数学。'));

body.push(h2('3.1 数学要「纯净」'));
body.push(p([txt('让 AI 把所有数学(NPV / IRR / WACC 之类)写在一个单独的工具文件里,'), bold('只接受数字和数组、只返回数字和对象,绝不调用小程序专有 API'), txt('。')]));
body.push(pStr('这样做有两个好处:第一,你可以在自己电脑上用命令行直接跑这个文件,不用启动整个小程序就能测;第二,数学和 UI 解耦,以后改 UI 不会动到公式,改公式也不会动到 UI。'));

body.push(h2('3.2 让数学「感知周期阶段」(关键技巧)'));
body.push(p([txt('光实现"教材版"的 NPV 远远不够。互动书的高级感来自'), bold('同一公式在不同语境下输出完全不同的结果'), txt('。')]));
body.push(pStr('具体做法:让 AI 给每个"周期阶段"(绝望 / 希望 / 增长 / 乐观)各定义一个折现率的"加成"。比如绝望期投资者要求更高回报,加 4 个百分点;希望期市场愿意接受更低折现率,减 2 个百分点。'));
body.push(p([txt('这样,NPV 页就能在一张表里展示'), bold('同一现金流在 4 个阶段下完全不同的 NPV'), txt('。用户的直觉里"现金流不变 NPV 就不变",但现在他亲眼看到 NPV 在 4 个阶段间从正翻成负 —— '), bold('抽象的「周期红利」瞬间变成了 4 个数字'), txt('。这就是互动书的「哇」时刻。')]));

body.push(h2('3.3 在 Node 里测一遍数学(这步必做)'));
body.push(p([txt('让 AI 写完数学函数后,'), bold('你自己在命令行里跑一道教材标准题'), txt('。比如:')]));
body.push(bullet('"初始投入 100,后续 5 年每年回 30,折现率 10%" —— 教材标准答案 NPV = 13.7236。'));
body.push(bullet('同一组现金流的 IRR 教材标准答案 = 15.24%。'));
body.push(bullet('WACC 标准例题:股权占比 60%、债务 40%、股权成本 12%、债务成本 6%、税率 25% —— 标准答案 9.00%。'));
body.push(pStr('把 AI 写的代码跑一遍,确认每个数字和教材都精确对得上(差到小数点后第 4 位)。'));
body.push(callout([
  bold('这是唯一能在小程序之外捕获数学 bug 的机会。'),
  txt(' 本项目就靠这一步发现了"增长期成熟"情景的 IRR 算出来严重偏负,与设计意图"经济仍在增长,IRR 应略正"矛盾。改了现金流参数才纠正过来。')
]));
body.push(p([txt('如果你不亲自验,AI 生成的代码即使语法没错,数学也可能微妙地错 —— 而错的数学在用户那里会'), bold('永远错下去'), txt(',你的产品就废了。')]));

body.push(h2('3.4 章节数据兼任「参数库」'));
body.push(pStr('让 AI 把 Phase 0 设计的章节数据放在 data 文件夹里,这个文件同时给两类页面服务:'));
body.push(bullet([bold('首页 / 反预期总览 / 章节详情'), txt(' 用它来渲染章节内容。')]));
body.push(bullet([bold('三个模拟器'), txt(' 用它的另一部分(情景模板对象)拿到预设情景。')]));
body.push(p([txt('这样章节和模拟器自然形成'), bold('交叉引用'), txt('。用户在第三章详情页底部点 "→ NPV" 按钮,可以直接跳到 NPV 模拟器并自动加载"希望期反弹"情景。这种联动是「互动书」和「普通计算器 app」的最大差别。')]));

// ============ PHASE 4 ============
body.push(h1Break('Phase 4 · 页面'));
body.push(blockquote('3-5 小时。AI 主力,你定 UI 优先级和体验细节。'));

body.push(h2('4.1 模拟器页的通用六段式'));
body.push(pStr('每个模拟器页,从上到下都是这六段:'));
body.push(numbered([bold('概念卡片'), txt(' —— 一段话讲清这个模拟器对应的公式 / 框架,引用书里的章节。')]));
body.push(numbered([bold('情景模板按钮'), txt(' —— 4-6 个 Phase 0.4 设计的故事化情景,一键切换会重置所有参数。')]));
body.push(numbered([bold('参数输入'), txt(' —— 滑块、数字输入框、表格行编辑等。让用户随便改。')]));
body.push(numbered([bold('实时计算结果'), txt(' —— 一个大号金色数字,任何参数变化都立刻重算。')]));
body.push(numbered([bold('对照表格'), txt(' —— 一张表把不同周期阶段 / 不同情景的结果并排放,让「反预期」显形。')]));
body.push(numbered([bold('关键观察'), txt(' —— 一段根据当前结果动态生成的文字解读,像「作者站在用户旁边讲」。')]));
body.push(p([bold('实现要点'), txt(':任何参数变化就立刻重算 —— 不要做 throttle / debounce。这种 app 的计算几乎都在 1ms 以下,直接全量重算最干净,延迟反而让人觉得卡。')]));

body.push(h2('4.2 「关键观察」是这本互动书最具杀手锏的一段(优先做好)'));
body.push(pStr('让 AI 写一个简单的判断逻辑:用户当前的参数组合属于哪一类?'));
body.push(bullet([bold('「全周期都创造价值」'), txt(' —— 显示某条来自书里的洞察(比如:"巴菲特意义上的好生意")。')]));
body.push(bullet([bold('「全周期都不创造价值」'), txt(' —— 显示另一条(比如:"不要靠等周期反转自我安慰")。')]));
body.push(bullet([bold('「不同周期间跨度极大」'), txt(' —— 显示第三条(比如:"这是高久期资产,估值几乎只是折现率的函数")。')]));
body.push(bullet([bold('「正负翻转,取决于入场点」'), txt(' —— 显示第四条(比如:"这是周期红利依赖型项目,入场点决定一切")。')]));
body.push(p([txt('这一段是把'), bold('作者的智慧灌进交互'), txt('的关键 —— 远比写一段静态说明文字有效。用户每改一次参数,都像收到一条作者的私信点评。')]));

body.push(h2('4.3 章节详情页'));
body.push(p([txt('章节详情页是从首页或反预期总览页'), bold('跳过来'), txt('的子页,结构很固定:')]));
body.push(numbered('章节标题 + 摘要(从章节数据拉)。'));
body.push(numbered('反预期 hook(用紫色 / 高亮卡片突出)。'));
body.push(numbered('详细解释 + 数据 / 案例完整呈现。'));
body.push(numbered([txt('三选项判断题。'), bold('选错变红,选对变绿'), txt(',然后才显示「为什么」的答错解释。')]));
body.push(numbered('上一章 / 下一章导航,方便连续读。'));
body.push(numbered([bold('联动到三个模拟器的按钮'), txt(' —— 让用户读完反预期立刻去模拟器验证。')]));
body.push(p([txt('第 4 步的"先猜再揭晓"是这个页的精华,'), bold('不能让用户跳过猜的环节直接看答案'), txt(',否则反预期效果减半。')]));

body.push(h2('4.4 进度持久化'));
body.push(pStr('让 AI 用小程序自带的本地存储 API,记下用户答过的每道题、选了哪个选项。下次打开时不重置 —— 用户能看到自己已经答过哪几章、选错了几次。'));
body.push(pStr('这是任何「学习类应用」的最低体验。也是后续可以扩展「答对超 N 题解锁徽章」功能的数据基础。'));

body.push(h2('4.5 Luffa 原生桥接'));
body.push(p([txt('即使你的 MVP 用不到钱包 / 群分享 / 链调用,'), bold('也先让 AI 包一层 Luffa 桥接函数'), txt('。')]));
body.push(pStr('未来你想加「完成答题领 NFT 徽章」、「一键分享某章反预期到 Luffa 群聊」、「用 Luffa 身份登录」等功能时,改一行调用就行,不用重构整个项目。这是几行代码的代价,换来未来零摩擦升级。'));

// ============ PHASE 5 ============
body.push(h1Break('Phase 5 · 实时数据集成(可选)'));
body.push(blockquote('30-60 分钟。互动书的「活」靠数据 —— 让模拟器跟着今天的市场跑,体验完全不同。'));
body.push(pStr('可以跳过这一步,你的互动书也能正常工作。但如果你的书涉及「市场 / 经济 / 实时数据」,接上实时数据后的版本和静态版本不是一个量级的。'));

body.push(h2('5.1 为什么必须走「代理」?'));
body.push(p([txt('互动书的核心红线:'), bold('API key 永远不能放在小程序包里'), txt('。小程序包是公开的、会被反编译。一旦 key 进了包,任何人都能拿去用 —— 几天内你的免费 quota 就被刷爆,或者被收高额账单。')]));
body.push(pStr('正确做法:'));
body.push(callout([bold('你的小程序 → 你部署的代理(在云端持 API key) → 外部 API', { size: 24 })]));
body.push(p([txt('代理是一个极简的 Web 函数,跑在你自己的免费云服务器上(Vercel / Cloudflare Workers),它持有 key、检查请求合法性、转发到外部 API、返回结果。'), bold('小程序看不到 key,只看到代理 URL'), txt('。')]));

body.push(h2('5.2 用 Vercel 部署代理(推荐路径)'));

body.push(h3('准备:让 AI 写一个 4 步代理函数'));
body.push(pStr('让 AI 在仓库根目录新建一个 api 文件夹,里面放一个文件(对应你接的外部 API,本项目案例叫 fred.js)。这个文件就是一个 Web 函数,做四件事:'));
body.push(numbered('接收前端传来的参数(本项目案例是 series,比如 "DGS10" = 10 年期美债收益率)。'));
body.push(numbered([bold('检查参数是不是在白名单内'), txt(' —— 即使有人拿到代理 URL 也只能拉预设的几个数据。')]));
body.push(numbered('用环境变量里的 API key 去外部 API 抓数据。'));
body.push(numbered('加一个 1 小时边缘缓存,然后返回 JSON。'));
body.push(p([txt('三个防御要全有:'), bold('白名单'), txt(' + '), bold('CORS 全开'), txt('(小程序请求不带 origin,全开无风险) + '), bold('边缘缓存'), txt('(节省 API quota)。')]));

body.push(h3('部署步骤(纯手工,AI 帮不了)'));
body.push(numbered([bold('申请 API key'), txt('。比如 FRED 在 fred.stlouisfed.org 上注册免费拿,32 位字符串。')]));
body.push(numbered([bold('把代码推到 GitHub'), txt('。让 AI 帮你跑 git 命令。如果是第一次用 GitHub,先在网页上建一个空仓库。')]));
body.push(numbered([bold('打开 vercel.com,用 GitHub 账号登录'), txt('。')]));
body.push(numbered([bold('点 "Add New → Project"'), txt(',选刚 push 上去的仓库,Import。')]));
body.push(numbered([bold('配置页面'), txt(':Framework 选 "Other",其他都留空。'), bold('不要立刻点 Deploy'), txt('。')]));
body.push(numbered([bold('展开 "Environment Variables"'), txt(',加一项:')]));
body.push(bulletStr('Name 填:API key 的名字(比如 FRED_API_KEY,全大写、下划线、没有空格)'));
body.push(bulletStr('Value 填:第 1 步拿到的 32 位 key'));
body.push(bulletStr('Environment 三个全勾(Production / Preview / Development)'));
body.push(numbered([bold('点 Deploy'), txt('。约 30 秒后 Vercel 给你一个 URL,形如 "你的项目名.vercel.app"。')]));

body.push(h3('验证代理通了'));
body.push(pStr('打开浏览器访问代理 URL + 参数(比如 "你的项目.vercel.app/api/fred?series=DGS10"),如果看到一段 JSON 含数据数组(里面是日期 + 数值的对象),代理就通了。'));

body.push(h3('两个会让人困惑半天的坑'));
body.push(p([bold('坑 1:'), txt('返回 「env not set」错误。99% 的情况是 env 加了但函数没重新部署。Vercel '), bold('不会自动 redeploy 现有函数'), txt(',你要么手动去 Deployments 找最新那条点 Redeploy,要么让 AI 帮你 push 一个空 commit 触发自动 redeploy(这是本项目的做法 —— 干净不出错)。')]));
body.push(p([bold('坑 2:'), txt('浏览器报 SSL 错误。短暂的 SSL 错误通常出现在 Vercel 正在切换部署版本的几秒钟。等 5-10 秒重试。')]));

body.push(h2('5.3 小程序端连接代理 —— 三件事不能少'));
body.push(pStr('让 AI 在 utils 里写一个外部 API 客户端,务必做到三件事:'));
body.push(numbered([bold('本地缓存 12 小时'), txt('。经济数据是日级 / 月级的,不需要每次都重新拉。配合 Vercel 的边缘缓存 1 小时,真正打到上游 API 的请求量几乎为零,quota 用不完。')]));
body.push(numbered([bold('优雅降级'), txt('。如果代理 URL 还是占位(说明你还没填上 Vercel 给的实际地址),UI 显示「未配置代理」提示,模拟器照常工作。'), bold('绝对不能让 UI 因为外部 API 挂掉而崩'), txt('。')]));
body.push(numbered([bold('错误隔离'), txt('。多个数据序列并行请求时,某一个挂了不能影响其他几个。')]));

body.push(h2('5.4 用实时数据让书的论点「在用户眼前发生」'));
body.push(p([txt('最值得做的一件事:在首页 hero 卡片下方,加一个'), bold('实时仪表盘'), txt(',渲染 6 个核心宏观指标(《金融周期》案例里是 10 年期美债收益率、2 年期美债收益率、收益率曲线利差、联邦基金利率、失业率、CPI 同比)。')]));
body.push(pStr('进阶招:在客户端加一段判断 —— 如果「10 年期 - 2 年期」利差为负(收益率曲线倒挂),自动弹出书里第六章关于熊市指标的解读。'));
body.push(callout([
  bold('这就是用今天的市场,让作者的 2020 年论点「活」在用户眼前。'),
  txt(' 比任何静态文字都有冲击力。')
]));

// ============ PHASE 6 ============
body.push(h1Break('Phase 6 · 部署到 Luffa'));
body.push(blockquote('30 分钟。你必须人工做,AI 帮不上忙。'));

body.push(h2('6.1 配域名白名单(必做)'));
body.push(p([txt('打开 Luffa 控制台 → 你的小程序 → 开发设置(或称「服务器配置」)→ 「request 合法域名」列表。')]));
body.push(p([txt('把你 Phase 5 拿到的 Vercel URL 加进去,'), bold('注意几点'), txt(':')]));
body.push(bullet([bold('只到域名,不带路径'), txt('。填「https://你的项目名.vercel.app」,不要填「/api/fred」后缀。')]));
body.push(bullet([bold('必须是 HTTPS'), txt(',HTTP 一定被拒。')]));
body.push(bullet([txt('加进去之后'), bold('等约 1 分钟'), txt('让 Luffa 控制台缓存刷新,不然 IDE 里立刻测会失败。')]));
body.push(p([txt('如果跳过这一步,你的真机用户'), bold('100% 会看到白屏 / 加载失败'), txt('。IDE 模拟器即使勾「不校验合法域名」也只是绕过 IDE,真机一定走白名单。')]));

body.push(h2('6.2 在 Luffa Cloud-Devtools 里上传'));
body.push(numbered('从 Luffa 控制台下载 Cloud-Devtools(Mac/Windows/Linux 三个平台都有)。'));
body.push(numbered('用注册账号登录(必须是同一个账号)。'));
body.push(numbered([bold('打开项目'), txt(' —— 选小程序目录。AppID 用下拉选,不要手动输,避免手敲错误。')]));
body.push(numbered('在 IDE 里做这几件事:'));
body.push(bullet([bold('预览'), txt(' —— 扫码用真机过一遍核心路径:首页章节卡片能点开吗?模拟器切换情景后表格实时更新吗?滑块拖动结果跟着变吗?选错答案变红、选对变绿吗?tabBar 切换无白屏吗?实时仪表盘有真实数据吗?')]));
body.push(bullet([bold('包体检查'), txt(' —— IDE 显示的包大小必须小于 2 MB(SuperBox 硬限制)。本项目约 200 KB。')]));
body.push(bullet([bold('上传'), txt(' —— 填版本号(建议 1.0.0)+ 更新说明 → 提交。')]));

body.push(h2('6.3 常见上传错误'));
body.push(tbl(
  ['错误', '原因', '解决'],
  [
    ['AppID 不匹配', 'project.config.json 里 AppID 字段不对', '从控制台复制粘贴,不要手敲'],
    ['包体超过 2 MB', '引了大型库 / 图片', '让 AI 改成按需引用,删图片资源'],
    ['Luffa 桥接函数报错', '不在 Luffa IDE 内运行', '这是预期 —— 桥接代码应该有 try/catch 降级']
  ],
  [2800, 3400, 3160]
));

// ============ PHASE 7 ============
body.push(h1Break('Phase 7 · 审核 + 发布'));
body.push(blockquote('1-3 个工作日。等 Luffa 审核员。你的工作是把审核需要的话术写对。'));

body.push(h2('7.1 审核前在控制台填的内容'));
body.push(bullet([bold('功能分类'), txt(':教育 / 工具 / 阅读。')]));
body.push(bullet([bold('测试账号'), txt(':互动书一般不需要(无登录),勾「无需测试账号」。')]));
body.push(bullet([bold('隐私合规'), txt('(这一项最容易被打回!):')]));
body.push(bulletStr('  · 写明「本应用不收集任何用户个人数据」。'));
body.push(bulletStr('  · 写明「答题进度仅在本地存储,不上传服务器」。'));
body.push(bulletStr('  · 如果你接了实时 API:「使用公开数据 API,通过我方代理调用,不传输任何用户数据」。'));
body.push(bullet([bold('金融建议免责声明'), txt('(教育 / 财经类'), bold('必加'), txt('):')]));
body.push(bulletStr('  · 「本应用基于公开出版的《[书名]》一书的互动学习,不构成投资建议」。'));
body.push(bulletStr('  · 「示例情景与历史数据均来源于公开资料,不构成对任何标的的预测」。'));
body.push(p([txt('写得'), bold('越具体越保守'), txt(',审核越顺利。')]));

body.push(h2('7.2 提交审核'));
body.push(pStr('控制台 → 版本管理 → 找到你刚上传的「开发版本」→ 点「提交审核」。'));
body.push(pStr('等 1-3 个工作日。如果被打回,看具体原因,改完重传重新提交即可。常见打回原因都在附录 A 的速查表里。'));

body.push(h2('7.3 发布'));
body.push(pStr('审核通过后,状态变成 Approved。团队管理员点「发布」,状态变成 Online。'));
body.push(pStr('控制台会给你一个二维码 —— 在任何装了 Luffa app 的真机上扫一下,就能打开你的互动书。'));
body.push(pStr('发给朋友 / 学生 / 同事玩,看他们的反应。'));

// ============ APPENDIX A ============
body.push(h1Break('附录 A · 排错速查表'));
body.push(tbl(
  ['现象', '最可能原因', '怎么修'],
  [
    ['IDE 模拟器里数学结果不对',          'Node 测试通过但 IDE 错 = 页面数据流问题',  '检查参数变化和重算的调用顺序'],
    ['实时仪表盘「加载失败」',             '域名白名单没生效 / 代理 env 没配',         '等 1 分钟;浏览器验证代理;检查小程序里代理 URL 是否还是占位'],
    ['Vercel 函数返回「env not set」',    'env 配了但函数没 redeploy',                'push 一个空 commit 触发自动 redeploy 最干净'],
    ['真机能扫开但 API 调用失败',          'IDE 关了校验但真机一定走白名单',           '控制台加白名单,等约 1 分钟'],
    ['包体上传报超过 2 MB',                '引了大库或图片资源',                       '让 AI 找出最大的几个文件,改按需 import / 删图片'],
    ['审核打回「金融建议」',               '描述里没写免责声明',                       '加「基于公开出版书籍的教育 / 互动学习,不构成投资建议」'],
    ['审核打回「钱包披露缺失」',           '用了钱包功能但隐私政策没说',               '隐私政策加「读取钱包地址用于 X 功能」']
  ],
  [2400, 2800, 4160]
));

// ============ APPENDIX B ============
body.push(h1Break('附录 B · 工作流速查 —— 改完代码后怎么生效'));
body.push(tbl(
  ['改了什么', '怎么生效'],
  [
    ['代理逻辑(api 下的代理文件)',         'git push → Vercel 自动重新部署,约 30 秒'],
    ['小程序页面或工具函数',                  'Luffa Cloud-Devtools 里重新编译 → 预览或上传新版本'],
    ['Vercel 环境变量',                       'Settings → Env 改完后必须 Redeploy 才生效'],
    ['章节内容(data 下的章节文件)',         '同小程序代码,要重新上传'],
    ['新增数据源(API series)',              '改代理白名单 + 改小程序客户端 → push + 重新上传'],
    ['Luffa 控制台白名单',                    '保存后约 1 分钟生效,无需重新上传小程序']
  ],
  [3700, 5660]
));

// ============ APPENDIX C ============
body.push(h1Break('附录 C · 互动书的「加分项」清单'));
body.push(pStr('按性价比排序:'));
body.push(numbered([bold('联动按钮 ($ —— 几行代码)。'), txt('章节详情页底部一行「→ 跳到 NPV / IRR / WACC」。30 行代码,体验跨越式提升。')]));
body.push(numbered([bold('动态 insight ($)。'), txt('根据用户参数生成有针对性的解读。把作者的脑子灌进交互的最快方法。')]));
body.push(numbered([bold('实时数据集成 ($$ —— Phase 5)。'), txt('用今天的市场让书的论点「活」起来。')]));
body.push(numbered([bold('进度持久化 + 答对率统计 ($$)。'), txt('10/11 全对解锁徽章。要再加一个统计页。')]));
body.push(numbered([bold('中英双语 ($$)。'), txt('让 AI 给章节数据加英文字段,运行时根据 Luffa 用户语言切换。')]));
body.push(numbered([bold('可视化图表 ($$$)。'), txt('用 canvas 画 4 阶段回报柱状图等。最贵但视觉最炫。')]));
body.push(numbered([bold('NFT 学习徽章 ($$$$)。'), txt('答对超 N 题就 mint 一个 Endless 链 NFT。需要接 Endless SDK + 部署 Move 合约,工作量大。')]));
body.push(numbered([bold('群分享 hook ($$$)。'), txt('每章反预期一键分享到 Luffa 群聊,附原书引用。')]));

// ============ APPENDIX D ============
body.push(h1Break('附录 D · 完整流程清单(一页 checklist)'));
body.push(pStr('不带任何代码,按这个清单一条条做。'));

body.push(h3('Phase 0 · 内容设计(纯人工,4-6 小时)'));
body.push(checkbox('读完书'));
body.push(checkbox('列出 3 个最常用的「操作」作为模拟器候选'));
body.push(checkbox('每章列出一条「反预期事实 + 三选项判断题 + 答错解释」'));
body.push(checkbox('给每个模拟器设计 4-6 个故事化情景模板'));
body.push(checkbox('整理好章节地图(章节号 / 大部分 / 章名 / 摘要 / 反预期)'));

body.push(h3('Phase 1 · 控制台(纯人工,10 分钟)'));
body.push(checkbox('Luffa Cloud 控制台注册 → 创建小程序 → 复制保存 AppID'));

body.push(h3('Phase 2 · 项目脚手架(AI 主导,你审查,30 分钟)'));
body.push(checkbox('让 AI 生成项目目录 + 三个配置文件'));
body.push(checkbox('把 AppID 填到 IDE 配置文件'));
body.push(checkbox('在 Luffa Cloud-Devtools 里能打开项目并看到空首页'));

body.push(h3('Phase 3 · 数学和数据(AI 写代码 + 你验证,1-2 小时)'));
body.push(checkbox('让 AI 把数学写成纯函数,带「周期阶段感知」'));
body.push(checkbox('自己在命令行跑教材标准题,确认数学精确正确'));
body.push(checkbox('把 Phase 0 的章节数据 + 情景模板填到 data 目录'));

body.push(h3('Phase 4 · 页面(AI 主导,3-5 小时)'));
body.push(checkbox('三个模拟器页 —— 六段式骨架 + 实时计算 + 动态 insight'));
body.push(checkbox('章节详情页 —— 反预期 + 判断题 + 联动模拟器按钮'));
body.push(checkbox('首页 —— 章节列表 + (可选)实时数据卡片'));
body.push(checkbox('反预期总览页'));

body.push(h3('Phase 5 · 实时数据(可选,30-60 分钟)'));
body.push(checkbox('申请外部 API key'));
body.push(checkbox('让 AI 写代理函数'));
body.push(checkbox('项目 push 到 GitHub'));
body.push(checkbox('在 Vercel 导入仓库,配 env,Deploy'));
body.push(checkbox('浏览器访问代理 URL 验证返回 JSON'));
body.push(checkbox('把 Vercel URL 填到小程序代码,git push'));

body.push(h3('Phase 6 · 部署到 Luffa(必须人工,30 分钟)'));
body.push(checkbox('Luffa 控制台 → request 合法域名加上 Vercel URL,等 1 分钟'));
body.push(checkbox('Luffa Cloud-Devtools 里预览 → 真机扫码过一遍核心路径'));
body.push(checkbox('检查包体小于 2 MB'));
body.push(checkbox('上传(版本号 + 更新说明)'));

body.push(h3('Phase 7 · 审核 + 发布(你 + Luffa,1-3 工作日)'));
body.push(checkbox('在控制台填功能分类 + 隐私合规 + 金融建议免责'));
body.push(checkbox('提交审核'));
body.push(checkbox('审核通过后点发布'));
body.push(checkbox('用二维码在真机扫开,发给朋友试玩'));

// ============ APPENDIX E ============
body.push(h1Break('附录 E · 本指南覆盖的真实项目'));
body.push(pStr('本指南完全基于《金融周期》互动小程序的实际构建经验:'));
body.push(p([
  bold('项目源码:'),
  txt(' '),
  new ExternalHyperlink({
    children: [new TextRun({ text: 'github.com/ViviennaMAO/FinancialCycle', style: 'Hyperlink', font: FONT })],
    link: 'https://github.com/ViviennaMAO/FinancialCycle'
  })
]));
body.push(p([
  bold('实时数据代理:'),
  txt(' '),
  new ExternalHyperlink({
    children: [new TextRun({ text: 'financial-cycle.vercel.app/api/fred', style: 'Hyperlink', font: FONT })],
    link: 'https://financial-cycle.vercel.app/api/fred'
  })
]));
body.push(bullet([bold('包体'), txt(':约 200 KB / 40 个文件')]));
body.push(bullet([bold('总时长'), txt(':从读完书到上传 IDE 约 8-12 小时')]));
body.push(p([txt('如果你想看具体的实现细节(代码、配置、文件结构),直接打开 GitHub 仓库浏览。这份指南的目的不是「教你抄代码」,而是教你'), bold('判断 AI 给的代码对不对'), txt('、'), bold('记住哪些环节必须自己做'), txt('。')]));

// ============ 心法 ============
body.push(h1Break('心法 · 五条'));
body.push(numbered([bold('互动书的核心不是「小屏幕上的书」,是「能动手玩的概念」'), txt('。如果你只是把书的文字搬上小程序,你浪费了 90% 的潜力。')]));
body.push(numbered([bold('反预期 ≠ 噱头'), txt('。每一条「违反直觉」都要有书里的具体数据 / 案例支撑,否则就是震惊式标题党。读者会一眼看穿。')]));
body.push(numbered([bold('数学一定先在 Node 里测过再放上线'), txt('。AI 生成的数学代码即使语法没错,也可能微妙地错 —— 而错的数学会在用户那里永远错下去。')]));
body.push(numbered([bold('API key 永远不进小程序包'), txt('。这一条没有「通融」的余地。所有外部 API 走代理,代理在云端持 key,小程序看不到。')]));
body.push(numbered([bold('少即是多'), txt('。5 个 tabBar、< 500 KB 包体、< 2000 行代码,是 SuperBox 的甜区。功能多不等于体验好,克制是这种轻量平台上最重要的产品智慧。')]));

// ============ 最后的话 ============
body.push(divider());
body.push(callout([
  bold('最后的话'),
  txt(':这个时代,AI Coder 把「写代码」这件事的成本压得极低 —— 一个原本要团队两周才能做出来的小程序,现在你一个人 12 小时能完成。')
]));
body.push(callout([
  txt('但 '),
  bold('「做什么」的问题 AI 替你不了'),
  txt('。这也是为什么 Phase 0 是整个流程里 AI 含量最低,却是最值钱的一步。')
]));
body.push(callout([
  txt('把这条规律记住,你就掌握了用 AI 做产品的核心:'),
  bold('AI 解决执行,你解决判断'),
  txt('。')
]));
body.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [txt('— 文档结束 —', { color: MUTED, italics: true })],
  spacing: { before: 240 }
}));

// ─── document ───────────────────────────────────────────────────────────

const doc = new Document({
  creator: 'Claude (for Vivienna MAO)',
  title: '在 Luffa SuperBox 上做一本「互动书」 · 详尽操作指南',
  styles: {
    default: { document: { run: { font: FONT, size: 22 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 36, bold: true, font: FONT, color: ACCENT },
        paragraph: { spacing: { before: 320, after: 220 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 28, bold: true, font: FONT, color: ACCENT },
        paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 24, bold: true, font: FONT },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 } }
    ]
  },
  numbering: {
    config: [
      { reference: 'bullets', levels: [{
        level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } }
      }]},
      { reference: 'nums', levels: [{
        level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } }
      }]}
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
