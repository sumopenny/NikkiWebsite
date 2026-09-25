# 图片素材目录

把照片按下面的**文件名**放进对应目录，网站刷新后会自动换成真实图片；文件不存在时对应位置继续显示占位骨架，不会报错。

**后缀统一为 `.webp`**（首屏美照 / 画廊美照 / 应用截图都是），不再区分 `.jpeg` 与 `.jpg`。
后缀由 `src/App.vue` 顶部的 `IMAGE_EXT` 常量统一控制 —— **要换图片格式只改那一行**。

图片路径规则在 `src/App.vue` 顶部定义（`IMAGE_EXT` / `heroSlidesLight` / `heroSlidesDark` / `galleryPhotoSlots` / `screenshotPhotos`）。

**目录约定**：
- 首屏美照、画廊美照：直接放在 `public/images/` 根目录
- 应用界面截图：放在 `public/images/screenshots/`
- **原始 jpeg/jpg 归档**：放在 `public/images/originals/`（保持相同子目录结构）。这里只作留档，页面**不会**加载它们。

## 重新生成 WebP

原始图改动后，跑一次转换脚本即可（保持原分辨率不变）：

```
D:\py\python.exe scripts\convert_webp.py
```

默认读 `public/images/originals/`、写到 `public/images/`，照片 quality 82、截图 quality 88。
可用 `--src` / `--dst` / `--quality` / `--shot-quality` 覆盖。

## 常用调整速查

| 想改什么 | 改哪里 |
| --- | --- |
| **图片格式（.webp ↔ .jpeg 等）** | `src/App.vue` → `IMAGE_EXT` 常量 |
| 首屏轮播间隔（默认 3 秒） | `src/App.vue` → `HERO_SLIDE_INTERVAL = 3000` |
| 首屏切换动画时长/缓动 | `src/style.css` → `.hero-photo--current` / `.hero-photo--next` 的 `transition` |
| 首屏每组上限张数（默认 10） | `src/App.vue` → `HERO_SLIDE_LIMIT` |
| 画廊上限张数（默认 10） | `src/App.vue` → `GALLERY_SLIDE_LIMIT` |
| 画廊切换间隔（默认 2 秒） | `src/App.vue` → `GALLERY_SLIDE_INTERVAL = 2000` |

## 首屏美照（自动轮播）

**浅色模式**读取 `1.webp` ~ `10.webp`，**深色模式**读取 `11.webp` ~ `20.webp`，各最多 10 张。
每 3 秒自动切到下一张并循环，切换为交叉溶解动画。

间隔改起来很简单：`src/App.vue` 里的 `HERO_SLIDE_INTERVAL = 3000`（单位毫秒）。

**张数由目录内容决定**：网站会逐个探测清单里的每个文件名，**存在的都会被收集**。所以你有几张就播几张，不会去找满 10 张，也不会请求不存在的文件。

- 命名为纯数字，不要补零：`1.webp`、`2.webp`……`10.webp`
- 放了 1、2、3 三张就只轮播三张；想加到 4 张，直接放入 `4.webp` 即可，无需改代码。
- **允许跳号**。探测不会因某个文件缺失而中断，若只有 `1`、`3`、`5`，三张都会播。
- 浅色组与深色组张数可以不同（分别探测）。
- 暂停条件：切到别的标签页、系统启用「减少动态效果」。悬停、聚焦、点击都不会暂停。
- 只有 1 张时不会轮播，静态显示。

| 文件名 | 用途 | 建议规格 |
| --- | --- | --- |
| `public/images/1.webp` ~ `10.webp` | 浅色模式首屏「暖暖氛围美照」 | 16:9 横向原图，宽度 2400px+ |
| `public/images/11.webp` ~ `20.webp` | 深色模式首屏「暖暖氛围美照」 | 同上 |

## 画廊美照（「留一块位置，给你镜头里的暖暖」）

堆叠卡片**固定 10 张**，2 秒一次堆叠转场循环播放（这是页面原有设计，与照片数量无关）。
10 个卡位各自独立探测：放了的显示照片，没放的显示占位骨架 —— **所以这里缺号也没关系**，可以只放其中任意几张。

| 文件名 | 用途 | 建议规格 |
| --- | --- | --- |
| `public/images/gallery-1.webp` | 第 1 个卡位 | 16:10 横向原图，宽度 2000px+ |
| `public/images/gallery-2.webp` | 第 2 个卡位 | 同上 |
| `public/images/gallery-3.webp` | 第 3 个卡位 | 同上 |
| `public/images/gallery-4.webp` | 第 4 个卡位 | 同上 |
| `public/images/gallery-5.webp` | 第 5 个卡位 | 同上 |
| `public/images/gallery-6.webp` | 第 6 个卡位 | 同上 |
| `public/images/gallery-7.webp` | 第 7 个卡位 | 同上 |
| `public/images/gallery-8.webp` | 第 8 个卡位 | 同上 |
| `public/images/gallery-9.webp` | 第 9 个卡位 | 同上 |
| `public/images/gallery-10.webp` | 第 10 个卡位 | 同上 |

## 应用界面截图（「从相册时光，到趁手的小工具。」）

6 张截图，**全部放在 `public/images/screenshots/`**（注意不是 `public/screenshots/`）。

命名规则统一为 **`序号-英文短名.webp`**，序号就是它们在页面上从左到右的展示顺序：

| 文件名 | 对应界面 | 建议规格 |
| --- | --- | --- |
| `public/images/screenshots/1-album-timeline.webp` | 相册时间轴 | 16:10 原图，宽度 1600px+ |
| `public/images/screenshots/2-outfit-library.webp` | 搭配方案 | 同上 |
| `public/images/screenshots/3-outfit-editor.webp` | 方案编辑 | 同上 |
| `public/images/screenshots/4-outfit-code.webp` | 搭配码解析 | 同上 |
| `public/images/screenshots/5-image-parameters.webp` | 图片参数解析 | 同上 |
| `public/images/screenshots/6-lucky-times.webp` | 抽卡吉时 | 同上 |

6 张各自独立探测：放了的显示真实截图，没放的显示占位骨架 —— **可以只放其中任意几张，缺号不影响其他张**。

**显示比例：16:10**（所有屏幕尺寸统一）。主预览区用 `object-fit: cover` + `object-position: top left` 呈现，即**按 16:10 裁剪、优先保留左上角**；所以按 16:10 导出的原图不会被裁，点开灯箱则完整显示不裁剪。

> 旧目录 `public/screenshots/`（`1.webp` / `搭配码.webp` / `搭配码编辑.webp`）已不再被代码引用，保留仅作备份。

## 注意事项

- **后缀统一 `.webp`**。三个目录（根目录首屏 / 根目录画廊 / `screenshots/`）都用同一后缀，靠 `IMAGE_EXT` 统一拼路径。要改格式改那一行，并把 `originals/` 里的原图重新转一份。
- `originals/` 里的原始 jpeg/jpg 体积很大（约 67 MB），它们**会被打进 `dist/`**（因为 `public/` 下所有内容都会进构建产物）。页面不会请求它们，所以**不影响线上访问速度**，只是部署上传会慢一些。想要更精简的部署产物，把这个文件夹移到 `public/` 之外即可（例如项目根的 `originals/`）。
- **首屏轮播图请保持压缩**：转成 WebP 后单张应在 1 MB 以内。图多时总量过大会明显拖慢首屏（首屏探测会逐张完整下载）。
- 页面已有 `object-fit: cover`，比例不完全是 16:9 / 16:10 也能正常显示，但会裁掉边缘，尽量按建议比例裁好再放进来。
- 素材用于公开展示前，请确认拥有相应使用权。
