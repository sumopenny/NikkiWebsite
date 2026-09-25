# 部署到 GitHub Pages（GitHub Actions 自动构建）

本文记录**暖立方 Nikki³ 官网**如何用 GitHub Actions 自动构建并发布到 GitHub Pages。

一句话原理：**本地不再手动构建、不再手动传文件**——你只需要 `git push`，GitHub 的服务器会自动 `npm ci` → `npm run build` → 把 `dist/` 发布上线。

- 仓库：`https://github.com/sumopenny/NikkiWebsite`
- 线上地址：**`https://sumopenny.github.io/NikkiWebsite/`**
- 触发方式：推送到 `main` 分支，或在 Actions 页面手动运行（`workflow_dispatch`）

---

## 一、先理解关键前提：子路径

这是整套配置里**唯一一个真正容易踩死人的点**，先讲清楚。

GitHub Pages 给「项目仓库」分配的地址**不是**域名根路径，而是带仓库名的子路径：

| 部署方式 | 站点地址 | 资源真实位置 |
|---|---|---|
| GitHub Pages（项目仓库） | `https://sumopenny.github.io/NikkiWebsite/` | `https://sumopenny.github.io/NikkiWebsite/images/1.jpeg` |
| 自定义域名 / 用户主页仓库 | `https://example.com/` | `https://example.com/images/1.jpeg` |

问题在于：如果代码里写死了 `/images/1.jpeg` 这种**根绝对路径**，浏览器会去请求 `https://sumopenny.github.io/images/1.jpeg` —— **少了一层 `/NikkiWebsite`，全部 404**。

典型症状：HTML/JS/CSS 能加载（因为 Vite 会自动给它们加前缀），但**首屏美照、画廊、应用截图全是空白**。这个症状很有迷惑性，容易误判成图片丢失。

所以要做两件事：**① 构建时带上 base 前缀；② 运行时拼接素材路径也用同一个前缀。**

---

## 二、本地代码改动（已完成，共 3 个文件）

> 这一节说明「为什么这么改」，方便你日后改坏了能自己查回来。**这些改动我已经改完了**，你只需要照第三节提交。

### 1. `vite.config.ts` —— 让构建带上 base 前缀

```ts
const BUILD_BASE = '/NikkiWebsite/'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? BUILD_BASE : '/',
  // ...
}))
```

注意这里用了 `command === 'build'` 做区分，**不是**简单地写 `base: '/NikkiWebsite/'`：

- **构建时**用 `/NikkiWebsite/` —— 产物可以直接丢给 GitHub Pages；
- **开发时**（`vite dev`）仍用 `/` —— 因为 `Start-Website.bat` 写死了打开 `http://localhost:5180`，
  如果开发也带前缀，本地启动脚本打开的地址就会变成 404。

**绑定自定义域名后怎么办**：把 `BUILD_BASE` 改成 `'/'` 即可（那时站点挂在域名根路径）。

### 2. `src/App.vue` —— 运行时素材路径跟着 BASE_URL 走

改动前（写死根路径，子路径部署下必挂）：

```ts
const assetPath = (file: string): string => `/images/${file}`
```

改动后：

```ts
const assetPath = (file: string): string => `${import.meta.env.BASE_URL}images/${file}`
const faviconUrl = `${import.meta.env.BASE_URL}favicon.ico`
```

`import.meta.env.BASE_URL` 由 Vite 在构建时替换为上面配置的 base，**开发环境是 `/`、构建产物是 `/NikkiWebsite/`**，一套代码两边都对。首屏轮播、画廊、应用截图全部走 `assetPath()`，所以一处改动全覆盖。

同时页头/页脚的品牌图标也一起改了：`<img src="/favicon.ico">` → `<img :src="faviconUrl">`。

> 为什么要手动改这一处？因为 Vue 模板里的**根绝对路径不会被 Vite 自动改写**（`index.html` 里的 `<link rel="icon">` 会，模板里的不会）。两个位置行为不一致，这点必须记住。

### 3. `src/vite-env.d.ts` —— 补上 Vite 的类型声明（新增文件）

```
/// <reference types="vite/client" />
```

原本项目没有这个文件，导致 `import.meta.env` 报 `TS2339: Property 'env' does not exist on type 'ImportMeta'`，构建直接失败。这是 Vite 官方标准声明文件，**新建项目时本来就该有**。

---

## 三、添加工作流文件（已完成）

文件位置：**`.github/workflows/deploy.yml`**（路径一个字都不能错，GitHub 只认这个目录）。

拆解一下每一段在干什么：

### 1) 触发条件

```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:
```

- `push` 到 `main` 自动跑（日常改完推上去就自动上线）；
- `workflow_dispatch` 让你能在 GitHub 网页上手动点「Run workflow」跑一次，调试用。

### 2) 权限声明（**最容易漏、漏了就失败**）

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

GitHub Actions 默认给的 `GITHUB_TOKEN` 权限很窄。这三个必须显式声明：

| 权限 | 作用 | 漏了会怎样 |
|---|---|---|
| `contents: read` | 允许 checkout 拉代码 | 拉不到代码 |
| `pages: write` | 允许写入 Pages | `deploy-pages` 报权限不足 |
| `id-token: write` | 允许用 OIDC 令牌向 Pages 证明身份 | 部署校验失败 |

### 3) 并发控制

```yaml
concurrency:
  group: pages
  cancel-in-progress: false
```

同一时刻只跑一个部署。这里**故意设成 `false`**：允许新任务排队等待，而不是打断正在进行的部署——否则可能发布到一半被掐断，线上留下半成品。

### 4) build 任务

```yaml
- uses: actions/checkout@v4
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: npm
- run: npm ci
- run: npm run build
- uses: actions/configure-pages@v5
- uses: actions/upload-pages-artifact@v3
  with:
    path: dist
```

几个要点：

- **`npm ci` 而不是 `npm install`**：严格按 `package-lock.json` 还原依赖，保证 CI 环境和你本地完全一致。所以 `package-lock.json` **必须提交进仓库**（本项目已提交）。
- **`npm run build` 已包含类型检查**（`package.json` 里是 `vue-tsc --noEmit && vite build`）。也就是说**类型检查不过，部署就会失败** —— 这是好事，等于每次发布前强制做一次类型体检。
- **`path: dist`**：GitHub Pages 部署要求「只上传一个目录」，且上传的必须是**目录**不是文件。

### 5) deploy 任务

```yaml
deploy:
  needs: build
  runs-on: ubuntu-latest
  environment:
    name: github-pages
    url: ${{ steps.deployment.outputs.page_url }}
  steps:
    - uses: actions/deploy-pages@v4
```

- `needs: build` —— 构建成功才发布；
- `environment: github-pages` —— 绑定 GitHub 的 Pages 环境，部署完在 Actions 摘要页会显示可点击的线上地址。

---

## 四、到 GitHub 网页开启 Pages（**唯一必须手动做的一步**）

工作流文件本身**不会自动开启 Pages**，必须去仓库设置里打开一次开关：

1. 打开 `https://github.com/sumopenny/NikkiWebsite`
2. 点上方 **Settings**（仓库设置，不是账号设置）
3. 左侧栏找到 **Pages**
4. **Build and deployment** → **Source** 下拉框 → 选 **`GitHub Actions`**
   ⚠️ 不要选 `Deploy from a branch`，那是旧的另一套流程，会和本工作流冲突
5. 不用填别的，直接离开即可（本方案不需要指定分支/目录）

> **私有仓库注意**：Pages 在私有仓库上需要 GitHub Pro / Team / Enterprise 才能用。如果这个仓库是私有的且没有付费计划，请先把仓库设为 Public，否则 Pages 选项可能不可用。

---

## 五、提交并推送

```bash
cd D:\DESKTOPPPPPPP\NikkiWebsite
git add .
git commit -m "ci: 添加 GitHub Actions 自动部署到 GitHub Pages（含子路径 base 适配）"
git push origin main
```

推送完，Actions 就会自动开始跑。

---

## 六、查看部署结果

1. 打开仓库页 → **Actions** 标签页
2. 左侧选 **Deploy to GitHub Pages**，看到最新一条运行记录
3. 点进去，能看到 `build` 和 `deploy` 两个任务依次跑完

一次完整运行大约 **1–2 分钟**：

| 阶段 | 大致耗时 | 说明 |
|---|---|---|
| 安装依赖 `npm ci` | 20–40s | 首次较慢，之后有缓存会明显加快 |
| 构建 `npm run build` | 15–30s | 含 `vue-tsc` 类型检查 |
| 上传 + 发布 | 15–30s | |

4. 全部完成后，点运行记录里的 **`github-pages`** 环境链接，或直接访问：

   **`https://sumopenny.github.io/NikkiWebsite/`**

   第一次发布可能需要等 1–2 分钟 CDN 生效。

---

## 七、日常更新流程

配置好之后，往后**只需要推代码**：

```bash
git add .
git commit -m "更新文案"
git push origin main
```

剩下的全自动。想在不改代码的情况下重跑一次部署：Actions → 选 **Deploy to GitHub Pages** → 右侧 **Run workflow** → 选 `main` 分支 → **Run workflow**。

---

## 八、本地自测（发布前先验一遍子路径，强烈建议）

因为**根路径下测试永远通过**（`/images/1.jpeg` 挂在根路径服务器上是对的），必须用**带 `/NikkiWebsite` 前缀的服务器**才能验出问题。项目里准备了两个脚本：

```bash
# 1) 先构建（产物默认在 dist/，也可指定别的目录）
npm run build

# 2) 启动一个模拟 GitHub Pages 子路径的静态服务
SERVE_DIR=dist PORT=4189 node .verify/ghpages-server.cjs
#    → http://127.0.0.1:4189/NikkiWebsite/

# 3) 另开一个终端，用真实浏览器跑一遍检查
node .verify/ghpages-check.mjs
```

`ghpages-check.mjs` 会输出一份 JSON 报告，重点看这几个字段：

| 字段 | 期望值 | 含义 |
|---|---|---|
| `httpErrors` | `[]` | 没有 4xx/5xx 请求 |
| `pageErrors` | `[]` | 没有 JS 运行时报错 |
| `failedImages` | `[]` | 每张图 `naturalWidth > 0`（真的解码成功，不是「请求成功率」的假象） |
| `allSrcsPrefixed` | `true` | 所有 `src` 都带 `/NikkiWebsite` 前缀 |
| `heroSrcs` / `darkHeroSrcs` | 非空 | 浅色与深色两组首屏图都能取到 |

**本次实测结果（改动后、发布前）：**

```json
{
  "httpErrors": [],
  "pageErrors": [],
  "totalImages": 21,
  "loadedImages": 21,
  "failedImages": [],
  "allSrcsPrefixed": true,
  "heroSrcs": ["/NikkiWebsite/images/2.jpeg", "/NikkiWebsite/images/3.jpeg", "/NikkiWebsite/images/4.jpeg"],
  "darkHeroSrcs": ["/NikkiWebsite/images/11.jpeg", "/NikkiWebsite/images/12.jpeg",
                   "/NikkiWebsite/images/13.jpeg", "/NikkiWebsite/images/14.jpeg"]
}
```

21 张图全部加载成功、零请求失败、零脚本报错。脚本还会在 `.verify/` 下留两张截图（`ghpages-light.png` / `ghpages-dark.png`）供肉眼比对。

> 补充：`PREFIX=/ node .verify/ghpages-server.cjs` 可以模拟「自定义域名（根路径）」的情况，
> 用来验证改回 `base: '/'` 之后是否依然正常。

---

## 九、常见故障排查

### 1. Actions 报 `Get Pages site failed` / `Not Found`

**原因**：Pages 还没开启，或 Source 没选 `GitHub Actions`。
**解决**：回到第 **四** 节，把 Source 选成 `GitHub Actions`，然后重跑工作流。

### 2. 页面能打开，但所有图片都是空白

**原因**：base 前缀没生效（多半是 `vite.config.ts` 的 `base` 被改动过，或素材路径又写回了 `/images/...`）。
**排查**：打开浏览器开发者工具 → Network，看图片请求的完整 URL。如果请求到了 `https://sumopenny.github.io/images/1.jpeg`（**缺 `/NikkiWebsite`**），就是这个问题。
**解决**：确认 `vite.config.ts` 的 `BUILD_BASE` 是 `'/NikkiWebsite/'`，并确认 `App.vue` 里用的是 `import.meta.env.BASE_URL` 而不是写死的 `/images/`。

### 3. 页面完全白屏

**原因**：JS/CSS 的路径也错了，通常是 `base` 配错。
**排查**：开发者工具的 Console 会有一堆 `404` + `Failed to load module script`。
**解决**：同上。也可以 `Ctrl+U` 查看源码，确认 `<script src="...">` 是否带 `/NikkiWebsite/` 前缀。

### 4. 构建失败，报 `TS6133: 'xxx' is declared but its value is never read`

**原因**：`tsconfig.json` 开了 `noUnusedLocals`，删函数/变量时留下了未清理的引用。
**解决**：把没用的变量删干净。这也是 `npm run build` 会跑 `vue-tsc` 的价值——本地过不去，推上去也一定过不去。

### 5. `npm ci` 失败，报 lock 不同步

**原因**：改了 `package.json` 但没更新 `package-lock.json`。
**解决**：本地执行一次 `npm install`（会自动同步 lock 文件），把 `package-lock.json` 一起提交。

### 6. `deploy` 报 `Creating Pages deployment failed` / `Pages is not enabled for this repository`

**原因**：私有仓库 + 免费账号，Pages 不可用。
**解决**：把仓库改为 Public，或升级付费计划。

### 7. 工作流在 Actions 里根本找不到

**原因**：`.github/workflows/` 目录路径写错，或工作流文件还在本地没推上去。另外**首次添加工作流后，需要在 Actions 页面确认启用**（GitHub 对首次出现的 workflow 有时会提示 "I understand my workflows, go ahead and enable them"）。

---

## 十、绑定自定义域名（可选）

1. 在仓库 **Settings → Pages → Custom domain** 填入域名，GitHub 会给出需要配置的 `A` 记录 / `CNAME` 记录，到域名服务商处配置；
2. 域名生效后，站点就挂在**根路径**上了，此时必须改回 base：把 `vite.config.ts` 里的
   `const BUILD_BASE = '/NikkiWebsite/'` 改成 `const BUILD_BASE = '/'`；
3. 提交推送，重新部署即可。

> ⚠️ 这两步必须**同时**做。只绑域名不改 base，图片会全部 404；只改 base 不绑域名，则会在 `https://sumopenny.github.io/NikkiWebsite/` 上失效。

---

## 十一、与 Cloudflare Pages 的关系

项目根目录的 `wrangler.toml` 是给 Cloudflare Pages 用的（`pages_build_output_dir = "./dist"`），**与 GitHub Pages 部署互不干扰**，留着不动即可。

如果想两处同时存在，README 里记录的 Cloudflare Pages 配置照旧可用，两套并行没有任何冲突——因为本项目是纯静态站点，`wrangler.toml` 只声明了输出目录，不含任何密钥或数据库绑定。

---

## 文件改动清单

| 文件 | 状态 | 作用 |
|---|---|---|
| `vite.config.ts` | 修改 | 构建时 base 设为 `/NikkiWebsite/`，开发仍为 `/` |
| `src/App.vue` | 修改 | 素材路径改用 `import.meta.env.BASE_URL`；品牌图标同理 |
| `src/vite-env.d.ts` | **新增** | 引入 Vite 类型定义，修复 `import.meta.env` 类型报错 |
| `.github/workflows/deploy.yml` | **新增** | 自动构建 + 发布的工作流 |
| `.verify/ghpages-server.cjs` | **新增** | 本地模拟 GitHub Pages 子路径的静态服务 |
| `.verify/ghpages-check.mjs` | **新增** | 用真实浏览器验证图片/资源是否全部加载成功 |
