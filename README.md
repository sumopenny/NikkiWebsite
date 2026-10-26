# NikkiWebsite

暖立方（Nikki³）无限暖暖工具集的独立项目官网。使用 Vue 3、TypeScript 和 Vite 构建，可单独开发、构建并部署到 Cloudflare Pages；不会连接相册应用的 API 或 D1 数据库。

## 本地预览

要求 Windows 与 Node.js 20.9 或更新的 LTS 版本。双击项目根目录的 `Start-Website.bat`，首次运行会安装依赖并打开本地网站；默认使用 `http://localhost:5180`，端口被占用时会自动选择 5181–5190 中的空闲端口。也可以在终端运行：

```powershell
npm install
npm run dev
```

开发完成或准备部署前，运行：

```powershell
npm run build
npm run preview
```

## Cloudflare Pages

创建一个独立的 Cloudflare Pages 项目并连接本官网仓库，使用以下设置：

- Framework preset: Vue
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/`
- Environment: Node.js 20.9 或更新的 LTS 版本

本项目的 `wrangler.toml` 声明了 Pages 输出目录。官网为静态单页，不需要配置 D1、Secrets 或应用 API 代理。部署后可在 Cloudflare Pages 项目中绑定独立域名。

## 搜索收录

官网主网址为 `https://nikki3.pages.dev/`，在线工具仍为 `https://infinity-nikki-album-manager.pages.dev/`。首页标题与介绍使用“暖立方（Nikki³）”“无限暖暖相册管理”“无限暖暖共鸣记录”等真实品牌与功能名称。

`npm run build` 在类型检查和前端打包后，使用同一套 Vue 组件预渲染中文首页；发布目录仍为 `dist`，无需服务器或新增依赖。原始 HTML 包含介绍、默认功能预览、使用指南与常见问题，浏览器接管后保留语言、主题、分类切换和截图预览。正文初始可见，入场保留位移、取消从全透明开始；轮播和其他交互动效保留。已保存的语言偏好在接管后恢复。预渲染失败会终止构建，临时模块位于忽略的 `.verify/prerender/`，不会发布。

首页声明自身 canonical；`public/robots.txt` 引用仅列首页的 `public/sitemap.xml`。更换官网域名时同步更新 `index.html` 和这两个文件。无需主动提交也允许抓取，但收录和排名不作保证；公开项目中的官网链接有助于发现页面。部署后确认首页源代码含介绍、`/robots.txt` 与 `/sitemap.xml` 返回正确内容，并检查国内访问情况。此项目不会修改工具站的 canonical。

## 素材

- 源图片统一放在项目根目录的 `images/`，不会复制进部署目录。首屏浅色使用 `1.webp`～`10.webp`，深色使用 `11.webp`～`20.webp`；画廊使用 `gallery-1.webp`～`gallery-10.webp`。
- 功能预览包含相册、搭配码、家园方案、暖暖档案和解析工具五类，数据与截图路径在 `src/data/showcase.ts`；真实截图放在 `images/screenshots/`。未提供或加载失败的截图显示功能示意图。
- 教程图为 `images/auto-update-outfit-code.webp`，保留原始纵向比例，支持打开完整图片。
- 品牌图标位于 `public/images/brand-mark.png`，浏览器图标位于 `public/favicon.ico` 与 `public/favicon.svg`。
- 原始 JPEG/JPG 可选归档在 `images/originals/`。安装 Python 与 Pillow 后，可使用 `python scripts/convert_webp.py` 转成源 WebP；归档文件不发布。
- 命名与替换步骤详见 [图片素材说明](images/README.md)。更换图片格式需要同时调整路径、构建脚本和预加载配置，不能只修改 `IMAGE_EXT`。

## 页面内容

官网介绍相册管理、搭配码、家园方案、相机参数收藏、共鸣记录与个人衣橱，提供自动接收搭配码教程、备份迁移说明和常见问题。详细操作请阅读主项目的[中文 README](https://github.com/sumopenny/Infinity-Nikki-Album-Manager/blob/main/README.md)或[英文 README](https://github.com/sumopenny/Infinity-Nikki-Album-Manager/blob/main/README_EN.md)。

## 动效与无障碍

- 滚动显现、首屏文字进入、截图倾斜和画廊堆叠转场由 motion-v 驱动。首屏照片使用 Vue Transition 与 CSS：旧图保留在下层，直到新图淡入完成，稳定时仅保留当前图片。
- 首屏从当前图片加载显示起计时 2.6 秒（`HERO_SLIDE_INTERVAL = 2600`）；到期时后续图片未就绪则继续显示当前图，后续图片就绪后立即切换，不额外等待一轮。只有一张首屏图时静态显示。画廊每 2 秒切换（`GALLERY_SLIDE_INTERVAL = 2000`）。
- 首屏在移出视口、页面隐藏或系统减少动态效果时暂停；画廊在页面隐藏、系统减少动态效果或点击暂停按钮时暂停。悬停、键盘聚焦与手动切图不暂停自动播放。
- 页面提供跳过导航、可见键盘焦点和截图弹窗关闭后的焦点返回；减少动态效果时关闭视差与指针倾斜。
- 动效参考 [Motion for Vue](https://motion.dev/docs/vue)、[Vue Bits](https://vue-bits.dev/) 和 [AutoAnimate](https://auto-animate.formkit.com/)，运行时只使用 motion-v。

## 页面入口

- 在线应用：[Cloudflare Pages](https://infinity-nikki-album-manager.pages.dev/)，[备用站点](https://infinity-nikki-album-manager.vercel.app/)
- 源码与发布：[GitHub](https://github.com/sumopenny/Infinity-Nikki-Album-Manager)，[Gitee](https://gitee.com/sumopenny/Infinity-Nikki-Album-Manager)

项目是独立社区工具，与《无限暖暖》官方及其发行方没有隶属、授权或背书关系。


## 图片加载与更新

1. 替换 `images/` 中的源 WebP，运行 `npm run dev` 或 `npm run build`。开发服务器运行期间替换图片后，也需要重新启动以生成清单。
2. `scripts/prepare-images.mjs` 生成原尺寸及最多 960px 宽的图片，输出到 `public/images/optimized/`；地址取最终文件内容的哈希。源图、压缩参数或编码结果变化时，对应地址随之更新。宽度不超过 960px 的图片直接复用原尺寸文件。
3. `src/data/imageManifest.json` 是自动生成的路径清单。不要手工修改它或 `optimized/`；它们不提交到 Git。
4. 首屏探测最多两个并发，前两张优先加载；功能截图在首屏可展示后最多五个后台并发。画廊接近视口 600px 时加载当前及后续四张，教程图使用懒加载。浏览器按宽度和像素密度选择尺寸，放大截图使用原尺寸。
5. `dist` 只包含公开资源和生成图片，不包含 `images/` 源图。`/images/*`（含 optimized）统一缓存 7 天；JS/CSS 构建产物按内容哈希长期缓存。
6. 构建后运行 `node scripts/verify-image-loading.mjs`，验证加载队列、输出内容哈希、尺寸、部署引用、源图排除和图片缓存配置。

`node scripts/verify-hero-timing.mjs` 验证首屏切换时序，包括图片提前或延迟就绪、仅有一张、暂停恢复及旧图片加载事件。
