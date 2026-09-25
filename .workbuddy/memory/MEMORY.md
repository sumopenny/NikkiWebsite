# NikkiWebsite — 项目长期备忘

无限暖暖相册管理工具的**营销站**（Vue 3 + TS + Vite 单页）。长期约定，逐次补充。

## 结构约定
- **核心文件只有 5 个**：`src/App.vue`（约 1000 行，几乎整个站点）、`src/style.css`（全站样式 + 所有断点）、`src/main.ts`、`src/components/ScreenshotPreviewPlaceholder.vue`、`src/vite-env.d.ts`（只有一行 `/// <reference types="vite/client" />`，别删 —— 删了 `import.meta.env` 会报 TS2339 导致构建失败）。
  改样式几乎都在 `src/style.css`；改逻辑/常量都在 `src/App.vue`。
- **断点只有 4 个**：`max-width: 1100px` / `900px` / `640px` / `380px`（另有一个 `prefers-reduced-motion`）。
  ≤900px 起 `.gallery-inner` 等区块变单栏 —— **改"某一栏"的样式前先确认它在不在单栏区间内**，否则会波及全宽。
- **主题**：`theme: 'light' | 'dark'` ref + `document.documentElement.dataset.theme`；CSS 侧选择器是 `:root[data-theme='dark']`，令牌在 `src/style.css` 顶部。
  切换按钮 = `.theme-toggle`。**验证深色效果要点真实按钮**，直接写 `dataset.theme` 可能拿到未生效的渲染。
- **i18n**：`copy` 对象 + `language: 'zh' | 'en'`，文案不硬编码在模板里。
  **公共 CTA 键 `copy.useNow` 被 4 处复用**（顶栏 `.header-cta` / 首屏 `.button-primary` / 画廊区 `.text-link` / 快速开始 `.button-primary`）→ **改一次全站生效**，别去模板里找字面量。当前 zh = 「打开网站」、en = `'Open the app'`（两者语义已不一致，用户只要求改中文）。

## 素材约定（`public/images/`）
- **首屏轮播**：`.jpeg`。浅色 `1.jpeg`~`10.jpeg`、深色 `11.jpeg`~`20.jpeg`（分组序号即全局文件名序号）。
  **允许跳号** —— 探测收集"清单里存在的全部"，缺号只跳过那一张，不中断后续。上限 = `HERO_SLIDE_LIMIT`。
- **画廊**：`gallery-1.jpeg`~`gallery-10.jpeg`，固定 10 张卡位。
- **应用截图**：`.jpg`（不是 .jpeg）。

## 关键常量

`src/App.vue` 顶部（JS 侧，改值改这里）：

| 常量 | 当前值 | 定义位置 | 含义 |
|---|---|---|---|
| `HERO_SLIDE_LIMIT` | 10 | `App.vue` L55 | 每主题最多几张首屏图 |
| `HERO_SLIDE_INTERVAL` | **3000** | `App.vue` **L91** | 首屏**停留**间隔（3 秒） |
| `GALLERY_SLIDE_LIMIT` | 10 | `App.vue` L63 | 画廊卡位数 |
| `GALLERY_SLIDE_INTERVAL` | **2000** | `App.vue` L93 | 画廊切换间隔（2 秒） |

`src/style.css` 的 `:root`（CSS 侧）：

| 变量 | 当前值 | 含义 |
|---|---|---|
| `--hero-fade` | **0.45s** | 首屏**淡化**时长（淡出 + 淡入，两侧一致） |
| `--hero-fade-scale` | **0.6s** | 首屏缩放位移时长（故意略长于淡化） |

**两个「时长」极易搞混，分清**：`HERO_SLIDE_INTERVAL` 管「每张停留多久」（改完必须重新构建，它是常量）；`--hero-fade` / `--hero-fade-scale` 管「淡化有多快」（纯 CSS）。**间隔别小于淡化时长**，否则看起来像一直在闪。

**`HERO_SLIDE_INTERVAL` 的唯一消费点**是 `App.vue` L553 的 `window.setInterval(..., HERO_SLIDE_INTERVAL)`（在 `watch(heroCanAutoplay)` 内）—— 它只在「能否自动播放」这个布尔量翻转时才重建定时器，**改常量本身不会重启已运行的定时器**。

**首屏只 mount 2 个 `<img>`**（current + next，其余不进 DOM）→ **数 DOM 图片数量永远只有 2 张，别据此判断轮播是否正常**；要采一整个循环的 active src 取并集。

**首屏右下角 `NN —— NN` 小标已改为动态**：`heroIndexCurrent`（当前张，随轮播变）+ `heroIndexTotal`（当前主题组实际张数），模板上有 `v-if="heroHasPhoto"` 兜住探测前的空档，且保留 `aria-hidden="true"`（数字每 3 秒变一次，给读屏会持续打断）。

## 构建与验证
- **`tsconfig` 开了 `noUnusedLocals`** → 删函数/变量必须连带清掉引用，否则 `vue-tsc` 报 TS6133、构建直接失败。
- 改完跑 `npm run build`（= `vue-tsc --noEmit && vite build`）确认。
- **本机 `vite preview` 不可用**（探测 502）→ 验证走自写静态服务：`.verify/server.cjs`（读 `dist/`，未命中回退 `index.html`；支持 `SERVE_DIR`）或 **`.verify/ghpages-server.cjs`（模拟 GitHub Pages 子路径，支持 `SERVE_DIR`/`PREFIX`/`PORT`，未带前缀直接 404）**。
  ⚠️ **验证子路径问题必须用带前缀的服务器** —— 挂在根路径上测永远通过，测不出问题。
- **`.verify/ghpages-check.mjs`**：Playwright 真浏览器验证脚本，输出 JSON（`httpErrors` / `pageErrors` / `failedImages`（判据 `naturalWidth > 0`）/ `allSrcsPrefixed` / `heroSrcs` / `darkHeroSrcs`）+ 浅深两张截图。新增素材或改动路径后跑它。
- **本机构建有一个 bulk-delete 守卫**：同一轮第二次 `npm run build` 会失败并掏空 `dist/assets/`。绕过办法见 `~/.workbuddy/MEMORY.md` 的「Vite / 前端构建」一节。
- **本机 `npx` 被 WSL 劫持**（报「没有已安装的 WSL 分发版」）→ **一律用 `node node_modules/<pkg>/bin/<cli>.js`**，如 `node node_modules/vue-tsc/bin/vue-tsc.js --noEmit`。
- Playwright 在 `.verify/*.mjs`，用 `import pw from 'file:///.../playwright-core/index.js'`（ESM 不认 `NODE_PATH`），Chromium 在 `AppData\Local\ms-playwright\chromium-1208\chrome-win64\chrome.exe`。

## 部署（GitHub Pages + GitHub Actions）

- **仓库**：`github.com/sumopenny/NikkiWebsite`，主分支 `main`。**线上地址 `https://sumopenny.github.io/NikkiWebsite/`**。
- **工作流** `.github/workflows/deploy.yml`：push main 或手动触发 → `npm ci` → `npm run build` → 发布 `dist`。需要 `permissions: contents:read / pages:write / id-token:write`。
  **必须在仓库 Settings → Pages → Source 选 `GitHub Actions`**（工作流不会自己开启 Pages）。私有仓库需付费计划。
- **🔴 子路径是本站部署的核心约束**：GitHub Pages 项目站挂在 `/NikkiWebsite/` 下，**不是根路径**。相关约定：
  - `vite.config.ts` 用 `command === 'build' ? '/NikkiWebsite/' : '/'` —— **dev 必须留在根路径**，因为 `Start-Website.bat` 硬编码打开 `http://localhost:<port>`；写成常量会让本地启动脚本 404。绑定自定义域名时把 `BUILD_BASE` 改回 `'/'`。
  - 运行时素材路径一律走 `import.meta.env.BASE_URL`（`App.vue` 的 `assetPath()` 与 `faviconUrl`）。**新增任何素材引用都必须带上 BASE_URL**，别写死 `/images/...`。
  - **Vue 模板里的根绝对路径不会被 Vite 加前缀，`index.html` 里的会** —— 两处行为不一致，改素材路径时最容易漏。
  - 故障特征：**HTML/JS/CSS 正常但所有图片空白** = 前缀问题（先看 Network 里图片请求是否少了 `/NikkiWebsite`）。
- **完整教学文档**：`DEPLOY_GITHUB_PAGES.md`（含 7 类故障排查表）。
- **Cloudflare Pages 未废弃**：`wrangler.toml`（`pages_build_output_dir = "./dist"`）保留不动，与 GitHub Pages 互不干扰。

## 色彩令牌（`src/style.css` 顶部）

浅色 `:root` / 深色 `:root[data-theme='dark']` 各一套。**站点里的「粉」有 5 个，别混**：

| 令牌 | 浅色 | 深色 | 用途 |
|---|---|---|---|
| `--accent` | `#cf6486` | `#c29ae8` | 主题主色：导航下划线、链接悬停、滚动条、圆点、功能图标 |
| `--accent-deep` | `#a84266` | `#ddc2f5` | 深色强调（文字 / 图标着色） |
| `--accent-button` | **`#e97d92`** | `#76569d`（紫） | 主按钮底色（= 品牌图标 favicon 的樱花粉） |
| `--accent-soft` | `#ffe3eb` | `#382a4d` | 淡底（选中态、卡片底色） |
| `--rose` | `#bd5378` | `#e39ab7` | 只用在首屏 `.hero-note svg` 小勾图标 |

- `--accent-button` 浅色变更史（同日两次）：`#a84266`（玫红）→ `#cf6486`（主题粉，白字 3.61:1）→ **`#e97d92`**（品牌图标樱花粉，用户终选，诉求就是「不要玫红」）。
- **`#e97d92` 上的白字只有 2.69:1（低于 AA 4.5）**。我一度新增 `--accent-button-ink` 把按钮文字改成深色（4.88:1 达标），**用户明确要求「文字颜色不要改」→ 已全部撤销**；`.button-primary` 的 `color` 保持写死的 `#fff`。**这是用户知情后的选择，别当 bug「修」**，也别再自作主张加文字色令牌。
- **深色模式 `--accent-button` 保持 `#76569d` 紫，用户明确要求不动**（该底色上的白字为 5.85:1）。
- **改配色前先枚举候选 + 算对比度**，见当日日志「按钮配色」一节。但**对比度是「告知项」，不是「擅自改动的依据」** —— 数据摆给用户，改不改由他定。

## 已知未决
- `.gallery-card` 圆角 `19px` vs `.gallery-photo` `18px` **不相等** → 图片四角会比卡片多裁一点、露出一丝卡片底色。已多次告知用户，等其决定是否对齐。
- 浅色模式下 `.hero-index` 的对比度会**随照片亮度浮动**（`--muted #75636b` 在白底约 5.4:1，够用但不刺眼）。若想无条件清晰，可给它加一层极淡背景条 —— 已告知用户，未做。
- **首屏切换不是真正的「交叉溶解」**：DOM 里只挂 `current` + `next` 两层，切走的图立即移除 → 过渡期间新图半透明、**透出容器底色**（浅色发白、深色发灰）。`style.css` 里「当前图同时淡出…形成无缝交叉溶解」的注释与实现不符（旧版遗留）。这是既有的性能取舍，非缺陷；若要真交叉溶解需让退场图多留一层。已告知用户，未改。
- **🔴 字体配置不一致（站点级）**：`index.html` 的 Google Fonts 只加载 **DM Sans + Noto Sans SC**，而 `style.css` L2 写的是 `font-family: Inter, "Noto Sans SC", ...` —— **`Inter` 从未被加载**（`document.fonts` 里只有 DM Sans / Noto Sans SC，网络请求也只有这两个），而 `DM Sans` 被加载却在 CSS 里零引用。
  后果：**全站拉丁文字实际由 `Noto Sans SC` 渲染**，且它把 `’`（U+2019）当**全角**渲染 —— 同字号下量得 `’` = 15px（正好 1em）vs `'` = 4.19px，出现可见空隙。受影响者包括既有文案 `game’s` / `album’s` / `website’s` 等。
  **当前约定：英文文案写直引号 `'`**（新写的 `galleryBody` 已用直引号）。
  修法三选一（**需用户定，会改动全站拉丁排版，未实施**）：① 把 `Inter` 加进字体链接；② 把 CSS 里的 `Inter` 换成已加载的 `DM Sans`；③ 全站 `’` → `'`。
