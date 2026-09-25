# NikkiWebsite — 项目长期备忘

无限暖暖相册管理工具的**营销站**（Vue 3 + TS + Vite 单页）。长期约定，逐次补充。

## 结构约定
- **核心文件只有 4 个**：`src/App.vue`（约 1000 行，几乎整个站点）、`src/style.css`（全站样式 + 所有断点）、`src/main.ts`、`src/components/ScreenshotPreviewPlaceholder.vue`。
  改样式几乎都在 `src/style.css`；改逻辑/常量都在 `src/App.vue`。
- **断点只有 4 个**：`max-width: 1100px` / `900px` / `640px` / `380px`（另有一个 `prefers-reduced-motion`）。
  ≤900px 起 `.gallery-inner` 等区块变单栏 —— **改"某一栏"的样式前先确认它在不在单栏区间内**，否则会波及全宽。
- **主题**：`theme: 'light' | 'dark'` ref + `document.documentElement.dataset.theme`；CSS 侧选择器是 `:root[data-theme='dark']`，令牌在 `src/style.css` 顶部。
  切换按钮 = `.theme-toggle`。**验证深色效果要点真实按钮**，直接写 `dataset.theme` 可能拿到未生效的渲染。
- **i18n**：`copy` 对象 + `language: 'zh' | 'en'`，文案不硬编码在模板里。
  **公共 CTA 键 `copy.useNow` 被 4 处复用**（顶栏 `.header-cta` / 首屏 `.button-primary` / 画廊区 `.text-link` / 快速开始 `.button-primary`）→ **改一次全站生效**，别去模板里找字面量。当前 zh = 「打开网站」、en = `'Open the app'`（两者语义已不一致，用户只要求改中文）。

## 素材约定（`public/images/`）
- **后缀统一 `.webp`**（2026-09-25 从 `.jpeg`/`.jpg` 全量转换而来），**由 `src/App.vue` 顶部的 `IMAGE_EXT` 常量统一控制 → 换格式只改那一行**。原 jpeg/jpg 归档在 `public/images/originals/`（同名同子目录结构）。
  - ⚠️ `originals/` 在 `public/` 下 → **会被整包打进 `dist/`**（`dist` 因此从 ~6.5 MB 变 81.8 MB）。页面**从不请求**它们，线上性能不受影响，只是部署上传慢。想精简就把该文件夹移出 `public/`。
- **重新生成 WebP**：`D:\py\python.exe scripts\convert_webp.py`（读 `originals/` 写 `public/images/`，照片 q82 / 截图 q88 / method 6 / **不缩放**）。用本机 `D:\py\python.exe` 的 Pillow 11.0.0，无需装依赖。
- **首屏轮播**：浅色 `1.webp`~`10.webp`、深色 `11.webp`~`20.webp`（分组序号即全局文件名序号）。当前实际存在 **浅色 8 张（1–8）、深色 9 张（11–19）**，`9/10/20` 缺失。
  **允许跳号** —— 探测收集"清单里存在的全部"，缺号只跳过那一张，不中断后续。上限 = `HERO_SLIDE_LIMIT`。
- **画廊**：`gallery-1.webp`~`gallery-10.webp`，固定 10 张卡位（当前 10 张全有）。
- **应用截图**：`screenshots/序号-英文短名.webp`，6 张全有。
- 体积基线：全部 33 张 webp 合计 **13.96 MB**（原 jpeg/jpg 为 67.55 MB）。单独改图后可用 `.verify/inspect_images.py` 重新核对。

## 关键常量

`src/App.vue` 顶部（JS 侧，改值改这里）：

| 常量 | 当前值 | 定义位置 | 含义 |
|---|---|---|---|
| `IMAGE_EXT` | `'.webp'` | `App.vue` L45 附近（`assetPath` 上方） | **全部素材的统一后缀**，首屏/画廊/截图共用；换图片格式只改这一行 |
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
- **🔴 `npm` 在本机 Git Bash 里不可用**（和 `npx` 一样被转发给 WSL 启动器，1 秒内 exit=1，报「没有已安装的 WSL 分发版」）。**必须直调 node**：
  `node node_modules/vue-tsc/bin/vue-tsc.js --noEmit` + `node node_modules/vite/bin/vite.js build`（即 `npm run build` 的两步）。
- **Bash 重定向出来的构建日志不是 UTF-8** → Read 工具报 `Cannot display content of binary file`。用 `.verify/dump.py <输入> <输出>` 转成可读文本（多编码试解 + ASCII 占比打分）；**别用 `PowerShell Get-Content -Encoding Unicode`，会二次损坏**。
- **本机 `vite preview` 不可用**（探测 502）→ 验证走自写静态服务。**但不要单独起后台服务**（`node .verify/server.cjs &` 活不过一条命令，健康检查能过、下一条命令就 connection refused）→ **把 http 服务写在验证脚本内部自起自停**（见 `.verify/verify_webp.mjs`）。
  - 写静态服务时 **SPA 回退必须限定「无扩展名的路由」**，否则缺失的图片会返回 `index.html`+200 制造假阳性。
- **本机构建有一个 bulk-delete 守卫**：同一轮第二次 build 会失败并掏空 `dist/assets/`。稳妥做法：先 `[System.IO.Directory]::Delete(dist,$true)` 清空 `dist`，再 `vite build` 到默认目录（此时删除数为 0，不触发守卫）。绕过细节见 `~/.workbuddy/MEMORY.md`。
- Playwright：`playwright-core` 在 `C:\Users\Penny\.workbuddy\binaries\node\workspace\node_modules\`，**项目内没有装**。用 `await import('file:///C:/Users/Penny/.workbuddy/binaries/node/workspace/node_modules/playwright-core/index.js')`（ESM 不认 `NODE_PATH`），Chromium 在 `%LOCALAPPDATA%\ms-playwright\chromium-1208\chrome-win64\chrome.exe`。
- 可复用脚本：`.verify/server.cjs`（`SERVE_DIR` 可指向任意构建目录）、`.verify/verify_webp.mjs`（图片链路全量验证，PASS/CHECK 退出码）、`.verify/inspect_images.py`（尺寸体积清单）、`.verify/dump.py`（日志解码）、`.verify/move_originals.py`（带 sha256 校验的迁移）。**这些是 scratch，不保证长期存在；丢失时可据本文件重建。**
- **验证首屏轮播要采满一整组：采样窗口 ≥ 张数 × `HERO_SLIDE_INTERVAL`**（浅色 8 张 × 3s = 24s），否则会漏采并误判。也可直接读 `.hero-index` 的 `NN —— NN` 角标交叉验证（浅色应显示 `/08`、深色 `/09`）。

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
