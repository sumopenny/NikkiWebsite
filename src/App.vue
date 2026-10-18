<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ExternalLink,
  FileImage,
  Menu,
  Moon,
  Pause,
  Play,
  MonitorSmartphone,
  Archive,
  Heart,
  Shirt,
  Cloud,
  Sparkles,
  Sun,
  X
} from 'lucide-vue-next'
import { MotionConfig, motion, useScroll, useTransform } from 'motion-v'
import FeatureShowcase from './components/FeatureShowcase.vue'
import { imageSource, imageSrcset, setImageRequest } from './imageAssets'

type Language = 'zh' | 'en'
type Theme = 'light' | 'dark'
/**
 * 素材统一扩展名 —— **换图片格式只改这一行**。
 * 首屏 / 画廊 / 截图在 public/images 下都是同名文件，只有后缀不同，
 * 所以全部走这里的常量拼路径，不再在下面各处写死后缀。
 */
const IMAGE_EXT = '.webp'
// 真实素材路径：把同名图片放进 public/images/ 对应子目录即可自动启用。
const assetPath = (file: string): string => imageSource(`/images/${file}`)
/**
 * 首屏暖暖氛围美照轮播（16:9 横向原图，建议宽度 2400px+）。
 * 浅色模式读取 1.webp ~ 10.webp，深色模式读取 11.webp ~ 20.webp，各最多 10 张。
 *
 * 张数完全由目录里实际存在的文件决定：下面只列出「上限」10 个文件名，
 * 运行时逐个探测，**存在的都会被收集**，缺号不会中断探测
 * （例如只有 1、3、5 就是 3 张，全部会播）。位数不用补零（用 1.webp 而非 01.webp）。
 */
const HERO_SLIDE_LIMIT = 10
const heroSlidesLight: string[] = Array.from({ length: HERO_SLIDE_LIMIT }, (_, index) => assetPath(`${index + 1}${IMAGE_EXT}`))
const heroSlidesDark: string[] = Array.from({ length: HERO_SLIDE_LIMIT }, (_, index) => assetPath(`${index + 11}${IMAGE_EXT}`))
/**
 * 画廊美照（16:10 横向原图，建议宽度 2000px+），顺序即轮播顺序。
 * 堆叠卡片固定 10 张（保持原有堆叠转场），每张卡各自探测对应文件是否存在：
 * 有图就显示照片，没有就显示占位骨架。
 */
const GALLERY_SLIDE_LIMIT = 10
const galleryPhotoSlots: string[] = Array.from({ length: GALLERY_SLIDE_LIMIT }, (_, index) => assetPath(`gallery-${index + 1}${IMAGE_EXT}`))
/** 画廊探测结果：第 N 个卡位是否有真实照片。 */
const galleryAvailable = ref<Record<number, boolean>>({})
/**
 * 画廊堆叠卡片数固定为 5 —— 与原始设计一致：始终渲染 5 张叠放的卡片，
 * 靠 activeGalleryIndex 做堆叠转场与循环。这里不要跟着实际照片数变化，
 * 否则照片少/没照片时堆叠动画就没了。
 */
const gallerySlideCount = GALLERY_SLIDE_LIMIT
/**
 * ★ 首屏轮播「每张停留多久」（毫秒）—— 想调快/调慢改这里即可。
 * 3000 = 每 3 秒切到下一张。改 2000 是 2 秒，改 4000 是 4 秒。
 * 注意：这个只管停留时长，**不管淡入淡出的快慢**。
 * 淡化速度在 src/style.css 的 :root 变量 --hero-fade / --hero-fade-scale 上
 * （值绑在 .hero-photo--current / --next 的 transition 里）。
 * 间隔不要小于过渡时长，否则会看起来像一直在闪。
 */
const HERO_SLIDE_INTERVAL = 2600
/** ★ 画廊轮播切换间隔（毫秒），默认 2 秒。 */
const GALLERY_SLIDE_INTERVAL = 2000

const language = ref<Language>('zh')
const theme = ref<Theme>('light')
const mobileMenuOpen = ref(false)
const activeGalleryIndex = ref(0)
/**
 * 画廊自动播放唯一的暂停开关：由播放/暂停按钮切换。
 * 悬停、聚焦、滚出视口、手动切图都**不**再暂停 —— 只有这个标记会。
 */
const galleryAutoplayRequested = ref(true)
const pageVisible = ref(true)
const pageReady = ref(false)
const galleryStarted = ref(false)
let galleryLoadObserver: IntersectionObserver | undefined
let imageLoadingStopped = false
const prefersReducedMotion = ref(false)
const navigationSections = ['top', 'screenshots', 'start', 'faq'] as const
const activeSection = ref<string>('top')
const activeHeroSlide = ref(0)
const heroInView = ref(true)
const heroSection = ref<HTMLElement | null>(null)
const heroRegion = ref<HTMLElement | null>(null)
let sectionUpdateFrame: number | undefined
let heroObserver: IntersectionObserver | undefined
let galleryTimer: number | undefined
let heroTimer: number | undefined
let motionPreferenceQuery: MediaQueryList | undefined

const { scrollYProgress: pageScrollProgress } = useScroll()
const heroScroll = useScroll({ target: heroSection, offset: ['start start', 'end start'] })
const heroParallax = useTransform(heroScroll.scrollYProgress, [0, 1], [0, 22])
const heroArtMotionStyle = computed(() => ({ y: prefersReducedMotion.value ? 0 : heroParallax }))
/**
 * 探测结果：实际存在的前 N 张。key 是「第几张」（从 1 开始），
 * 浅色组 1~10、深色组 11~20 都走这一个 map，互不干扰。
 */
const heroAvailable = ref<Record<number, boolean>>({})
/**
 * 该主题组「可以开始渲染了」的开关，同时兼作「不必重复探测」的标记。
 * 置位时机有两处：组内**第 1 张** onload（提前放行），或整轮探测 onDone（兜住第 1 张缺失的情况）。
 * 因此它**不等于**「整组都探完了」—— 放行之后剩余的图仍会陆续补进 heroAvailable。
 */
const heroProbed = ref<Record<Theme, boolean>>({ light: false, dark: false })
/** 深色模式读取 11~20，浅色模式读取 1~10。 */
const heroSlides = computed(() => (theme.value === 'dark' ? heroSlidesDark : heroSlidesLight))
/**
 * 首屏某一主题组的文件名起始序号：浅色 1、深色 11。
 * **读写 heroAvailable 必须都经过它** —— 探测时写入的 key、渲染时查询的 key
 * 必须是同一个值，否则深色组会出现「有图但一张都不播」的静默故障。
 */
function heroSlotBase(group: Theme): number {
  return group === 'dark' ? 11 : 1
}

/** 组内下标（0 起）→ heroAvailable 的 key（全局文件名序号）。 */
function heroSlotKey(index: number, group: Theme = theme.value): number {
  return heroSlotBase(group) + index
}

/**
 * 目录里实际存在的全部文件，**允许中间跳号**。
 * 例如只放了 1、3、5，三张都会进列表并依次轮播（不会因缺 2 就断在第 1 张）。
 * 顺序仍按文件名序号从小到大。
 *
 * 用 heroProbed 当门禁是为了避免乱序到达时「先拿第 5 张当首图、随后换成第 1 张」的闪动；
 * 该标记会在第 1 张到达时立即置位（见 probeHeroSlides），所以首图不必等整组下载完。
 * 放行时列表里可能只有前几张，之后会随探测进展自动补全。
 */
const heroVisibleSlides = computed(() => {
  if (!heroProbed.value[theme.value]) return []
  return heroSlides.value.filter((_, index) => heroAvailable.value[heroSlotKey(index)])
})
const heroSlideCount = computed(() => heroVisibleSlides.value.length)
const heroHasPhoto = computed(() => heroProbed.value[theme.value] && heroSlideCount.value > 0)
/**
 * 首屏右下角「当前序号 —— 总张数」小标（如 01 —— 09）。
 * 两个数都跟随实际素材，不是硬编码：
 * - `heroIndexCurrent` 取当前正在展示的那张（1 起、补零），会随轮播实时变；
 * - `heroIndexTotal` 取当前主题组里探测到的实际张数（深色与浅色可能不同）。
 * 用 `% count` 兜一层：探测可能晚于首帧完成、切主题时索引会归零，
 * 极端时序下 activeHeroSlide 也可能短暂超出新张数。
 *
 * 注意 `heroIndexTotal` 取的是「当前已探测到的张数」而不是最终张数：
 * 首图提前放行后，总数会在几百毫秒内从 /01 逐步爬到最终值（如 /08）。
 * 这是为了让首图不必等整组下载完而付的代价，属已知且可接受的表现。
 */
const heroIndexCurrent = computed(() => {
  const count = heroSlideCount.value
  if (!count) return '01'
  return String((activeHeroSlide.value % count) + 1).padStart(2, '0')
})
const heroIndexTotal = computed(() => String(heroSlideCount.value).padStart(2, '0'))
/**
 * 自动播放条件：有多张、且没有暂停理由。
 * 暂停只保留：切到别的标签页、系统启用「减少动态效果」。
 * 悬停与聚焦都不再暂停。
 */
const heroCanAutoplay = computed(() => pageReady.value
  && heroSlideCount.value > 1
  && !prefersReducedMotion.value
  && heroInView.value
  && pageVisible.value)
/**
 * 画廊堆叠轮播：不因照片数量而停止。
 * 暂停条件只剩两个：用户点了暂停按钮、切到别的浏览器标签页。
 * 悬停 / 聚焦 / 滚出视口 / 手动切图都不再暂停。
 */
const galleryCanAutoplay = computed(() => pageReady.value
  && galleryStarted.value
  && galleryAutoplayRequested.value
  && !prefersReducedMotion.value
  && pageVisible.value)
/**
 * 「此刻是否在自动播放」，供播放/暂停按钮的图标与 aria 状态使用。
 * 与 galleryCanAutoplay 等价（悬停等临时条件已移除，不存在「意图在播但实际停了」的错位），
 * 单独命名是为了让模板语义更清楚。
 */
const galleryAutoplayActive = galleryCanAutoplay

const sectionReveal = {
  // 静态正文从首帧即可阅读，保留滚动位移但不以透明状态等待脚本。
  initial: { opacity: 1, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  inViewOptions: { once: true, amount: 0.14 },
  transition: { duration: 0.68, ease: [0.22, 1, 0.36, 1] }
} as const
const heroVariants = {
  hidden: { opacity: 1, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1], delayChildren: 0.08, staggerChildren: 0.08 } }
}
const heroItemVariants = {
  hidden: { opacity: 1, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }
}
const featureGridVariants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1, transition: { staggerChildren: 0.075, delayChildren: 0.06 } }
}
const featureCardVariants = {
  hidden: { opacity: 1, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.58, ease: [0.22, 1, 0.36, 1] } }
}

const trustIcons = [FileImage, MonitorSmartphone, Archive, Heart, Shirt, Cloud]

const links = {
  app: 'https://infinity-nikki-album-manager.pages.dev/',
  fallback: 'https://infinity-nikki-album-manager.vercel.app/',
  github: 'https://github.com/sumopenny/Infinity-Nikki-Album-Manager',
  githubReleases: 'https://github.com/sumopenny/Infinity-Nikki-Album-Manager/releases',
  // 反馈入口：小红书主页（原 GitHub Issues 已不再作为对外反馈渠道）
  feedback: 'https://xhslink.cn/o/57r27sFj6zH',
  githubReadme: 'https://github.com/sumopenny/Infinity-Nikki-Album-Manager/blob/main/README.md',
  gitee: 'https://gitee.com/sumopenny/Infinity-Nikki-Album-Manager',
  giteeReleases: 'https://gitee.com/sumopenny/Infinity-Nikki-Album-Manager/releases',
  giteeReadme: 'https://gitee.com/sumopenny/Infinity-Nikki-Album-Manager/blob/master/README.md'
}

const copy = computed(() => language.value === 'zh'
  ? {
      nav: ['首页', '功能预览', '使用指南', '常见问题'],
      eyebrow: 'INFINITY NIKKI · LOCAL ALBUM STUDIO',
      title: '把每一段心动，\n好好珍藏。',
      heroBody: "暖立方（Nikki³）是为无限暖暖玩家打造的实用工具集。整理游戏照片，珍藏搭配、家园灵感与相机参数，记录共鸣，查看个人衣橱收集进度，让珍贵瞬间留在自己的设备里。",
      useNow: '打开网站',
      viewFeatures: '看看它能做什么',
      heroNote: "免费使用 · 本地功能无需注册 · 无需下载",
      artHero: '首屏暖暖氛围美照',
      artRatioWide: '轮播 · 浅色 1-10 / 深色 11-20 · 16:9 横向原图 · 宽度 2400px+',
      benefits: [{"title":"照片本地读取","body":"相册浏览与照片参数解析在本地完成，原图无需上传。"},{"title":"电脑手机都能用","body":"整理搭配、家园与拍摄灵感，查看共鸣记录和衣橱。"},{"title":"数据随时备份","body":"支持模块备份与全部数据导出，方便迁移到其他设备。"},{"title":"游戏灵感集中珍藏","body":"将搭配码、家园方案与相机参数分类保存，随时查找。"},{"title":"共鸣与衣橱一目了然","body":"查看共鸣抽数、部件获取记录和服装收集进度。"},{"title":"共鸣记录云同步","body":"登录后手动上传、下载共鸣记录，跨设备继续查看。"}],
      previewKicker: 'A LITTLE LOOK INSIDE',
      previewTitle: '从相册时光，到趁手的小工具。',
      previewBody: "整理照片、珍藏搭配与家园灵感，记录每一次共鸣，也看看衣橱里的收集进度。",
      shotHint: '点击缩略图切换预览，点击大图放大查看',
      previewShotLabel: '真实应用界面', previewPlaceholderLabel: '截图素材位',
      previewAssetNote: '真实应用截图待提供', previewAssetRatio: '建议原图比例 16:10',
      galleryKicker: 'YOUR WORLD, YOUR WALLPAPER',
      galleryTitle: '留一块位置，给你镜头里的暖暖。',
      galleryBody: '尽情欣赏暖暖美照，让官网也像一本小小的旅途画册。',
      tutorialKicker: 'OUTFIT CODE · AUTO UPDATE',
      tutorialTitle: '自动更新搭配码，几步就能设好。',
      tutorialBody: '授权当前游戏目录后，在游戏中生成搭配码，再回到网页即可自动接收。',
      tutorialSteps: [
        { no: '01', title: '授权游戏目录', body: '在网页右上角当前相册下拉菜单中，授权当前游戏的 X6Game 文件夹。' },
        { no: '02', title: '在游戏中框选搭配', body: '点击分享，再点搭配截图右下角的框选按钮，调整展示区域并确认。' },
        { no: '03', title: '生成搭配码并返回', body: '点击“生成搭配码”，然后回到网页。网站会检查搭配码和游戏搭配图片的更新时间。' }
      ],
      tutorialNote: '只有新搭配码且游戏搭配图片的最后修改时间也已更新时才会导入。相同搭配码、图片未更新或找不到图片时会跳过并提示。',
      tutorialImageAlt: '三张游戏截图展示框选搭配截图并生成搭配码的操作步骤。',
      tutorialImageCaption: '游戏内框选与生成搭配码步骤图',
      tutorialImageOpen: '打开完整操作步骤图',
      tutorialAppLink: '打开相册工具',
      artPortrait: '暖暖游戏美照', artRatioPortrait: '建议比例 16:10 · 横幅原图',
      galleryLabel: '暖暖美照轮播', gallerySlide: (index: number) => `第 ${index} 张，共 ${gallerySlideCount} 张`,
      galleryControlsLabel: '画廊控制', galleryPrevious: '上一张美照', galleryNext: '下一张美照',
      galleryPause: '暂停自动播放', galleryPlay: '继续自动播放', galleryMotionOff: '系统减少动态效果已关闭自动播放',
      startKicker: 'USAGE GUIDE',
      startTitle: '找到你的上手方式。',
      startBody: "相册管理需要电脑端目录授权；搭配码、家园方案、相机参数收藏与暖暖档案可在电脑和手机直接使用。",
      startSteps: [
  {
    "no": "01",
    "title": "整理电脑相册",
    "body": "使用支持目录授权的电脑浏览器，选择照片目录，浏览、收藏与整理游戏照片；自动接收搭配码另行授权 X6Game，设置见下方教程。"
  },
  {
    "no": "02",
    "title": "珍藏搭配与拍摄灵感",
    "body": "电脑和手机均可直接管理搭配码、家园方案与相机参数收藏，无需先授权相册目录；也可从工具菜单解析原图或参数码。"
  },
  {
    "no": "03",
    "title": "查看暖暖档案与迁移数据",
    "body": "进入“暖暖档案”，按引导导入共鸣记录和衣橱数据；通过模块备份或“更多”中的全部数据备份迁移设备，共鸣记录还可手动云同步。"
  }
],
      questionsKicker: 'GOOD TO KNOW',
      questionsTitle: '开始前，几个常见问题。',
      questions: [
  {
    "q": "照片会上传到服务器吗？",
    "a": "照片浏览与相机参数解析在本地浏览器中完成。临时选择的游戏原图不会上传，也不会自动加入相册；主动使用共鸣云同步时会上传对应的共鸣记录。"
  },
  {
    "q": "为什么无法授权文件夹，或相册没有显示？",
    "a": "请使用支持目录授权的电脑端 Chromium 浏览器，选择实际存放照片的文件夹；授权失效时重新选择。受保护目录无法访问时，可将照片复制到普通文件夹后授权，不要选择磁盘根目录。"
  },
  {
    "q": "手机上可以使用哪些功能？",
    "a": "手机可管理搭配码、家园方案和相机参数收藏，使用独立照片与代码解析，查看共鸣记录与个人衣橱。相册目录管理、游戏搭配自动接收和专项清理需要支持目录授权的电脑浏览器。"
  },
  {
    "q": "如何把电脑数据迁移到手机？",
    "a": "在电脑端“更多”中选择“导出全部数据”，将 ZIP 文件传到手机，再用手机浏览器打开网站，在“更多”中选择“导入全部数据”。导入会按各模块规则合并，请核对结果提示。"
  },
  {
    "q": "云同步会自动同步所有数据吗？",
    "a": "不会。目前仅支持共鸣记录，需注册并登录账号后手动上传或下载。上传覆盖云端存档，下载覆盖本地共鸣记录；登录和本地修改不会自动同步。"
  },
  {
    "q": "为什么衣橱部件显示“未知”？",
    "a": "星光小铺、服装商店、奇迹之冠、滚滚机与世界逸事等来源的拥有信息可能未包含在导入数据中，未识别到的部件显示为“未知”，不直接判定为未拥有。"
  },
  {
    "q": "删除的照片能恢复吗？",
    "a": "相册普通删除会移入最近删除，可从中恢复。最近删除中的永久删除、清空全部和专项清理会直接修改电脑文件，无法通过最近删除恢复。"
  }
],
      readme: '阅读完整 README', report: '反馈问题-小红书',
      footerLine: '为每一张心动留个位置。', disclaimer: '独立社区项目 · 与《无限暖暖》官方无隶属或背书关系',
      themeLight: '浅色主题', themeDark: '深色主题', languageLabel: '切换语言',
      openImage: '放大查看界面预览', closeImage: '关闭图片预览', menuOpen: '打开导航菜单', menuClose: '关闭导航菜单',
      imageModalLabel: '应用界面大图预览', appUnavailableNote: '若主站暂时无法访问，可试用备用站点。'
    }
  : {
      nav: ['Home', 'Features', 'Usage guide', 'FAQ'],
      eyebrow: 'INFINITY NIKKI · LOCAL ALBUM STUDIO',
      title: 'Keep every lovely\nmoment close.',
      heroBody: "NikkiCube (Nikki³) is a practical toolkit for Infinity Nikki players. Organize game photos, save outfits, home ideas and camera presets, track resonance, and explore your wardrobe collection while keeping precious moments on your device.",
      useNow: 'Open the app', viewFeatures: 'Explore the features', heroNote: "Free to use · Local features need no sign-up · No download",
      artHero: 'Infinity Nikki hero artwork', artRatioWide: 'Carousel · light 1-10 / dark 11-20 · 16:9 landscape · 2400px+ wide',
      benefits: [{"title":"Photos stay local","body":"Album browsing and photo parameter parsing run locally. Original photos need no upload."},{"title":"Desktop and mobile","body":"Organize outfits, home ideas and camera presets, and explore resonance records and your wardrobe."},{"title":"Back up anytime","body":"Export individual modules or all data to move your collection to another device."},{"title":"Keep your inspiration","body":"Save outfit codes, home schemes and camera presets by category for easy access."},{"title":"Track your collection","body":"Review resonance pulls, piece acquisition records and clothing collection progress."},{"title":"Resonance cloud sync","body":"Sign in to manually upload or download resonance records and continue on another device."}],
      previewKicker: 'A LITTLE LOOK INSIDE',
      previewTitle: 'From album memories to handy little tools.',
      previewBody: "Organize photos, save outfit and home ideas, track resonance, and explore your wardrobe collection.",
      shotHint: 'Choose a thumbnail to switch views, then open the preview',
      previewShotLabel: 'REAL APP INTERFACE', previewPlaceholderLabel: 'SCREENSHOT SLOT',
      previewAssetNote: 'Real app screenshot to come', previewAssetRatio: 'Suggested source ratio: 16:10',
      galleryKicker: 'YOUR WORLD, YOUR WALLPAPER', galleryTitle: 'A little space for Nikki in your frame.',
      galleryBody: "Enjoy Nikki's beautiful photos, and let this site feel like a little travel album.",
      tutorialKicker: 'OUTFIT CODE · AUTO UPDATE',
      tutorialTitle: 'Set up automatic outfit-code updates in a few steps.',
      tutorialBody: 'Authorize the current game folder once. Then create an outfit code in game and return to the website to import it.',
      tutorialSteps: [
        { no: '01', title: 'Authorize the game folder', body: 'Open the current album menu at the top right and grant access to the current game’s X6Game folder.' },
        { no: '02', title: 'Select the outfit in game', body: 'Tap Share, choose the selection button at the bottom right of the outfit screenshot, adjust the frame, and confirm.' },
        { no: '03', title: 'Generate the code and return', body: 'Tap Generate Outfit Code, then return to the website. It checks the code and the outfit image’s modified time.' }
      ],
      tutorialNote: 'An outfit is imported only when the code is new and the game image has a newer modified time. Existing codes, unchanged images, and missing images are skipped with a status message.',
      tutorialImageAlt: 'Three in-game screenshots showing how to select an outfit image before generating its outfit code.',
      tutorialImageCaption: 'In-game selection and outfit-code steps',
      tutorialImageOpen: 'Open the full tutorial image',
      tutorialAppLink: 'Open the album tool',
      artPortrait: 'Infinity Nikki in-game photo', artRatioPortrait: 'Suggested 16:10 landscape original',
      galleryLabel: 'Infinity Nikki photo carousel', gallerySlide: (index: number) => `Image ${index} of ${gallerySlideCount}`,
      galleryControlsLabel: 'Gallery controls', galleryPrevious: 'Previous photo', galleryNext: 'Next photo',
      galleryPause: 'Pause autoplay', galleryPlay: 'Resume autoplay', galleryMotionOff: 'Autoplay is off because reduced motion is enabled',
      startKicker: 'USAGE GUIDE', startTitle: 'Find the right way to get started.',
      startBody: "Album management requires desktop folder access; outfit codes, home schemes, camera favorites and Nikki Archive work directly on desktop and mobile.",
      startSteps: [
  {
    "no": "01",
    "title": "Organize desktop albums",
    "body": "Use a desktop browser with folder access to select a photo folder, then browse, favorite and organize photos. Automatic outfit-code imports require separate X6Game access; see the tutorial below."
  },
  {
    "no": "02",
    "title": "Save outfits and camera inspiration",
    "body": "Manage outfit codes, home schemes and camera favorites directly on desktop or mobile without album access, or use Tools to parse an original photo or code."
  },
  {
    "no": "03",
    "title": "Explore Nikki Archive and migrate data",
    "body": "Import resonance and wardrobe data in Nikki Archive. Transfer data through module backups or all-data backups under More; resonance records also support manual cloud sync."
  }
],
      questionsKicker: 'GOOD TO KNOW', questionsTitle: 'A few things before you begin.',
      questions: [
  {
    "q": "Are my photos uploaded?",
    "a": "Photo browsing and camera parameter parsing run locally. Originals selected for temporary parsing are not uploaded or added to an album. Manually using resonance cloud sync uploads the corresponding resonance records."
  },
  {
    "q": "Why is folder access denied or my album missing?",
    "a": "Use a desktop Chromium browser supporting folder access and select the folder containing your photos. Reauthorize if access expires. If a protected folder is blocked, copy photos to an ordinary folder first. Do not select a drive root."
  },
  {
    "q": "Which features work on a phone?",
    "a": "Manage outfit codes, home schemes and camera favorites, parse photos or codes, and view resonance records and your wardrobe. Folder-based albums, automatic game outfit imports and targeted cleanup require a desktop browser with folder access."
  },
  {
    "q": "How do I move desktop data to my phone?",
    "a": "Choose Export all data under More on desktop, send the ZIP to your phone, open the site in its browser, and select Import all data under More. Data is merged according to module rules; review the result."
  },
  {
    "q": "Does cloud sync automatically sync everything?",
    "a": "No. It currently supports resonance records only and requires an account and manual upload or download. Upload overwrites the cloud save; download overwrites local resonance records. Signing in and local edits do not sync automatically."
  },
  {
    "q": "Why do some wardrobe pieces show Unknown?",
    "a": "Ownership data from sources such as Starlit Shop, clothing shops, Mira Crown, Surprise-O-Matic and world quests may be absent from the import. Unrecognized pieces show Unknown instead of being assumed unowned."
  },
  {
    "q": "Can I restore deleted photos?",
    "a": "Regular album deletion moves photos to Recently Deleted for restoration. Permanent deletion, clearing Recently Deleted and targeted cleanup modify local files and cannot be restored through Recently Deleted."
  }
],
      readme: 'Read the full README', report: 'Feedback on Xiaohongshu',
      footerLine: 'A little place for every lovely moment.', disclaimer: 'Independent community project · Not affiliated with or endorsed by Infinity Nikki',
      themeLight: 'Light theme', themeDark: 'Dark theme', languageLabel: 'Switch language',
      openImage: 'Open interface preview', closeImage: 'Close image preview', menuOpen: 'Open navigation menu', menuClose: 'Close navigation menu',
      imageModalLabel: 'Full-size app interface preview', appUnavailableNote: 'If the main site is temporarily unavailable, try the alternate site.'
    })


function getMotionElement<T extends HTMLElement>(instance: unknown): T | null {
  const candidate = instance instanceof HTMLElement
    ? instance
    : instance && typeof instance === 'object' && '$el' in instance
      ? (instance as { $el: unknown }).$el
      : null
  return candidate instanceof HTMLElement ? candidate as T : null
}

/**
 * 堆叠位移以「容器宽度的百分比」为基准，而不是固定像素 —— 否则屏幕越窄
 * 卡片越小、位移占比越大，堆叠会显得格外突兀（宽屏反而几乎看不出）。
 * 这里记住 .art-gallery 的实测宽度，供 galleryCardMotion 换算。
 */
const artGalleryWidth = ref(0)

function setArtGalleryEl(instance: unknown): void {
  artGalleryEl = getMotionElement<HTMLDivElement>(instance)
  syncArtGalleryWidth()
}
let artGalleryEl: HTMLElement | null = null

function syncArtGalleryWidth(): void {
  const width = artGalleryEl?.offsetWidth ?? 0
  if (width) artGalleryWidth.value = width
}

/**
 * 每层位移步长 = 容器宽 × 3.2%，并夹在 12~30px 之间。
 * 上下限是为了兜住 900px 断点处 .art-gallery 由「栅格列宽」切成
 * 「固定 680px 居中」带来的容器宽度跳变（那里容器反而变宽）。
 */
const galleryStackStep = computed(() => {
  const width = artGalleryWidth.value
  if (!width) return 12
  return Math.min(30, Math.max(12, width * 0.032))
})

function setHeroRegion(instance: unknown): void {
  heroRegion.value = getMotionElement<HTMLDivElement>(instance)
}

function setTheme(value: Theme): void {
  theme.value = value
  document.documentElement.dataset.theme = value
  try { localStorage.setItem('nikki-website-theme', value) } catch { /* Theme still applies for this session. */ }
}

function toggleTheme(): void {
  setTheme(theme.value === 'light' ? 'dark' : 'light')
}

function setLanguage(value: Language): void {
  language.value = value
  document.documentElement.lang = value === 'zh' ? 'zh-CN' : 'en'
  // 标签页标题中英文统一，不再随语言切换
  document.title = '暖立方（Nikki³）｜无限暖暖工具集'
  document.querySelector('meta[name="description"]')?.setAttribute('content', value === 'zh'
    ? '暖立方（Nikki³）是无限暖暖玩家工具集，提供无限暖暖相册管理、搭配码解析、家园方案管理、相机参数收藏与共鸣记录统计。查看功能介绍、使用指南并进入在线工具。'
    : 'NikkiCube (Nikki³) is an Infinity Nikki toolkit for photo albums, outfit codes, home plans, camera presets and resonance records. Explore features, guides and the online app.')
  try { localStorage.setItem('nikki-website-language', value) } catch { /* Language still applies for this session. */ }
  mobileMenuOpen.value = false
}

function closeMenu(): void {
  mobileMenuOpen.value = false
}

function galleryOffset(slot: number): number {
  return (slot - 1 - activeGalleryIndex.value + gallerySlideCount) % gallerySlideCount
}

/**
 * 首屏轮播：多张图不会同时参与合成 —— 只有「当前」与「下一张」两层参与过渡，
 * 其余隐藏。下一张从轻微放大状态淡入，当前图同时淡出，形成无缝交叉溶解。
 * 用「目标索引 - 当前索引」的环形差值判断相对关系，循环到头时同样成立。
 */
function heroSlideState(index: number): 'current' | 'next' | 'hidden' {
  const count = heroSlideCount.value
  if (!count) return 'hidden'
  const delta = ((index - activeHeroSlide.value) % count + count) % count
  return delta === 0 ? 'current' : delta === 1 ? 'next' : 'hidden'
}

function setHeroSlide(index: number): void {
  const count = heroSlideCount.value
  if (!count) return
  activeHeroSlide.value = (index % count + count) % count
}

function showNextHeroSlide(): void {
  setHeroSlide(activeHeroSlide.value + 1)
}

function showNextHeroSlideForTimer(): void {
  showNextHeroSlide()
}

function probeAvailable(slots: string[], onHit: (slot: number) => void, onDone: () => void, priorityFor: (slot: number) => 'high' | 'low' = () => 'low'): void {
  let cursor = 0, active = 0, remaining = slots.length
  if (!remaining) { onDone(); return }
  const pump = () => {
    if (imageLoadingStopped) return
    while (active < 2 && cursor < slots.length) {
      const index = cursor++, slot = index + 1, image = new Image()
      active++
      image.setAttribute('fetchpriority', priorityFor(slot))
      const settle = (success: boolean) => {
        image.onload = image.onerror = null
        active--; remaining--
        if (imageLoadingStopped) return
        if (success) onHit(slot)
        if (!remaining) onDone(); else pump()
      }
      image.onload = () => settle(true)
      image.onerror = () => settle(false)
      setImageRequest(image, slots[index]!, '(max-width: 900px) 100vw, 75vw')
    }
  }
  pump()
}

/**
 * 探测首屏某一主题组（浅色 1~10 / 深色 11~20）。
 *
 * 优先级策略：前 2 张给 high —— 第 1 张是首屏的 LCP，第 2 张 3 秒后就要用；
 * 其余 6 张给 low，只做预热，不去和 JS/CSS/字体抢带宽。
 */
function probeHeroSlides(group: Theme): void {
  const slots = group === 'dark' ? heroSlidesDark : heroSlidesLight
  const base = heroSlotBase(group)
  const markProbed = (): void => { heroProbed.value = { ...heroProbed.value, [group]: true } }

  probeAvailable(
    slots,
    (slot) => {
      heroAvailable.value = { ...heroAvailable.value, [base + slot - 1]: true }
      // 第 1 张一到就解锁渲染，不再等整组探测跑完 ——
      // 否则 heroVisibleSlides 会一直返回空数组，首屏要空等整组全部下载完才显示第一张。
      // 仍以「第 1 张」而不是「任何一张」为解锁条件：并发下图片可能乱序到达，
      // 若第 5 张先到就拿它当首图、随后第 1 张到了再换一次，会出现可见闪动。
      if (slot === 1) markProbed()
    },
    markProbed,
    (slot) => (slot <= 2 ? 'high' : 'low')
  )
}

const galleryRequested = new Set<number>()
const galleryPending: number[] = []
let galleryActiveRequests = 0
function pumpGallery(): void {
  if (imageLoadingStopped) return
  while (galleryActiveRequests < 2 && galleryPending.length) {
    const slot = galleryPending.shift()!, image = new Image()
    galleryActiveRequests++
    image.setAttribute('fetchpriority', 'low')
    const settle = (success: boolean) => {
      image.onload = image.onerror = null
      galleryActiveRequests--
      if (imageLoadingStopped) return
      if (success) galleryAvailable.value = { ...galleryAvailable.value, [slot]: true }
      pumpGallery()
    }
    image.onload = () => settle(true)
    image.onerror = () => settle(false)
    setImageRequest(image, galleryPhotoSlots[slot - 1]!, '(max-width: 900px) 90vw, 50vw')
  }
}
function probeGallerySlides(): void {
  if (!galleryStarted.value) return
  const wanted = Array.from({ length: Math.min(5, gallerySlideCount) }, (_, offset) => (activeGalleryIndex.value + offset) % gallerySlideCount + 1)
  for (const slot of wanted) {
    if (galleryRequested.has(slot)) continue
    galleryRequested.add(slot); galleryPending.push(slot)
  }
  galleryPending.sort((a,b) => (a-1-activeGalleryIndex.value+gallerySlideCount)%gallerySlideCount - (b-1-activeGalleryIndex.value+gallerySlideCount)%gallerySlideCount)
  pumpGallery()
}
watch(activeGalleryIndex, probeGallerySlides)
function startGalleryLoading(): void { galleryStarted.value = true; probeGallerySlides() }

/**
 * 首屏轮播的渲染列表：附上 state。
 * 只让「当前」与「下一张」进入 DOM，其余直接跳过，避免多张大图同时占合成层。
 */
const heroSlideItems = computed(() => heroVisibleSlides.value
  .map((src, index) => ({ src, index, state: heroSlideState(index) }))
  .filter(item => item.state !== 'hidden'))

// 主题切换时照片组整体变化：索引归零，并确保该主题那一组已完成探测。
watch(theme, (next) => {
  activeHeroSlide.value = 0
  if (!heroProbed.value[next]) probeHeroSlides(next)
})

watch(heroCanAutoplay, (enabled) => {
  if (heroTimer !== undefined) {
    window.clearInterval(heroTimer)
    heroTimer = undefined
  }
  if (enabled) heroTimer = window.setInterval(showNextHeroSlideForTimer, HERO_SLIDE_INTERVAL)
})

/**
 * 堆叠卡片的位移与缩放。x / y 基于容器宽度的百分比步长（见 galleryStackStep），
 * 这样各屏幕宽度下的位移占比一致；scale / opacity 本就是比例量，天然均一。
 */
function galleryCardMotion(slot: number): Record<string, number> {
  const offset = galleryOffset(slot)
  const step = galleryStackStep.value
  return {
    x: offset * step,
    y: offset * step * 0.75,
    scale: 1 - offset * 0.06,
    opacity: 1 - offset * 0.14
  }
}

function galleryCardLayer(slot: number): number {
  return gallerySlideCount - galleryOffset(slot)
}

function setGallerySlide(index: number): void {
  activeGalleryIndex.value = (index + gallerySlideCount) % gallerySlideCount
}

/**
 * 用户手动切图（点箭头 / 点小圆点 / 按左右方向键）。
 * 纯粹只是「换一张」，不改变播放状态，之后从新位置接着播。
 * 顺带把定时器重置一次，避免刚点完立刻又被切走。
 */
function setGallerySlideByUser(index: number): void {
  setGallerySlide(index)
  restartGalleryTimer()
}

function showNextGallerySlide(): void {
  setGallerySlide(activeGalleryIndex.value + 1)
}

function showNextGallerySlideByUser(): void {
  setGallerySlideByUser(activeGalleryIndex.value + 1)
}

function showPreviousGallerySlideByUser(): void {
  setGallerySlideByUser(activeGalleryIndex.value - 1)
}

function handleGalleryKeydown(event: KeyboardEvent): void {
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    showPreviousGallerySlideByUser()
  } else if (event.key === 'ArrowRight') {
    event.preventDefault()
    showNextGallerySlideByUser()
  }
}

function handleMotionPreferenceChange(event: MediaQueryListEvent): void {
  prefersReducedMotion.value = event.matches
}

function handleVisibilityChange(): void {
  pageVisible.value = document.visibilityState === 'visible'
}

function showNextGallerySlideForTimer(): void {
  showNextGallerySlide()
}

/**
 * 按当前播放条件重建定时器。手动切图后调它，
 * 让 2 秒的倒计时从用户操作那一刻重新开始，而不是接着上一次的残余时间。
 */
function restartGalleryTimer(): void {
  if (galleryTimer !== undefined) {
    window.clearInterval(galleryTimer)
    galleryTimer = undefined
  }
  if (galleryCanAutoplay.value) {
    galleryTimer = window.setInterval(showNextGallerySlideForTimer, GALLERY_SLIDE_INTERVAL)
  }
}

watch(galleryCanAutoplay, () => { restartGalleryTimer() })

function updateActiveSection(): void {
  const activationLine = (document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 72) + 48
  let current: string = 'top'
  for (const id of navigationSections) {
    const section = document.getElementById(id)
    if (section && section.getBoundingClientRect().top <= activationLine) current = id
  }
  if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) current = 'faq'
  activeSection.value = current
}

function requestSectionUpdate(): void {
  if (sectionUpdateFrame !== undefined) return
  sectionUpdateFrame = window.requestAnimationFrame(() => {
    sectionUpdateFrame = undefined
    updateActiveSection()
  })
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') mobileMenuOpen.value = false
}

onMounted(async () => {
  let savedTheme: string | null = null
  let savedLanguage: string | null = null
  try {
    savedTheme = localStorage.getItem('nikki-website-theme')
    savedLanguage = localStorage.getItem('nikki-website-language')
  } catch { /* Defaults remain available when storage is disabled. */ }
  if (savedTheme === 'light' || savedTheme === 'dark') theme.value = savedTheme
  if (savedLanguage === 'zh' || savedLanguage === 'en') language.value = savedLanguage
  document.documentElement.dataset.theme = theme.value
  setLanguage(language.value)
  motionPreferenceQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  prefersReducedMotion.value = motionPreferenceQuery.matches
  motionPreferenceQuery.addEventListener('change', handleMotionPreferenceChange)
  pageVisible.value = document.visibilityState === 'visible'
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('scroll', requestSectionUpdate, { passive: true })
  window.addEventListener('resize', requestSectionUpdate)
  window.addEventListener('hashchange', requestSectionUpdate)
  // 当前主题这一组先探测，另一组等切到该主题时再探测，避免无谓请求。
  probeHeroSlides(theme.value)
  await nextTick()
  const galleryRegion = document.getElementById('gallery')
  if (galleryRegion && 'IntersectionObserver' in window) {
    galleryLoadObserver = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return
      startGalleryLoading(); galleryLoadObserver?.disconnect()
    }, { rootMargin: '600px 0px' })
    galleryLoadObserver.observe(galleryRegion)
  } else startGalleryLoading()
  if ('IntersectionObserver' in window) {
    if (heroRegion.value) {
      heroObserver = new IntersectionObserver(([entry]) => {
        heroInView.value = entry?.isIntersecting ?? false
      }, { threshold: 0.08 })
      heroObserver.observe(heroRegion.value)
    }
  }
  pageReady.value = true
  requestSectionUpdate()
})

/**
 * 监听 .art-gallery 的尺寸变化，同步堆叠位移的基准宽度。
 * 窗口缩放、断点切换都会触发，保证位移占比始终一致。
 */
let artGalleryObserver: ResizeObserver | undefined

onMounted(() => {
  // 构建时没有浏览器尺寸 API，挂载后才建立观察器。
  artGalleryObserver = new ResizeObserver(() => { syncArtGalleryWidth() })
  if (artGalleryEl) artGalleryObserver.observe(artGalleryEl)
  else nextTick(() => { if (artGalleryEl) artGalleryObserver?.observe(artGalleryEl) })
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (galleryTimer !== undefined) window.clearInterval(galleryTimer)
  if (heroTimer !== undefined) window.clearInterval(heroTimer)
  motionPreferenceQuery?.removeEventListener('change', handleMotionPreferenceChange)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('scroll', requestSectionUpdate)
  window.removeEventListener('resize', requestSectionUpdate)
  window.removeEventListener('hashchange', requestSectionUpdate)
  if (sectionUpdateFrame !== undefined) window.cancelAnimationFrame(sectionUpdateFrame)
  imageLoadingStopped = true
  galleryPending.length = 0
  galleryLoadObserver?.disconnect()
  heroObserver?.disconnect()
  artGalleryObserver?.disconnect()
})
</script>

<template>
  <MotionConfig reducedMotion="user">
  <div class="site-shell" :class="`theme-${theme}`">
    <a class="skip-link" href="#main">{{ language === 'zh' ? '跳转到主要内容' : 'Skip to content' }}</a>
    <motion.div class="reading-progress" aria-hidden="true" :style="{ scaleX: pageScrollProgress }" />
    <header class="site-header">
      <a class="brand" href="#top" :aria-label="language === 'zh' ? '暖立方首页' : 'NikkiCube home'" @click="closeMenu">
        <span class="brand-mark"><img src="/favicon.ico" alt="" /></span>
        <span class="brand-name">{{ language === 'zh' ? '暖立方' : 'NikkiCube' }}<small>{{ language === 'zh' ? '无限暖暖工具集' : 'Infinity Nikki Toolkit' }}</small></span>
      </a>
      <nav class="desktop-nav" :aria-label="language === 'zh' ? '页面导航' : 'Page navigation'">
        <a v-for="(id, index) in navigationSections" :key="id" :href="`#${id}`" :class="{ active: activeSection === id }" :aria-current="activeSection === id ? 'location' : undefined">{{ copy.nav[index] }}</a>
      </nav>
      <div class="header-tools">
        <div class="language-switch" role="group" :aria-label="copy.languageLabel">
          <button :class="{ selected: language === 'zh' }" :aria-pressed="language === 'zh'" @click="setLanguage('zh')">中</button>
          <button :class="{ selected: language === 'en' }" :aria-pressed="language === 'en'" @click="setLanguage('en')">EN</button>
        </div>
        <button class="icon-button theme-toggle" :aria-label="theme === 'light' ? copy.themeDark : copy.themeLight" :title="theme === 'light' ? copy.themeDark : copy.themeLight" @click="toggleTheme">
          <Moon v-if="theme === 'light'" :size="18" />
          <Sun v-else :size="18" />
        </button>
        <a class="header-cta" :href="links.app" target="_blank" rel="noreferrer">{{ copy.useNow }} <ArrowUpRight :size="16" /></a>
        <button class="icon-button menu-toggle" :aria-label="mobileMenuOpen ? copy.menuClose : copy.menuOpen" :aria-expanded="mobileMenuOpen" aria-controls="mobile-navigation" @click="mobileMenuOpen = !mobileMenuOpen">
          <X v-if="mobileMenuOpen" :size="20" /><Menu v-else :size="20" />
        </button>
      </div>
      <Transition name="mobile-nav">
        <nav v-if="mobileMenuOpen" id="mobile-navigation" class="mobile-nav" :aria-label="language === 'zh' ? '页面导航' : 'Page navigation'">
          <a v-for="(id, index) in navigationSections" :key="id" :href="`#${id}`" :class="{ active: activeSection === id }" :aria-current="activeSection === id ? 'location' : undefined" @click="closeMenu">{{ copy.nav[index] }} <ArrowRight :size="16" /></a>
        </nav>
      </Transition>
    </header>

    <main id="main">
      <section id="top" ref="heroSection" class="hero-section">
        <div :ref="setHeroRegion" class="hero-art" :aria-label="copy.artHero">
          <motion.div class="hero-art-frame" :style="heroArtMotionStyle">
            <template v-if="heroHasPhoto">
              <img v-for="item in heroSlideItems" :key="item.src" class="hero-photo" :class="`hero-photo--${item.state}`" :src="item.src" :srcset="imageSrcset(item.src)" sizes="(max-width: 900px) 100vw, 75vw" decoding="async" :alt="item.state === 'current' ? `${copy.artHero} ${item.index + 1}` : ''" :aria-hidden="item.state === 'current' ? undefined : 'true'" />
            </template>
            <div v-else class="art-placeholder hero-placeholder">
              <Sparkles :size="26" stroke-width="1.4" />
              <span class="art-placeholder-title">{{ copy.artHero }}</span>
              <span class="art-placeholder-ratio">{{ copy.artRatioWide }}</span>
              <span class="art-placeholder-code">ASSET SLOT · HERO 16:9</span>
            </div>
          </motion.div>
        </div>
        <motion.div class="hero-copy" :initial="'hidden'" :animate="'visible'" :variants="heroVariants">
          <motion.span class="eyebrow" :variants="heroItemVariants"><span class="eyebrow-dot"></span>{{ copy.eyebrow }}</motion.span>
          <motion.h1 :variants="heroItemVariants">{{ copy.title }}</motion.h1>
          <motion.p class="hero-description" :variants="heroItemVariants">{{ copy.heroBody }}</motion.p>
          <motion.div class="hero-actions" :variants="heroItemVariants">
            <a class="button-primary" :href="links.app" target="_blank" rel="noreferrer"><ArrowUpRight :size="18" />{{ copy.useNow }}</a>
            <a class="button-secondary" href="#screenshots">{{ copy.viewFeatures }} <ArrowDown :size="16" /></a>
          </motion.div>
          <motion.p class="hero-note" :variants="heroItemVariants"><Sparkles :size="14" /> {{ copy.heroNote }}</motion.p>
        </motion.div>
        <!-- aria-hidden：数字每几秒就变一次，读屏软件会不停打断，所以整块保持装饰性 -->
        <div v-if="heroHasPhoto" class="hero-index" aria-hidden="true"><span>{{ heroIndexCurrent }}</span><i></i><span>{{ heroIndexTotal }}</span></div>
      </section>

      <motion.section class="trust-strip" :aria-label="language === 'zh' ? '使用特点' : 'Product benefits'" :initial="'hidden'" :while-in-view="'visible'" :variants="featureGridVariants" :in-view-options="{ once: true, amount: 0.4 }">
        <motion.div v-for="(benefit, index) in copy.benefits" :key="index" class="trust-item" :variants="featureCardVariants"><span class="trust-icon"><component :is="trustIcons[index]" :size="19" aria-hidden="true" /></span><span><strong>{{ benefit.title }}</strong><small>{{ benefit.body }}</small></span></motion.div>
      </motion.section>

      <section id="screenshots" class="section showcase-section">
        <motion.div class="section-heading" v-bind="sectionReveal">
          <div><span class="eyebrow">{{ copy.previewKicker }}</span><h2>{{ copy.previewTitle }}</h2></div>
          <p>{{ copy.previewBody }}</p>
        </motion.div>
        <motion.div v-bind="sectionReveal">
          <FeatureShowcase :language="language" :reduced-motion="prefersReducedMotion" :app-url="links.app" :preload-ready="heroProbed[theme]" />
        </motion.div>
      </section>

      <div id="start" class="usage-guide" role="region" :aria-label="copy.nav[2]">
      <section class="section start-section" aria-labelledby="usage-guide-title">
        <motion.div class="start-header" v-bind="sectionReveal"><span class="eyebrow">{{ copy.startKicker }}</span><h2 id="usage-guide-title">{{ copy.startTitle }}</h2><p>{{ copy.startBody }}</p><a class="button-primary" :href="links.app" target="_blank" rel="noreferrer"><ArrowUpRight :size="18" />{{ copy.useNow }}</a><small>{{ copy.appUnavailableNote }} <a :href="links.fallback" target="_blank" rel="noreferrer">{{ language === 'zh' ? '备用网站' : 'Alternate site' }}</a></small></motion.div>
        <motion.ul class="steps-list guide-routes" :initial="'hidden'" :while-in-view="'visible'" :variants="featureGridVariants" :in-view-options="{ once: true, amount: 0.25 }">
          <motion.li v-for="step in copy.startSteps" :key="step.no" :variants="featureCardVariants"><span>{{ step.no }}</span><div><h3>{{ step.title }}</h3><p>{{ step.body }}</p></div><ArrowRight :size="18" /></motion.li>
        </motion.ul>
      </section>

      <section id="outfit-code-guide" class="tutorial-band">
        <div class="section tutorial-inner">
          <motion.div class="tutorial-copy" v-bind="sectionReveal">
            <span class="eyebrow">{{ copy.tutorialKicker }}</span>
            <h2>{{ copy.tutorialTitle }}</h2>
            <p class="tutorial-intro">{{ copy.tutorialBody }}</p>
            <ol class="tutorial-steps">
              <li v-for="step in copy.tutorialSteps" :key="step.no">
                <span class="tutorial-step-number">{{ step.no }}</span>
                <div><h3>{{ step.title }}</h3><p>{{ step.body }}</p></div>
              </li>
            </ol>
            <p class="tutorial-note"><CircleHelp :size="18" />{{ copy.tutorialNote }}</p>
            <a class="button-primary tutorial-cta" :href="links.app" target="_blank" rel="noreferrer"><ArrowUpRight :size="18" />{{ copy.tutorialAppLink }}</a>
          </motion.div>
          <motion.figure class="tutorial-figure" v-bind="sectionReveal">
            <a class="tutorial-figure-link" :href="imageSource('/images/auto-update-outfit-code.webp')" target="_blank" rel="noreferrer" :aria-label="copy.tutorialImageOpen">
              <img class="tutorial-image" :src="imageSource('/images/auto-update-outfit-code.webp')" :srcset="imageSrcset('/images/auto-update-outfit-code.webp')" sizes="(max-width: 900px) 90vw, 440px" loading="lazy" decoding="async" :alt="copy.tutorialImageAlt" />
            </a>
            <figcaption>{{ copy.tutorialImageCaption }}</figcaption>
          </motion.figure>
        </div>
      </section>

      </div>

      <section id="gallery" class="gallery-band">
        <div class="section gallery-inner">
          <motion.div class="gallery-copy" v-bind="sectionReveal"><span class="eyebrow">{{ copy.galleryKicker }}</span><h2>{{ copy.galleryTitle }}</h2><p>{{ copy.galleryBody }}</p></motion.div>
          <motion.div class="gallery-carousel" role="region" tabindex="0" :aria-label="copy.galleryLabel" v-bind="sectionReveal" @keydown="handleGalleryKeydown">
            <div :ref="setArtGalleryEl" class="art-gallery" aria-live="off">
              <motion.div v-for="slot in gallerySlideCount" :key="slot" class="art-placeholder gallery-card" :class="{ 'has-photo': galleryAvailable[slot] }" :style="{ zIndex: galleryCardLayer(slot) }" :animate="galleryCardMotion(slot)" :transition="{ type: 'spring', stiffness: 140, damping: 24, mass: 0.8 }" role="group" aria-roledescription="slide" :aria-label="copy.gallerySlide(slot)" :aria-hidden="slot - 1 !== activeGalleryIndex ? 'true' : 'false'">
                <img v-if="galleryAvailable[slot]" class="gallery-photo" :src="galleryPhotoSlots[slot - 1]" :srcset="imageSrcset(galleryPhotoSlots[slot - 1]!)" sizes="(max-width: 900px) 90vw, 50vw" decoding="async" :alt="`${copy.artPortrait} ${slot}`" />
                <template v-else>
                  <Sparkles :size="22" />
                  <span class="art-placeholder-title">{{ copy.artPortrait }}</span>
                  <span class="art-placeholder-ratio">{{ copy.artRatioPortrait }}</span>
                  <span class="art-placeholder-code">GALLERY {{ String(slot).padStart(2, '0') }} · 16:10</span>
                </template>
              </motion.div>
            </div>
            <div class="gallery-controls" role="group" :aria-label="copy.galleryControlsLabel">
              <div class="gallery-step-controls">
                <button class="gallery-arrow" type="button" :aria-label="copy.galleryPrevious" @click="showPreviousGallerySlideByUser"><ChevronLeft :size="18" /></button>
                <div class="gallery-dots">
                  <button v-for="slot in gallerySlideCount" :key="slot" class="gallery-dot" type="button" :class="{ active: activeGalleryIndex === slot - 1 }" :aria-label="copy.gallerySlide(slot)" :aria-pressed="activeGalleryIndex === slot - 1" @click="setGallerySlideByUser(slot - 1)"></button>
                </div>
                <button class="gallery-arrow" type="button" :aria-label="copy.galleryNext" @click="showNextGallerySlideByUser"><ChevronRight :size="18" /></button>
              </div>
              <button class="gallery-autoplay" type="button" :aria-label="prefersReducedMotion ? copy.galleryMotionOff : galleryAutoplayActive ? copy.galleryPause : copy.galleryPlay" :title="prefersReducedMotion ? copy.galleryMotionOff : galleryAutoplayActive ? copy.galleryPause : copy.galleryPlay" :aria-pressed="galleryAutoplayActive" :disabled="prefersReducedMotion" @click="galleryAutoplayRequested = !galleryAutoplayRequested">
                <Pause v-if="galleryAutoplayActive" :size="16" />
                <Play v-else :size="16" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="faq" class="faq-section">
        <div class="section faq-inner">
          <motion.div class="faq-heading" v-bind="sectionReveal"><span class="eyebrow">{{ copy.questionsKicker }}</span><h2>{{ copy.questionsTitle }}</h2><p><CircleHelp :size="17" /> {{ language === 'zh' ? '遇到问题？' : 'Need more help?' }} <a :href="links.feedback" target="_blank" rel="noreferrer">{{ copy.report }}</a></p></motion.div>
          <motion.div class="faq-list" v-bind="sectionReveal">
            <motion.details v-for="item in copy.questions" :key="item.q" :layout="!prefersReducedMotion" :transition="{ layout: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } }"><summary>{{ item.q }}<ChevronDown :size="18" /></summary><p>{{ item.a }}</p></motion.details>
          </motion.div>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="footer-main">
        <a class="brand footer-brand" href="#top"><span class="brand-mark"><img src="/favicon.ico" alt="" /></span><span class="brand-name">{{ language === 'zh' ? '暖立方' : 'NikkiCube' }}<small>{{ language === 'zh' ? '无限暖暖工具集' : 'Infinity Nikki Toolkit' }}</small></span></a>
        <p>{{ copy.footerLine }}</p>
        <a class="back-top" href="#top" :aria-label="language === 'zh' ? '返回顶部' : 'Back to top'"><ArrowDown :size="17" /></a>
      </div>
      <div class="footer-bottom"><span>© {{ new Date().getFullYear() }} NikkiCube</span><span>{{ copy.disclaimer }}</span><div class="footer-links"><a :href="links.github" target="_blank" rel="noreferrer">GitHub <ExternalLink :size="13" /></a><a :href="links.gitee" target="_blank" rel="noreferrer">Gitee <ExternalLink :size="13" /></a><a :href="links.app" target="_blank" rel="noreferrer">{{ language === 'zh' ? '访问' : 'Visit app' }} <ExternalLink :size="13" /></a><a :href="language === 'zh' ? links.githubReadme : links.giteeReadme" target="_blank" rel="noreferrer"><BookOpen :size="13" /> README</a></div></div>
    </footer>

  </div>
  </MotionConfig>
</template>
