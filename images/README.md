# 图片源素材

本目录是官网图片的构建输入，**不会复制到 `dist/`**。需要公开的品牌图标另放在 `public/images/brand-mark.png`。

## 替换步骤

1. 按下面的文件名替换本目录中的 WebP 图片。
2. 运行 `npm run dev` 或 `npm run build`。开发服务运行期间替换后，重新启动服务。
3. 构建脚本生成 `public/images/optimized/` 和 `src/data/imageManifest.json`，无需手工维护。
4. 构建后可运行 `node scripts/verify-image-loading.mjs` 检查生成文件及部署引用。

每个生成图片的地址都包含其实际内容的哈希。修改源图或压缩设置后，对应输出内容变化就会获得新地址。图片统一缓存 7 天。不要直接覆盖 `optimized/` 内的生成文件。

## 首屏与画廊

| 源文件 | 用途 | 建议规格 |
| --- | --- | --- |
| `1.webp`～`10.webp` | 浅色首屏照片 | 16:9，宽度 2400px+ |
| `11.webp`～`20.webp` | 深色首屏照片 | 16:9，宽度 2400px+ |
| `gallery-1.webp`～`gallery-10.webp` | 画廊 10 个卡位 | 16:10，宽度 2000px+ |
| `auto-update-outfit-code.webp` | 搭配码自动接收教程 | 保留原始纵向比例 |

首屏每组最多 10 张，按文件名顺序探测，缺号会跳过；只有一张时静态显示。探测会请求候选路径，缺失文件可能出现失败请求，不能理解为只请求存在的文件。画廊固定保留 10 个卡位，缺图显示占位。

首屏每 2.6 秒切换，间隔由 `src/App.vue` 的 `HERO_SLIDE_INTERVAL = 2600` 控制；画廊间隔为 `GALLERY_SLIDE_INTERVAL = 2000`。首屏过渡由 `src/style.css` 的 `.hero-crossfade-*`、`--hero-fade` 和 `--hero-fade-scale` 控制，旧图的保留时长应不短于新图淡入时长。

首屏从当前图片加载显示后开始计时；满 2.6 秒时后续图片已就绪就切换，未就绪则保留当前图，待后续图片就绪立即切换。

首屏在离开视口、页面隐藏或系统减少动态效果时暂停；画廊在页面隐藏、减少动态效果或用户点击暂停时暂停。悬停、聚焦和手动切图不会暂停。

## 功能预览截图

分类、展示顺序、文案和逻辑图片路径由 `src/data/showcase.ts` 配置，源文件放在本目录的 `screenshots/` 下。

| 文件名（`screenshots/` 下） | 界面 |
| --- | --- |
| `album-timeline.webp` | 相册时间轴 |
| `archive-pearpal.webp` | 暖暖档案手账导入 |
| `album-actions.webp` | 相册动作分类 |
| `image-parameters.webp` | 照片参数解析 |
| `photo-lightbox.webp` | 照片大图预览 |
| `photo-share-portrait.webp` | 照片竖版分享图 |
| `photo-share-landscape.webp` | 照片横版分享图 |
| `outfit-library.webp` | 搭配方案列表 |
| `outfit-editor.webp` | 搭配方案编辑 |
| `outfit-code.webp` | 搭配码解析 |
| `outfit-parts.webp` | 搭配码部件详情 |
| `outfit-summary.webp` | 搭配总结 |
| `outfit-code-share.webp` | 搭配码分享图 |
| `home-plan.webp` | 家园方案列表 |
| `home-plan-detail.webp` | 家园方案编辑与解析 |
| `resonance.webp` | 共鸣记录 |
| `wardrobe.webp` | 衣橱套装 |
| `wardrobe-items.webp` | 衣橱部件 |
| `wardrobe-outfit-details.webp` | 套装详情 |
| `wardrobe-item-details.webp` | 部件详情 |
| `makeup-catalog.webp` | 妆容图鉴 |
| `makeup-details.webp` | 妆容详情 |
| `archive-background.webp` | 背景切换 |
| `parse-tools.webp` | 参数输入与解析 |
| `camera-favorites.webp` | 相机参数收藏 |
| `directory-backup.webp` | 电脑端自动备份 |
| `data-backup.webp` | 数据备份 |
| `data-sync.webp` | 数据同步 |
| `install-app.webp` | 添加到桌面 |
| `special-cleanup.webp` | 专项清理 |
| `lucky-times.webp` | 抽卡吉时 |
| `avatar-simulator.webp` | 头像模拟器 |

未配置真实截图的视图（`image: null`）使用功能示意图。新增截图时应同时设置 `src/data/showcase.ts` 中的 `image` 和中英文替代文本。

预览区按 16:10 裁剪、居中显示；弹窗显示完整图片。建议截图原图比例为 16:10、宽度 1600px+。

## 可选的 JPEG/JPG 转换

可将原图留档在 `images/originals/`，保持相同子目录结构；该目录为可选输入，不随当前仓库提供，也不会发布。安装 Python 与 Pillow 后运行：

```powershell
python scripts/convert_webp.py
```

脚本默认读取 `images/originals/`，输出本目录的同名 WebP；照片和截图质量均默认为 88。可用 `--src`、`--dst`、`--quality`、`--shot-quality` 覆盖。

当前构建链处理 WebP。更换格式需要协调修改 `src/App.vue` 路径、`src/data/showcase.ts`、图片生成脚本及 `index.html` / `vite.config.ts` 的首图预加载配置，不能只改 `IMAGE_EXT`。

## 2026-11-14 截图更新与待替换

已接入桌面提供的头像模拟器截图，并替换美鸭梨导入、搭配编辑截图。

| 类型 | 文件名（screenshots/ 下） | 截图内容 |
| --- | --- | --- |
| 已新增 | avatar-simulator.webp | 电脑端头像模拟器：已选照片和头像框，显示预览、缩放、保存及头像框列表 |
| 已替换 | archive-pearpal.webp | 当前美鸭梨导入窗口，显示脚本法与四项视频教程入口，凭据和 UID 使用演示数据 |
| 已替换 | outfit-editor.webp | 显示新增来源链接输入项的搭配编辑窗口 |
| 替换 | outfit-library.webp | 显示来源链接按钮与右下角多选圆圈的搭配列表 |
| 替换 | photo-lightbox.webp | 当前材质样式的大图预览 |
| 替换 | camera-favorites.webp | 带右下角多选圆圈的相机收藏列表 |
| 替换 | wardrobe-item-details.webp | 标题旁带紫色来源胶囊的部件详情 |
| 替换 | makeup-details.webp | 标题旁带紫色来源胶囊的妆容详情 |

其余标为“替换”的截图可后续补充。源素材使用 WebP，电脑截图建议 16:10、宽 1600px 以上。无需重新提供 Logo、背景图、头像框单张资源或首屏美照。
