# 金融周期 · 互动学习小程序 + FRED 实时利率代理

把 Peter Oppenheimer《金融周期》(The Long Good Buy)做成 Luffa SuperBox 小程序。
3 个核心模拟器 (NPV / IRR / WACC) + 11 章反预期事件 + 6 个 FRED 实时宏观指标。

## 目录结构

```
.
├── miniprogram/          ← Luffa SuperBox 小程序 (原生 WXML/JS,无依赖)
├── api/                  ← Vercel serverless function (FRED 代理)
│   └── fred.js
├── cloudflare-worker/    ← (备选) Cloudflare Worker 版代理
│   ├── fred-proxy.js
│   └── README.md
├── .gitignore
└── README.md
```

## 两个代理选项 (二选一)

### A. Vercel (推荐:本仓库默认路径)

→ push 此仓库到 GitHub → Vercel 自动识别 `api/fred.js` 为 serverless 函数。
→ 在 Vercel 项目设置里加环境变量 `FRED_API_KEY`。
→ 函数 URL 自动生成为 `https://<your-project>.vercel.app/api/fred`。

### B. Cloudflare Workers (备选)

→ 详见 [cloudflare-worker/README.md](cloudflare-worker/README.md)。
→ 适合不想用 Vercel 的场景。

两种代理的小程序端代码**完全兼容**,只需要在 [miniprogram/utils/fred.js](miniprogram/utils/fred.js#L14) 的 `PROXY_BASE` 改一个 URL。

## 部署到 Vercel · 4 步

> 前提:你已经把 FRED key 准备好。

### 1. 推送到 GitHub

详见下方"Git push" 部分。

### 2. 在 Vercel 导入仓库

1. 打开 https://vercel.com → 用 GitHub 登录
2. "Add New… → Project" → 选刚 push 的仓库
3. 配置:
   - Framework Preset:**Other**
   - Root Directory:**保留默认** (项目根)
   - Build Command:留空
   - Output Directory:留空
4. **不要立即 Deploy** — 先到下一步加环境变量

### 3. 加环境变量

项目 Settings → Environment Variables → 添加:

| Name | Value | Environment |
|---|---|---|
| `FRED_API_KEY` | 你的 32 位 FRED key | Production + Preview + Development |

### 4. Deploy

回到 Deployments → 点 Redeploy(或回 Overview → Deploy)。
完成后给你一个 URL,形如 `https://your-project.vercel.app`。

**验证**:浏览器直接访问 `https://your-project.vercel.app/api/fred?series=DGS10`,
应该返回 JSON 含 `observations` 数组。

### 5. 接回小程序 + 控制台白名单

打开 [miniprogram/utils/fred.js](miniprogram/utils/fred.js#L14):

```js
const PROXY_BASE = 'https://your-project.vercel.app/api/fred';
```

Luffa Cloud 开发者控制台 → 你的小程序 → 开发设置 → **request 合法域名** → 添加:

```
https://your-project.vercel.app
```

等 1 分钟生效,在 Luffa Cloud-Devtools 里重新编译 → 首页应渲染出 6 个 FRED 实时指标。

## Git push 到 GitHub (一次性)

仓库已经在本地用 `git init` 初始化并完成首次 commit。你只需要把 remote 配上并 push:

```bash
cd ~/Desktop/VibeCoding/金融周期

# 把 <YOUR_REPO_URL> 替换成你 GitHub 仓库的地址
# 例如 https://github.com/yourname/financial-cycle.git
git remote add origin <YOUR_REPO_URL>
git branch -M main
git push -u origin main
```

之后任何改动都是标准流程:

```bash
git add -A
git commit -m "..."
git push
```

每次 push 到 main 分支,Vercel 都会自动重新部署函数。

## 安全提醒

- **永远不要** commit `.env` 或硬编码 FRED key 到任何文件。`.gitignore` 已经覆盖 `.env*`。
- `FRED_API_KEY` 只活在 Vercel 的环境变量存储里,代码里只用 `process.env.FRED_API_KEY` 读取。
- `api/fred.js` 内置 **series 白名单**(10 个常用宏观序列),拒绝其他请求 — 即使代理 URL 泄露也无法滥用。
