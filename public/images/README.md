# 图片素材目录

把照片按下面的**文件名**放进对应目录，网站刷新后会自动换成真实图片；文件不存在时对应位置继续显示占位骨架，不会报错。

统一使用 `.jpeg` 后缀（相机 / 手机导出的原格式）。图片路径规则在 `src/App.vue` 顶部定义（`heroSlidesLight` / `heroSlidesDark` / `galleryPhotoSlots` / `screenshotPhotos`）。

## 常用调整速查

| 想改什么 | 改哪里 |
| --- | --- |
| 首屏轮播间隔（默认 2 秒） | `src/App.vue` → `HERO_SLIDE_INTERVAL = 2000` |
| 首屏切换动画时长/缓动 | `src/style.css` → `.hero-photo--current` / `.hero-photo--next` 的 `transition` |
| 首屏每组上限张数（默认 10） | `src/App.vue` → `HERO_SLIDE_LIMIT` |
| 画廊上限张数（默认 5） | `src/App.vue` → `GALLERY_SLIDE_LIMIT` |
| 画廊切换间隔（默认 2.7 秒） | `src/App.vue` → `GALLERY_SLIDE_INTERVAL = 2700` |

## 首屏美照（自动轮播）

**浅色模式**读取 `1.jpeg` ~ `10.jpeg`，**深色模式**读取 `11.jpeg` ~ `20.jpeg`，各最多 10 张。
每 2 秒自动切到下一张并循环，切换为交叉溶解动画。

间隔改起来很简单：`src/App.vue` 里的 `HERO_SLIDE_INTERVAL = 2000`（单位毫秒）。

**张数由目录内容决定**：网站会自动逐个探测文件，探测到第一个不存在的就停在那里。所以你有几张就播几张，不会去找满 10 张，也不会请求不存在的文件。

- 命名为纯数字，不要补零：`1.jpeg`、`2.jpeg`……`10.jpeg`
- 放了 1、2、3 三张就只轮播三张；想加到 4 张，直接放入 `4.jpeg` 即可，无需改代码。
- **必须连号**。因为探测到第一个缺失就停，若只有 `1`、`3`、`5`，实际只会播第 1 张。
- 浅色组与深色组张数可以不同（分别探测）。
- 暂停条件：切到别的标签页、系统启用「减少动态效果」。悬停、聚焦、点击都不会暂停。
- 只有 1 张时不会轮播，静态显示。

| 文件名 | 用途 | 建议规格 |
| --- | --- | --- |
| `public/images/1.jpeg` ~ `10.jpeg` | 浅色模式首屏「暖暖氛围美照」 | 16:9 横向原图，宽度 2400px+ |
| `public/images/11.jpeg` ~ `20.jpeg` | 深色模式首屏「暖暖氛围美照」 | 同上 |

## 画廊美照（「留一块位置，给你镜头里的暖暖」）

堆叠卡片**固定 5 张**，2.7 秒一次堆叠转场循环播放（这是页面原有设计，与照片数量无关）。
5 个卡位各自独立探测：放了的显示照片，没放的显示占位骨架 —— **所以这里缺号也没关系**，可以只放其中任意几张。

| 文件名 | 用途 | 建议规格 |
| --- | --- | --- |
| `public/images/gallery-1.jpeg` | 第 1 个卡位 | 16:10 横向原图，宽度 2000px+ |
| `public/images/gallery-2.jpeg` | 第 2 个卡位 | 同上 |
| `public/images/gallery-3.jpeg` | 第 3 个卡位 | 同上 |
| `public/images/gallery-4.jpeg` | 第 4 个卡位 | 同上 |
| `public/images/gallery-5.jpeg` | 第 5 个卡位 | 同上 |

## 应用界面截图（可选，替换现有素材位）

| 文件名 | 对应界面 | 建议规格 |
| --- | --- | --- |
| `public/images/screenshots/outfit-code.jpeg` | 搭配码解析 | 16:10 原图 |
| `public/images/screenshots/image-parameters.jpeg` | 图片参数解析 | 16:10 原图 |
| `public/images/screenshots/lucky-times.jpeg` | 抽卡吉时 | 16:10 原图 |

现有三张真实截图（相册时间轴、搭配方案、方案编辑）位于 `public/screenshots/`，命名保持不变即可。

## 注意事项

- 统一使用 `.jpeg`。若改用 `.png` / `.webp`，需同步修改 `src/App.vue` 中的文件名。
- **首屏轮播图请务必压缩**：建议单张控制在 300KB 以内。图多时总量过大会明显拖慢首屏。
- 页面已有 `object-fit: cover`，比例不完全是 16:9 / 16:10 也能正常显示，但会裁掉边缘，尽量按建议比例裁好再放进来。
- 素材用于公开展示前，请确认拥有相应使用权。


