<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Component } from 'vue'
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ExternalLink,
  FileImage,
  Heart,
  Menu,
  Moon,
  Pause,
  Play,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  Upload,
  WandSparkles,
  X
} from 'lucide-vue-next'
import { MotionConfig, motion, useMotionValue, useScroll, useSpring, useTransform } from 'motion-v'
import ScreenshotPreviewPlaceholder from './components/ScreenshotPreviewPlaceholder.vue'

type Language = 'zh' | 'en'
type Theme = 'light' | 'dark'
type ScreenshotKind = 'album-timeline' | 'outfit-library' | 'outfit-editor' | 'outfit-code' | 'image-parameters' | 'lucky-times'
type ScreenshotPreview = {
  src: string | null
  title: Record<Language, string>
  alt: Record<Language, string>
  icon: Component
  kind?: ScreenshotKind
}

// 真实素材路径：把同名 jpeg 放进 public/images/ 对应子目录即可自动启用。
// 必须用 import.meta.env.BASE_URL（而不是写死的 /images/）拼前缀：
// 部署到 GitHub Pages 子路径时 BASE_URL 是 '/NikkiWebsite/'，本地开发是 '/',
// 只有跟着 BASE_URL 走，两种环境下的图片路径才都正确。
const assetPath = (file: string): string => `${import.meta.env.BASE_URL}images/${file}`
/** 品牌图标同理：站内 <img> 的 /favicon.ico 不会被 Vite 自动改写，需手动带上前缀。 */
const faviconUrl = `${import.meta.env.BASE_URL}favicon.ico`
/**
 * 首屏暖暖氛围美照轮播（16:9 横向原图，建议宽度 2400px+）。
 * 浅色模式读取 1.jpeg ~ 10.jpeg，深色模式读取 11.jpeg ~ 20.jpeg，各最多 10 张。
 *
 * 张数完全由目录里实际存在的文件决定：下面只列出「上限」10 个文件名，
 * 运行时逐个探测，**存在的都会被收集**，缺号不会中断探测
 * （例如只有 1、3、5 就是 3 张，全部会播）。位数不用补零（用 1.jpeg 而非 01.jpeg）。
 */
const HERO_SLIDE_LIMIT = 10
const heroSlidesLight: string[] = Array.from({ length: HERO_SLIDE_LIMIT }, (_, index) => assetPath(`${index + 1}.jpeg`))
const heroSlidesDark: string[] = Array.from({ length: HERO_SLIDE_LIMIT }, (_, index) => assetPath(`${index + 11}.jpeg`))
/**
 * 画廊美照（16:10 横向原图，建议宽度 2000px+），顺序即轮播顺序。
 * 堆叠卡片固定 10 张（保持原有堆叠转场），每张卡各自探测对应文件是否存在：
 * 有图就显示照片，没有就显示占位骨架。
 */
const GALLERY_SLIDE_LIMIT = 10
const galleryPhotoSlots: string[] = Array.from({ length: GALLERY_SLIDE_LIMIT }, (_, index) => assetPath(`gallery-${index + 1}.jpeg`))
/** 画廊探测结果：第 N 个卡位是否有真实照片。 */
const galleryAvailable = ref<Record<number, boolean>>({})
/**
 * 应用界面截图（16:10 原图），统一放在 public/images/screenshots/ 下。
 * 命名规则：`序号-英文短名.jpeg`，序号与下方 screenshots 数组（页面展示顺序）一一对应。
 */
const screenshotPhotos: Record<ScreenshotKind, string> = {
  'album-timeline': assetPath('screenshots/1-album-timeline.jpg'),
  'outfit-library': assetPath('screenshots/2-outfit-library.jpg'),
  'outfit-editor': assetPath('screenshots/3-outfit-editor.jpg'),
  'outfit-code': assetPath('screenshots/4-outfit-code.jpg'),
  'image-parameters': assetPath('screenshots/5-image-parameters.jpg'),
  'lucky-times': assetPath('screenshots/6-lucky-times.jpg')
}
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
const HERO_SLIDE_INTERVAL = 3000
/** ★ 画廊轮播切换间隔（毫秒），默认 2 秒。 */
const GALLERY_SLIDE_INTERVAL = 2000

const language = ref<Language>('zh')
const theme = ref<Theme>('light')
const mobileMenuOpen = ref(false)
const activeShotIndex = ref(0)
const activeGalleryIndex = ref(0)
/**
 * 画廊自动播放唯一的暂停开关：由播放/暂停按钮切换。
 * 悬停、聚焦、滚出视口、手动切图都**不**再暂停 —— 只有这个标记会。
 */
const galleryAutoplayRequested = ref(true)
const pageVisible = ref(true)
const pageReady = ref(false)
const prefersReducedMotion = ref(false)
const lightboxOpen = ref(false)
const activeSection = ref('')
const activeHeroSlide = ref(0)
const heroInView = ref(true)
const heroSection = ref<HTMLElement | null>(null)
const heroRegion = ref<HTMLElement | null>(null)
const screenshotTabList = ref<HTMLElement | null>(null)
const lightboxTrigger = ref<HTMLButtonElement | null>(null)
const lightboxCloseButton = ref<HTMLButtonElement | null>(null)
let sectionObserver: IntersectionObserver | undefined
let heroObserver: IntersectionObserver | undefined
let galleryTimer: number | undefined
let heroTimer: number | undefined
let motionPreferenceQuery: MediaQueryList | undefined

const { scrollYProgress: pageScrollProgress } = useScroll()
const heroScroll = useScroll({ target: heroSection, offset: ['start start', 'end start'] })
const heroParallax = useTransform(heroScroll.scrollYProgress, [0, 1], [0, 22])
const pointerX = useMotionValue(0)
const pointerY = useMotionValue(0)
const smoothPointerX = useSpring(pointerX, { stiffness: 180, damping: 24, mass: 0.55 })
const smoothPointerY = useSpring(pointerY, { stiffness: 180, damping: 24, mass: 0.55 })
const screenshotRotateX = useTransform(smoothPointerY, [-1, 1], [2.2, -2.2])
const screenshotRotateY = useTransform(smoothPointerX, [-1, 1], [-2.2, 2.2])
const heroArtMotionStyle = computed(() => ({ y: prefersReducedMotion.value ? 0 : heroParallax }))
/**
 * 探测结果：实际存在的前 N 张。key 是「第几张」（从 1 开始），
 * 浅色组 1~10、深色组 11~20 都走这一个 map，互不干扰。
 */
const heroAvailable = ref<Record<number, boolean>>({})
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
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  inViewOptions: { once: true, amount: 0.14 },
  transition: { duration: 0.68, ease: [0.22, 1, 0.36, 1] }
} as const
const heroVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1], delayChildren: 0.08, staggerChildren: 0.08 } }
}
const heroItemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }
}
const featureGridVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.075, delayChildren: 0.06 } }
}
const featureCardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.58, ease: [0.22, 1, 0.36, 1] } }
}

const links = {
  app: 'https://infinity-nikki-album-manager.pages.dev/',
  fallback: 'https://infinity-nikki-album-manager.vercel.app/',
  github: 'https://github.com/sumopenny/Infinity-Nikki-Album-Manager',
  githubReleases: 'https://github.com/sumopenny/Infinity-Nikki-Album-Manager/releases',
  githubIssues: 'https://github.com/sumopenny/Infinity-Nikki-Album-Manager/issues',
  githubReadme: 'https://github.com/sumopenny/Infinity-Nikki-Album-Manager/blob/main/README.md',
  gitee: 'https://gitee.com/sumopenny/Infinity-Nikki-Album-Manager',
  giteeReleases: 'https://gitee.com/sumopenny/Infinity-Nikki-Album-Manager/releases',
  giteeReadme: 'https://gitee.com/sumopenny/Infinity-Nikki-Album-Manager/blob/master/README.md'
}

const screenshots: ScreenshotPreview[] = [
  { src: null, title: { zh: '相册时间轴', en: 'Album timeline' }, alt: { zh: '相册管理界面与照片时间轴', en: 'Album manager with a photo timeline' }, icon: CalendarDays, kind: 'album-timeline' },
  { src: null, title: { zh: '搭配方案', en: 'Outfit library' }, alt: { zh: '搭配码方案管理界面', en: 'Outfit code library interface' }, icon: WandSparkles, kind: 'outfit-library' },
  { src: null, title: { zh: '方案编辑', en: 'Outfit editor' }, alt: { zh: '搭配方案编辑界面', en: 'Outfit plan editor interface' }, icon: FileImage, kind: 'outfit-editor' },
  { src: null, title: { zh: '搭配码解析', en: 'Outfit code parser' }, alt: { zh: '搭配码解析界面素材位，等待真实截图', en: 'Outfit code parser screenshot slot, awaiting the real interface' }, icon: ScanSearch, kind: 'outfit-code' },
  { src: null, title: { zh: '图片参数解析', en: 'Photo parameter parser' }, alt: { zh: '图片参数解析界面素材位，等待真实截图', en: 'Photo parameter parser screenshot slot, awaiting the real interface' }, icon: FileImage, kind: 'image-parameters' },
  { src: null, title: { zh: '抽卡吉时', en: 'Lucky pull times' }, alt: { zh: '抽卡吉时界面素材位，等待真实截图', en: 'Lucky pull times screenshot slot, awaiting the real interface' }, icon: Sparkles, kind: 'lucky-times' }
]

/** 素材位对应的真实截图路径；留空（null）时继续显示占位骨架。 */
function screenshotPhoto(shot: ScreenshotPreview): string | null {
  return shot.kind ? screenshotPhotos[shot.kind] : null
}

const copy = computed(() => language.value === 'zh'
  ? {
      nav: ['界面预览', '功能', '快速开始', '常见问题'],
      eyebrow: 'INFINITY NIKKI · LOCAL ALBUM STUDIO',
      title: '把每一段心动，\n好好收进相册。',
      heroBody: '为 无限暖暖 玩家打造的本地相册与搭配管理工具。浏览、收藏、解析和整理游戏照片，让珍贵瞬间留在自己的设备里。',
      useNow: '打开网站',
      viewFeatures: '看看它能做什么',
      heroNote: '免费使用 · 无需注册 · 无需下载',
      artHero: '首屏暖暖氛围美照',
      artRatioWide: '轮播 · 浅色 1-10 / 深色 11-20 · 16:9 横向原图 · 宽度 2400px+',
      local: '照片在本地读取', localBody: '浏览、解析与整理过程在你的设备中完成。',
      privacy: '搭配码 / 图片解析 / 专项清理', privacyBody: '解析相机参数、管理搭配码，清理低质文件和游戏缓存。',
      actions: '抽卡吉时参考', actionsBody: '查看娱乐向时刻表，实际出率仍以游戏概率为准。',
      previewKicker: 'A LITTLE LOOK INSIDE',
      previewTitle: '从相册时光，到趁手的小工具。',
      previewBody: '切换预览，浏览相册时间轴、搭配方案、搭配码解析、图片参数解析与抽卡吉时。',
      shotHint: '点击缩略图切换预览，点击大图放大查看',
      previewShotLabel: '真实应用界面', previewPlaceholderLabel: '截图素材位',
      previewAssetNote: '真实应用截图待提供', previewAssetRatio: '建议原图比例 16:10',
      galleryKicker: 'YOUR WORLD, YOUR WALLPAPER',
      galleryTitle: '留一块位置，给你镜头里的暖暖。',
      galleryBody: '尽情欣赏暖暖美照，让官网也像一本小小的旅途画册。',
      artPortrait: '暖暖游戏美照', artRatioPortrait: '建议比例 16:10 · 横幅原图',
      galleryLabel: '暖暖美照轮播', gallerySlide: (index: number) => `第 ${index} 张，共 ${gallerySlideCount} 张`,
      galleryControlsLabel: '画廊控制', galleryPrevious: '上一张美照', galleryNext: '下一张美照',
      galleryPause: '暂停自动播放', galleryPlay: '继续自动播放', galleryMotionOff: '系统减少动态效果已关闭自动播放',
      featureKicker: 'MADE FOR YOUR ALBUM',
      featureTitle: '从整理照片，到珍藏灵感。',
      featureIntro: '常用能力一目了然，打开主应用即可开始整理。',
      featureGroups: [
        { icon: CalendarDays, no: '01', title: '按时间，找回那一刻', body: '按年、月、日整理照片，折叠时间轴并快速跳转。用搜索找到文件名或备注，通过收藏、筛选和批量选择整理照片。大图预览支持缩放、拖动和键盘翻页。', items: ['时间轴与日期跳转', '搜索、备注和收藏', '多比例缩略图和大图预览'] },
        { icon: WandSparkles, no: '02', title: '把喜欢的搭配，也收好', body: '保存搭配图片、搭配码、备注和标签；管理待填写方案，自动接收游戏新搭配图。支持 ZIP 备份与合并导入，JPG/PNG 图片在本地转换为 WebP。', items: ['搭配码解析与复制', '标签、备注和待填写方案', 'ZIP 导入导出与自动接收'] },
        { icon: ScanSearch, no: '03', title: '读懂镜头背后的参数', body: '从照片查看拍摄时间、天气、焦距、光圈、画面调整、动作、灯光与滤镜，并读取可导入游戏的相机参数。也支持从电脑或手机临时选择原图解析，照片不会上传或加入相册。', items: ['照片相机参数解析', '原图本地临时解析', '搭配码独立解析工具'] },
        { icon: Heart, no: '04', title: '小工具和项目动态，都在手边', body: '查看当前版本的抽卡吉时表（仅供娱乐，概率以游戏为准）、站内帮助、更新记录，并从应用内提交反馈。', items: ['抽卡吉时表', '使用帮助与版本更新', '反馈入口和开源仓库'] },
        { icon: ShieldCheck, no: '05', title: '清理之前，先看清范围', body: '专项清理可处理低画质照片、截图、崩溃快照、运行日志和游戏内置浏览器缓存。需要授权 X6Game 文件夹，并在执行前展示清理范围。', items: ['低画质照片与截图', '崩溃记录、日志、网页缓存', '清理范围与后果说明'] },
        { icon: Upload, no: '06', title: '导入、导出，都有章法', body: '批量导入本地图片，也可以导出整本相册或选中的照片。导出成功后可选择把源照片移入最近删除；中途取消时会保留源照片。', items: ['批量导入与进度提示', '整本或选中照片导出', '取消时保留源文件'] },
        { icon: Trash2, no: '07', title: '删错了，还能找回来', body: '普通删除会将照片移入当前相册的 trash 文件夹，可预览、恢复或手动永久删除。恢复遇到重名文件会自动改名，不覆盖已有照片。', items: ['最近删除与恢复', '重名保护', '永久删除需要确认'] }
      ],
      startKicker: 'READY WHEN YOU ARE',
      startTitle: '从打开应用开始，把相册交还给自己。',
      startBody: '电脑端使用 Chromium 内核的浏览器，选择存放照片的目录即可开始。手机端无法使用相册管理功能，但可以使用参数与搭配码解析工具。',
      startSteps: [
        { no: '01', title: '打开应用', body: '访问在线网站，使用 Chromium 内核的浏览器。' },
        { no: '02', title: '选择照片目录', body: '选择存放照片的目录，不要选择磁盘根目录或游戏安装上级目录。' },
        { no: '03', title: '开始整理', body: '浏览、收藏、解析或管理搭配方案；离开时可随时撤销网站权限。' }
      ],
      questionsKicker: 'GOOD TO KNOW',
      questionsTitle: '开始前，几个常见问题。',
      questions: [
        { q: '照片会上传到服务器吗？', a: '不会。照片浏览与相机参数解析在本地浏览器/WASM 中处理，所选原图也只会临时读取，不上传、不加入相册。' },
        { q: '为什么浏览器没有显示相册？', a: '请使用 Chromium 内核的浏览器，并选择存放照片的目录。浏览器授权失效时，需要重新选择文件夹。' },
        { q: '删除的照片能恢复吗？', a: '相册普通删除会移入 trash，可在最近删除恢复。最近删除的永久删除和专项清理会直接修改电脑文件，无法恢复。' },
        { q: '手机上可以使用吗？', a: '手机端无法使用相册管理功能，但可以使用参数与搭配码解析工具。' },
        { q: '项目是官方应用吗？', a: '不是。这是独立的开源社区工具，与《无限暖暖》官方及其发行方没有隶属、授权或背书关系。' }
      ],
      readme: '阅读完整 README', report: '反馈问题',
      footerLine: '为每一张心动留个位置。', disclaimer: '独立社区项目 · 与《无限暖暖》官方无隶属或背书关系',
      themeLight: '浅色主题', themeDark: '深色主题', languageLabel: '切换语言',
      openImage: '放大查看界面预览', closeImage: '关闭图片预览', menuOpen: '打开导航菜单', menuClose: '关闭导航菜单',
      imageModalLabel: '应用界面大图预览', appUnavailableNote: '若主站暂时无法访问，可试用备用站点。'
    }
  : {
      nav: ['Screenshots', 'Features', 'Get started', 'FAQ'],
      eyebrow: 'INFINITY NIKKI · LOCAL ALBUM STUDIO',
      title: 'Keep every lovely\nmoment close.',
      heroBody: 'A local-first photo and outfit manager for Infinity Nikki. Browse, save, parse, and organize your in-game memories right on your device.',
      useNow: 'Open the app', viewFeatures: 'Explore the features', heroNote: 'Free to use · No sign-up · No download',
      artHero: 'Infinity Nikki hero artwork', artRatioWide: 'Carousel · light 1-10 / dark 11-20 · 16:9 landscape · 2400px+ wide',
      local: 'Photos stay on device', localBody: 'Browsing, parsing, and organizing happen in your browser.',
      privacy: 'Outfit codes / image parsing / cleanup', privacyBody: 'Parse camera settings, manage outfit codes, and clear low-quality files and caches.',
      actions: 'Lucky pull times', actionsBody: 'Check an entertainment-only timing table; actual odds follow the game.',
      previewKicker: 'A LITTLE LOOK INSIDE',
      previewTitle: 'From album memories to handy little tools.',
      previewBody: 'Switch previews to explore the album timeline, outfit library, outfit code parser, photo parameters, and lucky pull times.',
      shotHint: 'Choose a thumbnail to switch views, then open the preview',
      previewShotLabel: 'REAL APP INTERFACE', previewPlaceholderLabel: 'SCREENSHOT SLOT',
      previewAssetNote: 'Real app screenshot to come', previewAssetRatio: 'Suggested source ratio: 16:10',
      galleryKicker: 'YOUR WORLD, YOUR WALLPAPER', galleryTitle: 'A little space for Nikki in your frame.',
      galleryBody: "Enjoy Nikki's beautiful photos, and let this site feel like a little travel album.",
      artPortrait: 'Infinity Nikki in-game photo', artRatioPortrait: 'Suggested 16:10 landscape original',
      galleryLabel: 'Infinity Nikki photo carousel', gallerySlide: (index: number) => `Image ${index} of ${gallerySlideCount}`,
      galleryControlsLabel: 'Gallery controls', galleryPrevious: 'Previous photo', galleryNext: 'Next photo',
      galleryPause: 'Pause autoplay', galleryPlay: 'Resume autoplay', galleryMotionOff: 'Autoplay is off because reduced motion is enabled',
      featureKicker: 'MADE FOR YOUR ALBUM', featureTitle: 'From organizing photos to keeping inspiration.',
      featureIntro: 'Everyday tools at a glance. Open the app when you are ready.',
      featureGroups: [
        { icon: CalendarDays, no: '01', title: 'Find the moment by date', body: 'Browse photos by year, month, and day with a collapsible timeline. Search filenames or notes, filter favorites, and select items in batches. Full-size previews support zoom, pan, and keyboard navigation.', items: ['Timeline and date jump', 'Search, notes, and favorites', 'Thumbnail ratios and full-size preview'] },
        { icon: WandSparkles, no: '02', title: 'Keep your outfit ideas together', body: 'Save outfit images, codes, notes, and tags; manage pending plans and automatically receive new in-game outfit images. ZIP backups merge without replacing existing plans. JPG and PNG convert to WebP locally.', items: ['Parse and copy outfit codes', 'Tags, notes, and pending plans', 'ZIP backup and automatic intake'] },
        { icon: ScanSearch, no: '03', title: 'Read the details behind a shot', body: 'Inspect capture time, weather, focal length, aperture, image adjustments, poses, lights, and filters. You can also temporarily select an original image on desktop or phone; it is not uploaded or added to the album.', items: ['Camera parameter parsing', 'Temporary local original parsing', 'Separate outfit code parser'] },
        { icon: Heart, no: '04', title: 'Useful extras, always close by', body: 'Check the current entertainment-only lucky pull timing table (game odds still apply), in-app help, release history, and issue feedback.', items: ['Lucky pull times', 'Help and release history', 'Feedback and open-source repository'] },
        { icon: ShieldCheck, no: '05', title: 'Know the scope before cleanup', body: 'Special Cleanup can remove low-quality photos, screenshots, crash snapshots, runtime logs, and the game’s built-in browser cache. It requires X6Game folder access and explains the selected scope first.', items: ['Low-quality photos and screenshots', 'Crash records, logs, and web cache', 'Clear scope and impact'] },
        { icon: Upload, no: '06', title: 'Import and export with care', body: 'Import local images in batches, then export an entire album or selected photos. After a successful export, you can move source photos to Recently Deleted. Cancelling keeps the originals.', items: ['Batch import with progress', 'Export all or selected photos', 'Source files stay when cancelled'] },
        { icon: Trash2, no: '07', title: 'Recover a photo you removed', body: 'Regular deletes move photos to the current album’s trash folder, where you can preview, restore, or permanently delete them. Name conflicts are renamed on restore, never overwritten.', items: ['Recently Deleted and restore', 'Name conflict protection', 'Confirmation before permanent deletion'] }
      ],
      startKicker: 'READY WHEN YOU ARE', startTitle: 'Open the app and make your album yours.',
      startBody: 'On desktop, use a Chromium-based browser and choose the folder where your photos are stored. Album management is unavailable on mobile, but parameter and outfit-code parsing still works.',
      startSteps: [
        { no: '01', title: 'Open the app', body: 'Visit the website in a Chromium-based browser.' },
        { no: '02', title: 'Choose your photo folder', body: 'Select the folder where your photos are stored. Do not select a drive root or parent game folder.' },
        { no: '03', title: 'Start organizing', body: 'Browse, save, parse, or manage outfits. You can revoke the website’s folder access at any time.' }
      ],
      questionsKicker: 'GOOD TO KNOW', questionsTitle: 'A few things before you begin.',
      questions: [
        { q: 'Are my photos uploaded?', a: 'No. Photo browsing and camera parameter parsing run locally in the browser/WASM. An original you select is read temporarily; it is not uploaded or added to the album.' },
        { q: 'Why is my album empty?', a: 'Use a Chromium-based browser and select the folder where your photos are stored. If access expires, choose the folder again.' },
        { q: 'Can I restore deleted photos?', a: 'Regular album deletes move to trash and can be restored. Permanent deletion in Recently Deleted and Special Cleanup directly affect local files and cannot be undone.' },
        { q: 'Can I use it on a phone?', a: 'Album management is unavailable on mobile, but parameter and outfit-code parsing tools can be used there.' },
        { q: 'Is this an official app?', a: 'No. This is an independent open-source community tool. It is not affiliated with, authorized, or endorsed by the Infinity Nikki team or publisher.' }
      ],
      readme: 'Read the full README', report: 'Report an issue',
      footerLine: 'A little place for every lovely moment.', disclaimer: 'Independent community project · Not affiliated with or endorsed by Infinity Nikki',
      themeLight: 'Light theme', themeDark: 'Dark theme', languageLabel: 'Switch language',
      openImage: 'Open interface preview', closeImage: 'Close image preview', menuOpen: 'Open navigation menu', menuClose: 'Close navigation menu',
      imageModalLabel: 'Full-size app interface preview', appUnavailableNote: 'If the main site is temporarily unavailable, try the alternate site.'
    })

const currentScreenshot = computed(() => screenshots[activeShotIndex.value]!)

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

function setLightboxTrigger(instance: unknown): void {
  lightboxTrigger.value = getMotionElement<HTMLButtonElement>(instance)
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
  document.title = value === 'zh'
    ? '暖立方 Nikki³ | 为每一张心动留个位置'
    : 'NikkiCube | Infinity Nikki Toolkit'
  document.querySelector('meta[name="description"]')?.setAttribute('content', value === 'zh'
    ? '为《无限暖暖》玩家打造的本地相册与搭配管理工具。整理、收藏、解析和清理游戏照片，文件留在自己的设备中。'
    : 'A local-first photo and outfit manager for Infinity Nikki. Organize, save, parse, and clean up game photos on your own device.')
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

/**
 * 通用素材探测：把清单里的每个文件名都试一遍，某个缺失**不会**中断后续探测。
 * 于是「实际张数」= 目录里存在的所有文件数，允许中间跳号
 * （例如只有 1、3、5，三张都会播，而不是只播第 1 张）。
 * 每张之间仍保持原有的先后顺序，只是不再遇缺即停。
 * 探测用的 Image 与模板中的图同 URL，浏览器缓存命中，不会重复下载。
 */
function probeAvailable(slots: string[], onHit: (slot: number) => void, onDone: () => void): void {
  let index = 0

  const step = (): void => {
    if (index >= slots.length) {
      onDone()
      return
    }
    const image = new Image()
    const slot = index + 1
    image.onload = () => {
      onHit(slot)
      index += 1
      step()
    }
    // 缺失就跳过这一张，继续探测下一个，不再中断整轮探测
    image.onerror = () => {
      index += 1
      step()
    }
    image.src = slots[index]!
  }

  step()
}

/** 探测首屏某一主题组（浅色 1~10 / 深色 11~20）。 */
function probeHeroSlides(group: Theme): void {
  const slots = group === 'dark' ? heroSlidesDark : heroSlidesLight
  const base = heroSlotBase(group)
  probeAvailable(
    slots,
    (slot) => { heroAvailable.value = { ...heroAvailable.value, [base + slot - 1]: true } },
    () => { heroProbed.value = { ...heroProbed.value, [group]: true } }
  )
}

/**
 * 探测画廊美照：5 个卡位各自独立探测，互不影响（不做「遇缺即停」，
 * 因为卡位数量固定，缺哪张只让那一张显示占位骨架）。
 */
function probeGallerySlides(): void {
  galleryPhotoSlots.forEach((src, index) => {
    const slot = index + 1
    const image = new Image()
    image.onload = () => { galleryAvailable.value = { ...galleryAvailable.value, [slot]: true } }
    image.src = src
  })
}

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

function handleScreenshotKeydown(event: KeyboardEvent, index: number): void {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
  event.preventDefault()
  const direction = event.key === 'ArrowRight' ? 1 : -1
  activeShotIndex.value = (index + direction + screenshots.length) % screenshots.length
  nextTick(() => screenshotTabList.value
    ?.querySelector<HTMLButtonElement>(`[data-shot-index="${activeShotIndex.value}"]`)
    ?.focus())
}

function handleScreenshotPointerMove(event: PointerEvent): void {
  if (event.pointerType !== 'mouse' || prefersReducedMotion.value) return
  const bounds = event.currentTarget instanceof HTMLElement
    ? event.currentTarget.getBoundingClientRect()
    : undefined
  if (!bounds?.width || !bounds.height) return
  pointerX.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 2)
  pointerY.set(((event.clientY - bounds.top) / bounds.height - 0.5) * 2)
}

function resetScreenshotTilt(): void {
  pointerX.set(0)
  pointerY.set(0)
}

function closeLightbox(): void {
  lightboxOpen.value = false
}

function handleMotionPreferenceChange(event: MediaQueryListEvent): void {
  prefersReducedMotion.value = event.matches
  if (event.matches) resetScreenshotTilt()
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

watch(lightboxOpen, async (open) => {
  await nextTick()
  if (open) lightboxCloseButton.value?.focus()
  else lightboxTrigger.value?.focus()
})

function handleKeydown(event: KeyboardEvent): void {
  if (lightboxOpen.value && event.key === 'Tab') {
    event.preventDefault()
    lightboxCloseButton.value?.focus()
    return
  }
  if (event.key === 'Escape') {
    if (lightboxOpen.value) closeLightbox()
    mobileMenuOpen.value = false
  }
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
  // 当前主题这一组先探测，另一组等切到该主题时再探测，避免无谓请求。
  probeHeroSlides(theme.value)
  probeGallerySlides()
  await nextTick()
  if ('IntersectionObserver' in window) {
    sectionObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const id = (entry.target as HTMLElement).id
        if (['features', 'screenshots', 'start', 'faq'].includes(id)) activeSection.value = id
      }
    }, { threshold: 0.1, rootMargin: '-18% 0px -60% 0px' })
    document.querySelectorAll('#features, #screenshots, #start, #faq').forEach((element) => sectionObserver?.observe(element))
    if (heroRegion.value) {
      heroObserver = new IntersectionObserver(([entry]) => {
        heroInView.value = entry?.isIntersecting ?? false
      }, { threshold: 0.08 })
      heroObserver.observe(heroRegion.value)
    }
  }
  pageReady.value = true
})

/**
 * 监听 .art-gallery 的尺寸变化，同步堆叠位移的基准宽度。
 * 窗口缩放、断点切换都会触发，保证位移占比始终一致。
 */
const artGalleryObserver = new ResizeObserver(() => { syncArtGalleryWidth() })

onMounted(() => {
  if (artGalleryEl) artGalleryObserver.observe(artGalleryEl)
  else nextTick(() => { if (artGalleryEl) artGalleryObserver.observe(artGalleryEl) })
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (galleryTimer !== undefined) window.clearInterval(galleryTimer)
  if (heroTimer !== undefined) window.clearInterval(heroTimer)
  motionPreferenceQuery?.removeEventListener('change', handleMotionPreferenceChange)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  sectionObserver?.disconnect()
  heroObserver?.disconnect()
  artGalleryObserver.disconnect()
})
</script>

<template>
  <MotionConfig reducedMotion="user">
  <div class="site-shell" :class="`theme-${theme}`">
    <a class="skip-link" href="#main">{{ language === 'zh' ? '跳转到主要内容' : 'Skip to content' }}</a>
    <motion.div class="reading-progress" aria-hidden="true" :style="{ scaleX: pageScrollProgress }" />
    <header class="site-header">
      <a class="brand" href="#top" :aria-label="language === 'zh' ? '暖立方首页' : 'NikkiCube home'" @click="closeMenu">
        <span class="brand-mark"><img :src="faviconUrl" alt="" /></span>
        <span class="brand-name">{{ language === 'zh' ? '暖立方' : 'NikkiCube' }}<small>{{ language === 'zh' ? '无限暖暖工具集' : 'Infinity Nikki Toolkit' }}</small></span>
      </a>
      <nav class="desktop-nav" :aria-label="language === 'zh' ? '页面导航' : 'Page navigation'">
        <a href="#screenshots" :class="{ active: activeSection === 'screenshots' }">{{ copy.nav[0] }}</a>
        <a href="#features" :class="{ active: activeSection === 'features' }">{{ copy.nav[1] }}</a>
        <a href="#start" :class="{ active: activeSection === 'start' }">{{ copy.nav[2] }}</a>
        <a href="#faq" :class="{ active: activeSection === 'faq' }">{{ copy.nav[3] }}</a>
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
          <a href="#screenshots" :class="{ active: activeSection === 'screenshots' }" @click="closeMenu">{{ copy.nav[0] }} <ArrowRight :size="16" /></a>
          <a href="#features" :class="{ active: activeSection === 'features' }" @click="closeMenu">{{ copy.nav[1] }} <ArrowRight :size="16" /></a>
          <a href="#start" :class="{ active: activeSection === 'start' }" @click="closeMenu">{{ copy.nav[2] }} <ArrowRight :size="16" /></a>
          <a href="#faq" :class="{ active: activeSection === 'faq' }" @click="closeMenu">{{ copy.nav[3] }} <ArrowRight :size="16" /></a>
        </nav>
      </Transition>
    </header>

    <main id="main">
      <section id="top" ref="heroSection" class="hero-section">
        <div :ref="setHeroRegion" class="hero-art" :aria-label="copy.artHero">
          <motion.div class="hero-art-frame" :style="heroArtMotionStyle">
            <template v-if="heroHasPhoto">
              <img v-for="item in heroSlideItems" :key="item.src" class="hero-photo" :class="`hero-photo--${item.state}`" :src="item.src" :alt="item.state === 'current' ? `${copy.artHero} ${item.index + 1}` : ''" :aria-hidden="item.state === 'current' ? undefined : 'true'" />
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
            <a class="button-secondary" href="#features">{{ copy.viewFeatures }} <ArrowDown :size="16" /></a>
          </motion.div>
          <motion.p class="hero-note" :variants="heroItemVariants"><Sparkles :size="14" /> {{ copy.heroNote }}</motion.p>
        </motion.div>
        <!-- aria-hidden：数字每几秒就变一次，读屏软件会不停打断，所以整块保持装饰性 -->
        <div v-if="heroHasPhoto" class="hero-index" aria-hidden="true"><span>{{ heroIndexCurrent }}</span><i></i><span>{{ heroIndexTotal }}</span></div>
      </section>

      <motion.section class="trust-strip" aria-label="Product principles" :initial="'hidden'" :while-in-view="'visible'" :variants="featureGridVariants" :in-view-options="{ once: true, amount: 0.4 }">
        <motion.div class="trust-item" :variants="featureCardVariants"><span class="trust-icon"><FileImage :size="19" /></span><span><strong>{{ copy.local }}</strong><small>{{ copy.localBody }}</small></span></motion.div>
        <motion.div class="trust-item" :variants="featureCardVariants"><span class="trust-icon"><ScanSearch :size="19" /></span><span><strong>{{ copy.privacy }}</strong><small>{{ copy.privacyBody }}</small></span></motion.div>
        <motion.div class="trust-item" :variants="featureCardVariants"><span class="trust-icon"><Sparkles :size="19" /></span><span><strong>{{ copy.actions }}</strong><small>{{ copy.actionsBody }}</small></span></motion.div>
      </motion.section>

      <section id="screenshots" class="section showcase-section">
        <motion.div class="section-heading" v-bind="sectionReveal">
          <div><span class="eyebrow">{{ copy.previewKicker }}</span><h2>{{ copy.previewTitle }}</h2></div>
          <p>{{ copy.previewBody }}</p>
        </motion.div>
        <motion.div class="showcase-layout" v-bind="sectionReveal">
          <motion.button :ref="setLightboxTrigger" class="showcase-image-button" :aria-label="`${copy.openImage}: ${currentScreenshot.title[language]}`" :style="{ rotateX: screenshotRotateX, rotateY: screenshotRotateY, transformPerspective: 1200 }" :while-hover="{ scale: 1.008 }" @pointermove="handleScreenshotPointerMove" @pointerleave="resetScreenshotTilt" @click="lightboxOpen = true">
            <Transition name="screenshot-switch" mode="out-in">
              <img v-if="currentScreenshot.src" :key="currentScreenshot.src" :src="currentScreenshot.src" :alt="currentScreenshot.alt[language]" />
              <ScreenshotPreviewPlaceholder v-else :key="currentScreenshot.title.en" :title="currentScreenshot.title[language]" :icon="currentScreenshot.icon" :kind="currentScreenshot.kind ?? 'outfit-code'" :slot-label="copy.previewPlaceholderLabel" :note="copy.previewAssetNote" :ratio="copy.previewAssetRatio" :src="screenshotPhoto(currentScreenshot)" :alt="currentScreenshot.alt[language]" />
            </Transition>
            <span class="image-open-hint"><ArrowUpRight :size="17" /> {{ copy.openImage }}</span>
          </motion.button>
          <div class="showcase-side">
            <span class="eyebrow">{{ currentScreenshot.src || currentScreenshot.kind ? copy.previewShotLabel : copy.previewPlaceholderLabel }}</span>
            <Transition name="screenshot-caption" mode="out-in"><h3 :key="currentScreenshot.title.en">{{ currentScreenshot.title[language] }}</h3></Transition>
            <p>{{ copy.shotHint }}</p>
            <div ref="screenshotTabList" class="shot-list" role="tablist" :aria-label="language === 'zh' ? '选择界面截图' : 'Choose a screenshot'">
              <button v-for="(shot, index) in screenshots" :key="shot.title.en" type="button" :data-shot-index="index" role="tab" :tabindex="activeShotIndex === index ? 0 : -1" :aria-selected="activeShotIndex === index" :class="{ active: activeShotIndex === index }" @click="activeShotIndex = index" @keydown="handleScreenshotKeydown($event, index)">
                <img v-if="shot.src || screenshotPhoto(shot)" :src="shot.src || screenshotPhoto(shot) || undefined" :alt="shot.alt[language]" />
                <span v-else class="shot-art-thumb" aria-hidden="true"><component :is="shot.icon" :size="18" /></span>
                <span class="shot-label">{{ shot.title[language] }}</span>
                <ArrowRight :size="16" />
              </button>
            </div>
            <a class="text-link" :href="links.app" target="_blank" rel="noreferrer">{{ copy.useNow }} <ArrowUpRight :size="15" /></a>
          </div>
        </motion.div>
      </section>

      <section id="gallery" class="gallery-band">
        <div class="section gallery-inner">
          <motion.div class="gallery-copy" v-bind="sectionReveal"><span class="eyebrow">{{ copy.galleryKicker }}</span><h2>{{ copy.galleryTitle }}</h2><p>{{ copy.galleryBody }}</p></motion.div>
          <motion.div class="gallery-carousel" role="region" tabindex="0" :aria-label="copy.galleryLabel" v-bind="sectionReveal" @keydown="handleGalleryKeydown">
            <div :ref="setArtGalleryEl" class="art-gallery" aria-live="off">
              <motion.div v-for="slot in gallerySlideCount" :key="slot" class="art-placeholder gallery-card" :class="{ 'has-photo': galleryAvailable[slot] }" :style="{ zIndex: galleryCardLayer(slot) }" :animate="galleryCardMotion(slot)" :transition="{ type: 'spring', stiffness: 140, damping: 24, mass: 0.8 }" role="group" aria-roledescription="slide" :aria-label="copy.gallerySlide(slot)" :aria-hidden="slot - 1 !== activeGalleryIndex ? 'true' : 'false'">
                <img v-if="galleryAvailable[slot]" class="gallery-photo" :src="galleryPhotoSlots[slot - 1]" :alt="`${copy.artPortrait} ${slot}`" />
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

      <section id="features" class="section feature-section">
        <motion.div class="section-heading" v-bind="sectionReveal">
          <div><span class="eyebrow">{{ copy.featureKicker }}</span><h2>{{ copy.featureTitle }}</h2></div>
          <p>{{ copy.featureIntro }}</p>
        </motion.div>
        <motion.div class="feature-grid" :initial="'hidden'" :while-in-view="'visible'" :variants="featureGridVariants" :in-view-options="{ once: true, amount: 0.12 }">
          <motion.article v-for="(feature, index) in copy.featureGroups" :key="feature.no" class="feature-item" :class="{ 'feature-item-lead': index < 2, 'feature-item-wide': index > 4 }" :variants="featureCardVariants">
            <div class="feature-top"><span class="feature-number">{{ feature.no }} / 07</span><component :is="feature.icon" :size="21" stroke-width="1.6" /></div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.body }}</p>
            <ul><li v-for="item in feature.items" :key="item"><Check :size="14" />{{ item }}</li></ul>
          </motion.article>
        </motion.div>
      </section>

      <section id="start" class="section start-section">
        <motion.div class="start-header" v-bind="sectionReveal"><span class="eyebrow">{{ copy.startKicker }}</span><h2>{{ copy.startTitle }}</h2><p>{{ copy.startBody }}</p><a class="button-primary" :href="links.app" target="_blank" rel="noreferrer"><ArrowUpRight :size="18" />{{ copy.useNow }}</a><small>{{ copy.appUnavailableNote }} <a :href="links.fallback" target="_blank" rel="noreferrer">{{ language === 'zh' ? '备用网站' : 'Alternate site' }}</a></small></motion.div>
        <motion.ol class="steps-list" :initial="'hidden'" :while-in-view="'visible'" :variants="featureGridVariants" :in-view-options="{ once: true, amount: 0.25 }">
          <motion.li v-for="step in copy.startSteps" :key="step.no" :variants="featureCardVariants"><span>{{ step.no }}</span><div><h3>{{ step.title }}</h3><p>{{ step.body }}</p></div><ArrowRight :size="18" /></motion.li>
        </motion.ol>
      </section>

      <section id="faq" class="faq-section">
        <div class="section faq-inner">
          <motion.div class="faq-heading" v-bind="sectionReveal"><span class="eyebrow">{{ copy.questionsKicker }}</span><h2>{{ copy.questionsTitle }}</h2><p><CircleHelp :size="17" /> {{ language === 'zh' ? '遇到问题？' : 'Need more help?' }} <a :href="links.githubIssues" target="_blank" rel="noreferrer">{{ copy.report }}</a></p></motion.div>
          <motion.div class="faq-list" v-bind="sectionReveal">
            <motion.details v-for="item in copy.questions" :key="item.q" :layout="!prefersReducedMotion" :transition="{ layout: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } }"><summary>{{ item.q }}<ChevronDown :size="18" /></summary><p>{{ item.a }}</p></motion.details>
          </motion.div>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="footer-main">
        <a class="brand footer-brand" href="#top"><span class="brand-mark"><img :src="faviconUrl" alt="" /></span><span class="brand-name">{{ language === 'zh' ? '暖立方' : 'NikkiCube' }}<small>{{ language === 'zh' ? '无限暖暖工具集' : 'Infinity Nikki Toolkit' }}</small></span></a>
        <p>{{ copy.footerLine }}</p>
        <a class="back-top" href="#top" :aria-label="language === 'zh' ? '返回顶部' : 'Back to top'"><ArrowDown :size="17" /></a>
      </div>
      <div class="footer-bottom"><span>© {{ new Date().getFullYear() }} NikkiCube</span><span>{{ copy.disclaimer }}</span><div class="footer-links"><a :href="links.github" target="_blank" rel="noreferrer">GitHub <ExternalLink :size="13" /></a><a :href="links.gitee" target="_blank" rel="noreferrer">Gitee <ExternalLink :size="13" /></a><a :href="links.app" target="_blank" rel="noreferrer">{{ language === 'zh' ? '访问' : 'Visit app' }} <ExternalLink :size="13" /></a><a :href="language === 'zh' ? links.githubReadme : links.giteeReadme" target="_blank" rel="noreferrer"><BookOpen :size="13" /> README</a></div></div>
    </footer>

    <Transition name="lightbox">
      <div v-if="lightboxOpen" class="lightbox" role="dialog" aria-modal="true" :aria-label="copy.imageModalLabel" @click.self="closeLightbox">
        <button ref="lightboxCloseButton" class="icon-button lightbox-close" :aria-label="copy.closeImage" @click="closeLightbox"><X :size="21" /></button>
        <img v-if="currentScreenshot.src" :src="currentScreenshot.src" :alt="currentScreenshot.alt[language]" />
        <ScreenshotPreviewPlaceholder v-else :title="currentScreenshot.title[language]" :icon="currentScreenshot.icon" :kind="currentScreenshot.kind ?? 'outfit-code'" :slot-label="copy.previewPlaceholderLabel" :note="copy.previewAssetNote" :ratio="copy.previewAssetRatio" :src="screenshotPhoto(currentScreenshot)" :alt="currentScreenshot.alt[language]" />
      </div>
    </Transition>
  </div>
  </MotionConfig>
</template>
