# NikkiWebsite

《无限暖暖相册管理》的独立项目官网。使用 Vue 3、TypeScript 和 Vite 构建，可单独开发、构建并部署到 Cloudflare Pages；不会连接相册应用的 API 或 D1 数据库。

## 本地预览

要求 Windows 与 Node.js LTS。双击项目根目录的 `Start-Website.bat`，首次运行会安装依赖并打开本地网站；默认使用 `http://localhost:5180`，端口被占用时会自动选择 5181–5190 中的空闲端口。也可以在终端运行：

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
- Environment: Node.js 20 或更新的 LTS 版本

本项目的 `wrangler.toml` 声明了 Pages 输出目录。官网为静态单页，不需要配置 D1、Secrets 或应用 API 代理。部署后可在 Cloudflare Pages 项目中绑定独立域名。

## 素材

- `public/images/` 是首屏与画廊美照的投放目录，文件名规则在 `src/App.vue` 顶部：首屏轮播浅色模式读 `1.jpeg` ~ `10.jpeg`、深色模式读 `11.jpeg` ~ `20.jpeg`（各最多 10 张，每 2 秒切换并循环），画廊为 `gallery-1.jpeg` ~ `gallery-5.jpeg`（16:10）。**首屏张数由目录内容决定**——启动时逐个探测文件，遇到第一个缺失即停止，所以有几张就播几张，不会去请求不存在的文件或凑满上限。画廊则保持原有的固定 5 张堆叠转场，5 个卡位各自独立探测，缺号会显示占位骨架。命名与规格详见 `public/images/README.md`。
- `public/screenshots/` 内是从主项目复制的界面截图，用于展示真实应用。
- 预览区中的搭配码解析、图片参数解析和抽卡吉时目前是截图素材位；把截图按 `public/images/screenshots/` 下的约定文件名放入即可自动替换，建议原图比例 16:10。
- 页面中标有 `ASSET SLOT` 的区域是待替换素材位，当前没有放入游戏美术。替换前请确认素材有权用于公开展示。
- 替换时保留对应容器比例，并为图片提供描述性替代文本。

## 页面内容

官网介绍相册时间轴、搜索与收藏、批量导入导出、最近删除与恢复、搭配方案和搭配码、照片参数解析、专项清理、抽卡吉时、帮助与反馈；并说明文件夹授权、本地处理及永久删除等边界。详细教程请阅读主项目的[中文 README](https://github.com/sumopenny/Infinity-Nikki-Album-Manager/blob/main/README.md)或[英文 README](https://github.com/sumopenny/Infinity-Nikki-Album-Manager/blob/main/README_EN.md)。

## 动效与无障碍

- 滚动显现、首屏分段进入、截图视差与轻倾斜、画廊堆叠转场由 motion-v 驱动；导航、按钮和截图淡入淡出使用 CSS。首屏美照轮播使用纯 CSS 交叉溶解（同一时刻只有当前图与下一张参与合成），不依赖 JS 逐帧动画。
- 画廊与首屏轮播的暂停条件：切到别的标签页、系统启用“减少动态效果”时暂停；启用减少动态效果时也会关闭视差与指针倾斜。首屏轮播不受悬停或聚焦影响，会持续播放。
- 首屏轮播间隔由 `src/App.vue` 的 `HERO_SLIDE_INTERVAL`（毫秒）控制，默认 2000。
- 动效设计参考 [Motion for Vue](https://motion.dev/docs/vue)、[Vue Bits](https://vue-bits.dev/) 和 [AutoAnimate 的 Vue 用法](https://auto-animate.formkit.com/)。页面只依赖 motion-v，没有复制 Vue Bits 源码或引入第二套动画库。
- 页面提供跳过导航链接、可见键盘焦点、截图预览关闭与焦点返回，并响应 prefers-reduced-motion。

## 页面入口

- 在线应用：[Cloudflare Pages](https://infinity-nikki-album-manager.pages.dev/)，[备用站点](https://infinity-nikki-album-manager.vercel.app/)
- 源码与发布：[GitHub](https://github.com/sumopenny/Infinity-Nikki-Album-Manager)，[Gitee](https://gitee.com/sumopenny/Infinity-Nikki-Album-Manager)

项目是独立社区工具，与《无限暖暖》官方及其发行方没有隶属、授权或背书关系。
