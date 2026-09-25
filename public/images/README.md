# 图片素材目录

把照片按下面的**文件名**放进对应目录，网站刷新后会自动换成真实图片；文件不存在时对应位置继续显示占位骨架，不会报错。

**后缀分两类**（不要混用）：
- **首屏美照 / 画廊美照**：用 `.jpeg`
- **应用界面截图**：用 `.jpg`

图片路径规则在 `src/App.vue` 顶部定义（`heroSlidesLight` / `heroSlidesDark` / `galleryPhotoSlots` / `screenshotPhotos`）。

**目录约定**：所有素材都放在 `public/images/` 下。首屏与画廊美照直接在 `public/images/` 根目录；应用截图放在 `public/images/screenshots/`。

## 常用调整速查

| 想改什么 | 改哪里 |
| --- | --- |
| 首屏轮播间隔（默认 3 秒） | `src/App.vue` → `HERO_SLIDE_INTERVAL = 3000` |
| 首屏切换动画时长/缓动 | `src/style.css` → `.hero-photo--current` / `.hero-photo--next` 的 `transition` |
| 首屏每组上限张数（默认 10） | `src/App.vue` → `HERO_SLIDE_LIMIT` |
| 画廊上限张数（默认 10） | `src/App.vue` → `GALLERY_SLIDE_LIMIT` |
| 画廊切换间隔（默认 2 秒） | `src/App.vue` → `GALLERY_SLIDE_INTERVAL = 2000` |

## 首屏美照（自动轮播）

**浅色模式**读取 `1.jpeg` ~ `10.jpeg`，**深色模式**读取 `11.jpeg` ~ `20.jpeg`，各最多 10 张。
每 3 秒自动切到下一张并循环，切换为交叉溶解动画。

间隔改起来很简单：`src/App.vue` 里的 `HERO_SLIDE_INTERVAL = 3000`（单位毫秒）。

**张数由目录内容决定**：网站会逐个探测清单里的每个文件名，**存在的都会被收集**。所以你有几张就播几张，不会去找满 10 张，也不会请求不存在的文件。

- 命名为纯数字，不要补零：`1.jpeg`、`2.jpeg`……`10.jpeg`
- 放了 1、2、3 三张就只轮播三张；想加到 4 张，直接放入 `4.jpeg` 即可，无需改代码。
- **允许跳号**。探测不会因某个文件缺失而中断，若只有 `1`、`3`、`5`，三张都会播。
- 浅色组与深色组张数可以不同（分别探测）。
- 暂停条件：切到别的标签页、系统启用「减少动态效果」。悬停、聚焦、点击都不会暂停。
- 只有 1 张时不会轮播，静态显示。

| 文件名 | 用途 | 建议规格 |
| --- | --- | --- |
| `public/images/1.jpeg` ~ `10.jpeg` | 浅色模式首屏「暖暖氛围美照」 | 16:9 横向原图，宽度 2400px+ |
| `public/images/11.jpeg` ~ `20.jpeg` | 深色模式首屏「暖暖氛围美照」 | 同上 |

## 画廊美照（「留一块位置，给你镜头里的暖暖」）

堆叠卡片**固定 10 张**，2 秒一次堆叠转场循环播放（这是页面原有设计，与照片数量无关）。
10 个卡位各自独立探测：放了的显示照片，没放的显示占位骨架 —— **所以这里缺号也没关系**，可以只放其中任意几张。

| 文件名 | 用途 | 建议规格 |
| --- | --- | --- |
| `public/images/gallery-1.jpeg` | 第 1 个卡位 | 16:10 横向原图，宽度 2000px+ |
| `public/images/gallery-2.jpeg` | 第 2 个卡位 | 同上 |
| `public/images/gallery-3.jpeg` | 第 3 个卡位 | 同上 |
| `public/images/gallery-4.jpeg` | 第 4 个卡位 | 同上 |
| `public/images/gallery-5.jpeg` | 第 5 个卡位 | 同上 |
| `public/images/gallery-6.jpeg` | 第 6 个卡位 | 同上 |
| `public/images/gallery-7.jpeg` | 第 7 个卡位 | 同上 |
| `public/images/gallery-8.jpeg` | 第 8 个卡位 | 同上 |
| `public/images/gallery-9.jpeg` | 第 9 个卡位 | 同上 |
| `public/images/gallery-10.jpeg` | 第 10 个卡位 | 同上 |

## 应用界面截图（「从相册时光，到趁手的小工具。」）

6 张截图，**全部放在 `public/images/screenshots/`**（注意不是 `public/screenshots/`）。

命名规则统一为 **`序号-英文短名.jpg`**，序号就是它们在页面上从左到右的展示顺序：

| 文件名 | 对应界面 | 建议规格 |
| --- | --- | --- |
| `public/images/screenshots/1-album-timeline.jpg` | 相册时间轴 | 16:10 原图，宽度 1600px+ |
| `public/images/screenshots/2-outfit-library.jpg` | 搭配方案 | 同上 |
| `public/images/screenshots/3-outfit-editor.jpg` | 方案编辑 | 同上 |
| `public/images/screenshots/4-outfit-code.jpg` | 搭配码解析 | 同上 |
| `public/images/screenshots/5-image-parameters.jpg` | 图片参数解析 | 同上 |
| `public/images/screenshots/6-lucky-times.jpg` | 抽卡吉时 | 同上 |

6 张各自独立探测：放了的显示真实截图，没放的显示占位骨架 —— **可以只放其中任意几张，缺号不影响其他张**。

**显示比例：16:10**（所有屏幕尺寸统一）。主预览区用 `object-fit: cover` + `object-position: top left` 呈现，即**按 16:10 裁剪、优先保留左上角**；所以按 16:10 导出的原图不会被裁，点开灯箱则完整显示不裁剪。

> 旧目录 `public/screenshots/`（`1.webp` / `搭配码.webp` / `搭配码编辑.webp`）已不再被代码引用，保留仅作备份。

## 注意事项

- 后缀不要弄错：**首屏 / 画廊用 `.jpeg`，应用截图用 `.jpg`**。若改用 `.png` / `.webp`，需同步修改 `src/App.vue` 中的文件名。
- **首屏轮播图请务必压缩**：建议单张控制在 300KB 以内。图多时总量过大会明显拖慢首屏。
- 页面已有 `object-fit: cover`，比例不完全是 16:9 / 16:10 也能正常显示，但会裁掉边缘，尽量按建议比例裁好再放进来。
- 素材用于公开展示前，请确认拥有相应使用权。


