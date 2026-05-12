# FRED Proxy · Cloudflare Worker

为什么:Luffa SuperBox 包内不能放 FRED API key(skill 红线 + 控制台域名白名单只放 HTTPS 公开域)。
所以加一层"边缘代理":你的小程序 → 你的 Worker → FRED API。

代理只暴露**白名单内的 series**,并在边缘缓存 1 小时,节省 FRED 配额。

## 一次性部署 (≈ 5 分钟)

### 1. 申请 FRED API key (免费, 即时)

https://fred.stlouisfed.org/docs/api/api_key.html → 注册 → 拿到 32 位 key

### 2. 安装 Wrangler

```bash
npm i -g wrangler
wrangler login        # 浏览器登录你的 Cloudflare 账号
```

如果没有 Cloudflare 账号:免费注册 https://dash.cloudflare.com/sign-up — 不需要绑卡。

### 3. 初始化 worker 项目

```bash
mkdir fred-proxy-deploy && cd fred-proxy-deploy
wrangler init -y           # 创建 wrangler.toml + src/index.js 骨架
```

把本目录的 [fred-proxy.js](fred-proxy.js) 复制为 `src/index.js`:

```bash
cp /Users/vivienna/Desktop/VibeCoding/金融周期/cloudflare-worker/fred-proxy.js src/index.js
```

### 4. 注入 FRED key (永远不会进入 Git / 包体)

```bash
wrangler secret put FRED_API_KEY
# 粘贴你刚才在第 1 步拿到的 key,回车
```

### 5. 部署

```bash
wrangler deploy
```

输出会显示一个 URL,比如:

```
https://fred-proxy.YOUR_SUBDOMAIN.workers.dev
```

### 6. 接回小程序

打开 [miniprogram/utils/fred.js](../miniprogram/utils/fred.js),改这一行:

```js
const PROXY_BASE = 'https://fred-proxy.YOUR_SUBDOMAIN.workers.dev';
```

### 7. 把这个 URL 加进 Luffa 控制台白名单

Luffa Cloud 开发者控制台 → 你的小程序 → 开发设置 → **request 合法域名** → 加上:

```
https://fred-proxy.YOUR_SUBDOMAIN.workers.dev
```

要等约 1 分钟控制台缓存刷新。

## 测试代理

部署后直接浏览器打开应能看到 JSON:

```
https://fred-proxy.YOUR_SUBDOMAIN.workers.dev/?series=DGS10
```

预期返回 (节选):

```json
{
  "observations": [
    { "date": "2025-XX-XX", "value": "4.32" },
    { "date": "2025-XX-XX", "value": "4.31" }
  ]
}
```

## Worker 行为速览

| 行为 | 实现 |
|---|---|
| API key 隔离 | `env.FRED_API_KEY` (`wrangler secret`),不出现在源码或日志 |
| series 白名单 | 10 个常用宏观/利率序列,其他一律拒绝 |
| 限流 | 由 Cloudflare 免费层提供默认 |
| 缓存 | `cf.cacheTtl=3600`,边缘缓存 1h |
| CORS | 全开(小程序请求不带 origin,可全开) |

## 白名单已包含的序列

| ID | 含义 |
|---|---|
| DGS10 | 10Y 美债收益率 (日频) |
| DGS2 | 2Y 美债收益率 |
| T10Y2Y | 10Y-2Y 利差(<0 = 倒挂,衰退预警) |
| DFF | 联邦基金有效利率 (日频) |
| FEDFUNDS | 联邦基金利率 (月度均值) |
| UNRATE | 失业率 |
| CPIAUCSL | CPI 全城市消费者 |
| GS10 | 10Y 月度均值 |
| CIVPART | 劳动参与率 |
| PAYEMS | 非农就业 |

要加新 series 就改 [fred-proxy.js](fred-proxy.js) 的 `ALLOWED_SERIES`,再 `wrangler deploy` 即可。

## 成本

Cloudflare Workers Free 层:每天 10 万次请求免费。小程序 + 12h 本地缓存,基本永远到不了。
FRED 本身免费,每个 key 上限 120 req/min(代理 + 边缘缓存后基本零负载到 FRED)。
