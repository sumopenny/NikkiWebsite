# NikkiWebsite — 项目长期备忘

「暖立方 / NikkiCube」营销站（无限暖暖相册管理工具），Vue 3 + TS + Vite 单页。应用本体是开源仓库 sumopenny/Infinity-Nikki-Album-Manager，本站只负责介绍引流。

## 结构约定
- 核心文件仅 5 个：`src/App.vue`（约 990 行，逻辑+全部文案）、`src/style.css`（全站样式+断点）、`src/main.ts`、`src/components/ScreenshotPreviewPlaceholder.vue`、`index.html`（head 内联脚本：提前设主题 + preload 首图）。改样式→style.css；改逻辑/文案→App.vue；`public/_headers` 管 Cloudflare 缓存头。
- **index.html 内联脚本刻意镜像 3 个字面量**：存储键 `nikki-website-theme`、`.webp`、深色起始序号 `11` —— 与 App.vue 的 IMAGE_EXT / heroSlotBase() 同步改。
- 断点仅 4 个：1100/900/640/380px（另有 prefers-reduced-motion）。≤900px 起多栏区块变单栏 —— 改"某一栏"样式先确认它是否在单栏区间。
- 主题：`theme` ref + `documentElement.dataset.theme`，选择器 `:root[data-theme='dark']`，切换按钮 `.theme-toggle`。验证深色要**点真实按钮**，直接写 dataset 可能拿到未生效的渲染。
- i18n：`copy` 对象 zh/en，文案不硬编码模板。`copy.useNow` 被 4 处复用 → 改一次全站生效（zh「打开网站」/en 'Open the app'，语义不一致是用户有意）。

## 素材（public/images/，统一 .webp）
- 后缀由 App.vue 顶部 `IMAGE_EXT` 常量统一控制，换格式只改这一行。原图归档在 `public/images/originals/` —— 会被整包打进 dist（~82MB，页面不请求，仅部署慢；想精简就移出 public/）。
- 重新生成：`D:\py\python.exe scripts\convert_webp.py`（读 originals 写 public/images，照片 q82/截图 q88、method 6、不缩放，Pillow 自带）。
- 首屏：浅 1–8 / 深 11–19（缺 9/10/20 正常，探测允许跳号）；画廊 gallery-1~10；应用截图 screenshots/1-album-timeline ~ 6-lucky-times。
- 全量体积基线 ~14MB（原 jpeg 67.5MB）。改单图后用 `.verify/inspect_images.py` 核对。

## 关键常量（App.vue 顶部，改值改这里）
- `HERO_SLIDE_INTERVAL=3000`（停留间隔）、`GALLERY_SLIDE_INTERVAL=2000`。CSS `--hero-fade .45s` / `--hero-fade-scale .6s` 管淡化速度。**「停留时长」vs「淡化时长」别混；间隔别小于淡化时长**。
- HERO_SLIDE_INTERVAL 唯一消费点在 watch(heroCanAutoplay) 里 → 改常量不重启已运行的定时器。
- 首屏只 mount 当前+下一张 2 个 `<img>`（别数 DOM 判断轮播）；`.hero-index` 角标 NN——NN 动态，总数会从 /01 爬到 /08（首图不等整组，已知可接受）。

## 首屏加载链路（改动前必读）
- `probeAvailable()` 必须**并发**（勿改回串行 onload 递归）；fetchpriority 用 setAttribute；首屏前 2 张 high、其余 low；组内第 1 张到即 markProbed 解锁 → `heroProbed` 语义是「可渲染」而非「探完」。
- `_headers`：`/assets/*` immutable、`/images/*` max-age=604800（不带哈希**绝不能 immutable**）、`/index.html` must-revalidate。格式：无 BOM、纯 LF、pattern 顶格、header 缩进 2 空格。
- 基线（CDP 限速）：首图进 DOM 1666ms，瓶颈已是「JS 体积 + Vue 挂载」而非图片；再提速=减 JS 或 SSG。响应式多尺寸（srcset 三档）未做，方案见根目录《首屏图片加载优化方案.md》。

## 构建与验证
- `tsconfig` 开 noUnusedLocals → 删函数/变量必须连带清引用。
- 🔴 npm/npx 不可用（转 WSL 报无分发版）→ 直调 node：`node node_modules/vue-tsc/bin/vue-tsc.js --noEmit` + `node node_modules/vite/bin/vite.js build`。
- 同一轮第二次 build 会触发 bulk-delete 守卫并掏空 dist/assets → 先 `[System.IO.Directory]::Delete(dist,$true)` 再 build。搬目录用 robocopy /E，**别 Copy-Item -Recurse**（会拍平子目录）。
- vite build 日志非 UTF-8 → `.verify/dump.py` 转码；node 脚本日志是干净 UTF-8 可直接 Read。
- Playwright 项目内未装：用 `C:\Users\Penny\.workbuddy\binaries\node\workspace\node_modules\playwright-core`（CJS，import 后取 `pw.chromium ?? pw.default.chromium`），Chromium 在 `%LOCALAPPDATA%\ms-playwright\chromium-1208\chrome-win64\chrome.exe`。
- 时序/性能验证必须 CDP 限速（本机零延迟下断言无意义）；首屏采样窗口 ≥ 张数×3s，或读 `.hero-index` 角标（浅 /08、深 /09）。
- 可复用脚本（scratch 可能丢）：`.verify/{server.cjs, verify_webp.mjs, inspect_images.py, verify_perf.mjs, shots.mjs}`。SPA 回退只兜底无扩展名路由，否则缺图会 200 返回 index.html 造假阳性。
- 别单独起后台服务（活不过下一条命令）→ http 服务写进验证脚本内部自起自停。

## 色彩与文案
- 「粉」5 令牌别混：`--accent` 浅 #cf6486 / 深 #c29ae8；`--accent-deep`；`--accent-button` 浅 #e97d92（深紫 #76569d，均用户指定）；`--accent-soft`；`--rose` 仅首屏小勾。
- `--accent-button` 浅底白字 2.69:1 不达标 = **用户知情坚持，别当 bug 修，别加文字色令牌**。
- 改配色先枚举候选+算对比度，但对比度只是告知项，改不改由用户定。
- 英文文案用直引号 `'`（Noto Sans SC 把 `’` 渲染成全角）。字体不一致未决：Google Fonts 只载 DM Sans+Noto Sans SC，CSS 写了未加载的 Inter → 修法三选一（加 Inter/换 DM Sans/全站换直引号），待定。

## 已知未决（均已告知用户）
- `.gallery-card` 19px vs `.gallery-photo` 18px 圆角差 1px。
- 首屏切换非真交叉溶解（退场图即移除、透出底色）= 性能取舍。
- 浅色 `.hero-index` 对比度随照片亮度浮动。
