# 金融周期 · 互动小程序 (Luffa SuperBox)

把 Peter Oppenheimer《金融周期》(The Long Good Buy)做成可交互的学习应用。
3 个核心模拟器 + 11 章反预期事件 + 答题反馈。

## 项目结构

```
miniprogram/
├── project.config.json       # IDE 配置 · LuffaToolsappid 已填
├── app.json                  # 5 个 tabBar + 章节子页
├── app.js                    # 全局状态 + Luffa 语言探测 + 进度持久化
├── app.wxss                  # 全局样式 (深色 + 金色高亮)
├── sitemap.json
├── utils/
│   ├── luffa.js              # wx.invokeNativePlugin 的 Promise 桥接
│   ├── finance.js            # NPV / IRR / WACC + CAPM + 4 阶段折现率
│   ├── cache.js              # wx.storage 上的 TTL 缓存
│   └── fred.js               # FRED 实时利率/失业率/CPI 客户端 (调代理)
├── data/
│   └── chapters.js           # 11 章数据 (反预期事件 + 判断题 + 解释)
└── pages/
    ├── index/                # 目录 + FRED 实时面板 (tabBar)
    ├── npv/                  # NPV 模拟器 · 含 FRED 同步 (tabBar)
    ├── irr/                  # IRR 模拟器 (tabBar)
    ├── wacc/                 # WACC 模拟器 · 含 FRED 同步 (tabBar)
    ├── twist/                # 11 个反预期速览 (tabBar)
    └── chapter/              # 章节详情 (子页面)

../cloudflare-worker/
├── fred-proxy.js             # 单文件 Cloudflare Worker · 持 FRED key
└── README.md                 # 5 分钟部署指南
```

## 内容设计 — 三件套与本书的对应关系

| 模拟器 | 本书核心章节 | 交互核心 |
|---|---|---|
| **NPV** | 第三/四章 (四阶段、表 4.1) | 同一现金流,在绝望/希望/增长/乐观 4 个折现率下的 NPV 翻转 |
| **IRR** | 第二/五章 (风格切换、长期回报) | IRR vs 4 个阶段下的 "市场要求回报",超额 alpha 来源 |
| **WACC** | 第九/十章 (后 QE 周期、零利率) | 拖动 Rf 从 8% (1980s) → 0% (2020s),看 WACC 与估值如何被重塑 |

## 11 章的反预期事件 (每章一条)

| 章 | 反预期 hook |
|---|---|
| 1 | 经济增长越好 ≠ 股市越好 (股市领先 6 个月) |
| 2 | 股息长期占总回报 50%+,不是"小头" |
| 3 | 经济最差的"希望期"年化 +69%,远超牛市顶 |
| 4 | 加息周期股市平均仍涨 9% (表 4.2) |
| 5 | 成长股不总跑赢价值股 — 利率拐点是分水岭 |
| 6 | 结构性熊市 -57% / 10 年回前高,远比周期性熊市残酷 |
| 7 | 超级周期牛市 13–18 年,周期性牛市 2–4 年 — 不要混为一谈 |
| 8 | 漂亮 50 在 90× PE 后跌 -80%+,但"贵"不是充分条件 |
| 9 | QE 没有引发通胀,反而通胀消失 |
| 10 | 低利率 ≠ 高估值 — 看 Rf 下行的原因 |
| 11 | 1970s 科技龙头大部分再也没回到高点 |

所有事实/数据均来自本书 (中信出版集团版),核心引用包括:
表 4.1 (各阶段年化回报)、表 4.2 (加息期股市)、表 6.4/6.5 (熊市分类)、第八章漂亮 50 PE 数据。

---

# 部署到 Luffa SuperBox · 6 阶段流程

## ✅ Phase 1 — 控制台注册 & 创建小程序

> 现在必须做的第一步,没 AppID 后面所有上传都做不了。

1. 打开 Luffa Cloud 开发者控制台,右上"註冊帳號"
2. 登录后"創建⼩程序",填:
   - 小程序名:`金融周期 · 互动学习`
   - 分类:教育 / 工具
   - 描述:把高盛策略师 Oppenheimer《金融周期》做成 NPV/IRR/WACC 模拟器 + 11 章反预期事件
   - 图标:见下方"图标"小节
3. 控制台会发一个 AppID,形如 `mpxxxxxxxxxxxxxx`
4. **把 AppID 填到 `project.config.json` 的 `TCMPPappid` 字段**(现在是占位 `REPLACE_WITH_YOUR_APPID`)
5. **配置 request 合法域名**(只有在你已经按下方"FRED 集成"流程部署 Worker 后才需要):
   - 你部署的 Cloudflare Worker URL,形如 `https://fred-proxy.xxx.workers.dev`
   - **不要**直接白名单 `https://api.stlouisfed.org`,API key 不能直接进小程序。

## ✅ Phase 2 — 本地项目已就位

项目已用原生 WXML/WXSS/JS 搭好(非 Taro/React,以保持 < 1 MB 包体)。

打开 Luffa Cloud-Devtools → "打开项目" → 选这个 `miniprogram/` 目录 → 选 AppID。
看到模拟器渲染出深蓝 + 金色的"金融周期"首页即 Phase 2 通过。

## ✅ Phase 3 — Luffa 原生桥接

`utils/luffa.js` 已封装 `wx.invokeNativePlugin → luffaWebRequest` 的 Promise 调用。
`app.js` 在 `onLaunch` 时探测 Luffa 用户语言(供以后做 zh/en 双语用)。

当前 MVP 是**纯内容应用**,不需要钱包,因此没有调用 `connect` / `signMessageV2`。
未来如果要加:
- "完成 11 章答题领 NFT 徽章" → 接 `signAndSubmitTransaction` (Endless Move 合约)
- "分享某章反预期到 Luffa 群聊" → 调 `share`
- 直接调用模板:打开 [templates/utils/endless-wallet.js](../../.claude/skills/luffa-superbox-deploy/templates/utils/endless-wallet.js) 抄过来即可。

## ⏭️ Phase 4 — 链 SDK (本期跳过)

不是 dApp,无需安装 `@luffalab/luffa-endless-sdk` 或 `@luffalab/luffa-evm-sdk`。

## ✅ Phase 5 — 上传

1. 在 Luffa Cloud-Devtools 里:
   - 点 **預覽** 用真机扫码体验一遍
   - 重点测试:
     - 首页 11 个章节卡片是否都能点开
     - NPV 页切换"情景模板"后表格是否实时更新
     - WACC 页拖动 Rf 滑块 → WACC 数字是否跟着变
     - 章节详情页选错答案是否变红、选对是否变绿
     - tabBar 5 个 tab 切换无白屏
2. 检查包体:`du -sh miniprogram/` 应 < 500 KB(此项目无图无字体,极轻)
3. 点 **上傳** → 输入版本号 (建议 `1.0.0`) → 写更新日志("首发:3 模拟器 + 11 章反预期")

## ✅ Phase 6 — 提交审核

1. 控制台 → 版本管理 → 找到刚上传的开发版本 → "提交审核"
2. 填:
   - 功能分类:**教育** / 工具
   - 测试账号:**不需要**(无登录)
   - 隐私合规:本 MVP **不收集任何用户数据**,只在本地缓存答题进度;
     无需 KYC,无金融交易行为。
3. 等 1–3 个工作日,审核通过后点 **發布**

---

## 包体优化清单

✅ 无第三方 npm 包  
✅ 无图片/字体资源  
✅ 无 lodash / moment / chart.js  
✅ 5 个 tabBar 但不加 iconPath,纯文字
✅ 所有数学都用 `Math.*`,IRR 二分兜底,无外部依赖  

预估上传后包体: **~50 KB**(远低于 SuperBox 2MB 限制)

## 常见问题

- **`wx.invokeNativePlugin is undefined`** — 你不是在 Luffa Cloud-Devtools 或真机里跑。
  这是预期行为,`utils/luffa.js` 已做 try/catch,功能在非 Luffa 环境下会安全降级。
- **审核打回"金融建议"** — 本 app 是**教育/书籍互动工具**,不做投顾。
  在描述里强调"基于公开出版的 Oppenheimer《金融周期》一书的互动学习,不构成投资建议"。
- **数字键盘输入负号** — Y0 初始投资可以输入负号,小程序原生 `type=digit` 支持。
  如果发现真机不允许负号,改用 `type=text` 然后在 onCfChange 中校验。

## FRED 实时数据集成 ✅

> 这是已经接好的能力,不是"todo"。但你需要花 ~5 分钟把代理部署一下。

### 它做什么

- **首页 · 周期定位仪表盘**:实时显示 10Y / 2Y / 利差 / 联邦基金利率 / 失业率 / CPI 同比;
  10Y-2Y 倒挂时自动弹"熊市预警"卡片(本书第六章 6 维指标之一)。
- **NPV 页 · 📡 用实时 10Y 按钮**:一键把基础折现率设为"当前 10Y 国债 + 4% ERP"。
- **WACC 页 · 📡 FRED 按钮**:一键把 Rf 滑块同步到当前 10Y 收益率。
- **本地 12h 缓存**:同一序列 12 小时内不重复请求,完全离线可用。

### 为什么需要 Worker 代理

- Skill 红线:**API key 永远不能进小程序包**。代理在 Cloudflare Workers 上持 key,小程序只调代理。
- Cloudflare Workers 免费层 = 每天 10 万请求,12h 缓存下完全用不完。

### 部署步骤(把这些当 Phase 1.5 做)

完整指南: [../cloudflare-worker/README.md](../cloudflare-worker/README.md)

简版:

```bash
# 1. 申请免费 FRED key (32 位): https://fred.stlouisfed.org/docs/api/api_key.html
# 2. 部署 worker
npm i -g wrangler && wrangler login
mkdir fred-proxy-deploy && cd fred-proxy-deploy
wrangler init -y
cp ../cloudflare-worker/fred-proxy.js src/index.js
wrangler secret put FRED_API_KEY    # 粘贴你的 key
wrangler deploy                      # 输出 URL,形如 https://fred-proxy.xxx.workers.dev
```

部署完成后:

1. 打开 [utils/fred.js](utils/fred.js),把第 13 行的 `PROXY_BASE` 改成你的 Worker URL。
2. 打开 Luffa Cloud 控制台 → 你的小程序 → 开发设置 → request 合法域名 → 添加同一 URL → 等 1 分钟生效。
3. 在 IDE 里点"預覽",首页应该看到 FRED 卡片渲染出 6 个实时指标。

### 验证

部署后浏览器直接打开应能看到 JSON:

```
https://fred-proxy.xxx.workers.dev/?series=DGS10
```

如果不部署也没关系:首页 FRED 卡片会优雅降级,显示"未配置 FRED 代理"提示,
其他所有模拟器照样工作。

## 后续可拓展方向

1. **NFT 徽章** — 11 章答对超 9 题,接 Endless 链 mint "Long Good Buy Reader" 徽章
2. **Luffa 群分享** — 每章反预期 hook 一键分享到 Luffa 群,带原书引用
3. **中英双语** — `app.js` 已经探测了 `language`,只需要给 `chapters.js` 加 `_en` 字段
4. **可视化图表** — 用 wx canvas-2d 绘制 4 阶段回报柱状图(表 4.1 真实数据)
5. **历史回放** — 用 FRED 历史数据让用户"重新经历" 2008 / 2020 周期,看模拟器示数如何变

—— 数据 / 引用来源:Peter C. Oppenheimer (2020). The Long Good Buy. Wiley. 中信出版集团中文版。
