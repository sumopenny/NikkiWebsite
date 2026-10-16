<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ArrowUpRight, Check, ChevronDown, House, Images, ScanSearch, Shirt, Sparkles, X } from 'lucide-vue-next'
import { motion, useMotionValue, useSpring, useTransform } from 'motion-v'
import { showcaseCategories, showcaseSupport, showcaseUi, type CategoryId, type Language } from '../data/showcase'

const props = defineProps<{ language: Language; reducedMotion: boolean; appUrl: string }>()
const categoryIcons = { album: Images, outfit: Shirt, home: House, resonance: Sparkles, tools: ScanSearch }
const activeCategoryId = ref<CategoryId>('album')
const rememberedViews = ref<Record<string, string>>(Object.fromEntries(showcaseCategories.map(category => [category.id, category.defaultViewId])))
const category = computed(() => showcaseCategories.find(item => item.id === activeCategoryId.value)!)
const view = computed(() => category.value.views.find(item => item.id === rememberedViews.value[category.value.id]) ?? category.value.views[0]!)
const viewNumber = computed(() => category.value.views.indexOf(view.value) + 1)
const imageState = ref<'loading' | 'ready' | 'failed'>('loading')
const imageReady = computed(() => !!view.value.image && imageState.value === 'ready')
const dialog = ref<HTMLDialogElement | null>(null)
const previewImage = ref<HTMLImageElement | null>(null)
// 弹窗不参与静态正文；接管完成后再挂载到 body，避免 Teleport 水合错位。
const mounted = ref(false)
onMounted(() => {
  mounted.value = true
  // 预渲染图片可能在事件绑定前已下载完成，补读状态以恢复放大入口。
  const image = previewImage.value
  if (image?.complete) imageState.value = image.naturalWidth > 0 ? 'ready' : 'failed'
})
const closeButton = ref<HTMLButtonElement | null>(null)
let trigger: HTMLButtonElement | null = null
let previousOverflow: string | null = null
const pointerX = useMotionValue(0)
const pointerY = useMotionValue(0)
const smoothPointerX = useSpring(pointerX, { stiffness: 180, damping: 24, mass: 0.55 })
const smoothPointerY = useSpring(pointerY, { stiffness: 180, damping: 24, mass: 0.55 })
const rotateX = useTransform(smoothPointerY, [-1, 1], [2.2, -2.2])
const rotateY = useTransform(smoothPointerX, [-1, 1], [-2.2, 2.2])

function resetTilt(): void { pointerX.set(0); pointerY.set(0) }
function movePointer(event: PointerEvent): void {
  if (event.pointerType !== 'mouse' || props.reducedMotion) return
  const bounds = (event.currentTarget as HTMLElement).getBoundingClientRect()
  if (!bounds.width || !bounds.height) return
  pointerX.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 2)
  pointerY.set(((event.clientY - bounds.top) / bounds.height - 0.5) * 2)
}
function chooseView(id: string): void { rememberedViews.value[category.value.id] = id }
function moveSelection(event: KeyboardEvent, kind: 'category' | 'view'): void {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
  const group = event.currentTarget as HTMLElement
  const buttons = Array.from(group.querySelectorAll<HTMLButtonElement>('button'))
  const index = buttons.indexOf(event.target as HTMLButtonElement)
  if (index < 0) return
  event.preventDefault()
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length
  const button = buttons[next]!
  if (kind === 'category') activeCategoryId.value = button.dataset.category as CategoryId
  else chooseView(button.dataset.view!)
  button.focus()
}
async function openImage(event: MouseEvent): Promise<void> {
  if (!imageReady.value || !dialog.value) return
  trigger = event.currentTarget as HTMLButtonElement
  previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  dialog.value.showModal()
  await nextTick()
  closeButton.value?.focus()
}
function restoreDialog(): void {
  if (previousOverflow !== null) document.body.style.overflow = previousOverflow
  previousOverflow = null
  trigger?.focus({ preventScroll: true })
  trigger = null
}
function closeImage(): void { dialog.value?.close() }
function imageLoaded(event: Event): void {
  if ((event.target as HTMLImageElement).dataset.viewId === view.value.id) imageState.value = 'ready'
}
function failImage(event: Event): void {
  if ((event.target as HTMLImageElement).dataset.viewId !== view.value.id) return
  imageState.value = 'failed'
  if (dialog.value?.open) closeImage()
}
watch(() => view.value.id, () => { imageState.value = 'loading'; resetTilt() })
watch(() => props.reducedMotion, reduced => { if (reduced) resetTilt() })
onBeforeUnmount(() => { dialog.value?.close(); restoreDialog() })
</script>

<template>
  <div class="feature-showcase">
    <div class="showcase-categories" role="group" :aria-label="showcaseUi.categoriesLabel[language]" @keydown="moveSelection($event, 'category')">
      <button v-for="item in showcaseCategories" :key="item.id" type="button" :data-category="item.id" :aria-pressed="activeCategoryId === item.id" :class="{ active: activeCategoryId === item.id }" @click="activeCategoryId = item.id">
        <component :is="categoryIcons[item.id]" :size="18" aria-hidden="true" />
        <span>{{ item.label[language] }}</span><span class="category-count">{{ item.views.length }}</span>
      </button>
    </div>
    <div class="showcase-layout">
      <div class="showcase-preview-column">
        <!-- Keep the original image shell, 16:10 crop, hover tilt and screenshot transition. -->
        <motion.button v-if="view.image && imageState !== 'failed'" type="button" class="showcase-image-button" :aria-label="`${showcaseUi.openImage[language]}: ${view.caption[language]}`" :aria-disabled="!imageReady" :style="{ rotateX, rotateY, transformPerspective: 1200 }" :while-hover="reducedMotion ? undefined : { scale: 1.008 }" @pointermove="movePointer" @pointerleave="resetTilt" @click="openImage">
          <Transition name="screenshot-switch" mode="out-in">
            <img ref="previewImage" :key="view.id" :data-view-id="view.id" :src="view.image" :alt="view.alt[language]" decoding="async" @load="imageLoaded" @error="failImage" />
          </Transition>
          <span v-if="imageReady" class="image-open-hint"><ArrowUpRight :size="17" /> {{ showcaseUi.openImage[language] }}</span>
        </motion.button>
        <div v-else class="showcase-schematic" role="img" :aria-label="view.alt[language]">
          <div class="schematic-window">
            <div class="schematic-chrome"><span><component :is="categoryIcons[category.id]" :size="15" /> Nikki³</span><span aria-hidden="true">● ● ●</span></div>
            <div class="schematic-content">
              <component :is="categoryIcons[category.id]" :size="32" stroke-width="1.6" aria-hidden="true" />
              <strong>{{ view.schematicTitle[language] }}</strong>
              <div class="schematic-items"><span v-for="item in view.schematicItems[language]" :key="item">{{ item }}</span></div>
            </div>
          </div>
        </div>
        <div class="showcase-caption" aria-live="polite" aria-atomic="true"><span>{{ view.caption[language] }}</span><span>{{ viewNumber }} / {{ category.views.length }}</span></div>
        <div class="showcase-views" role="group" :aria-label="showcaseUi.viewsLabel[language]" @keydown="moveSelection($event, 'view')">
          <button v-for="item in category.views" :key="item.id" type="button" :data-view="item.id" :aria-pressed="view.id === item.id" :class="{ active: view.id === item.id }" @click="chooseView(item.id)">{{ item.label[language] }}</button>
        </div>
      </div>
      <div class="showcase-side showcase-description">
        <span class="eyebrow">{{ category.eyebrow }} · {{ category.label[language] }}</span>
        <h3>{{ view.title[language] }}</h3>
        <p>{{ view.body[language] }}</p>
        <ul class="showcase-points"><li v-for="point in view.points[language]" :key="point"><Check :size="16" aria-hidden="true" /><span>{{ point }}</span></li></ul>
        <p v-if="view.note[language]" class="showcase-note">{{ view.note[language] }}</p>
        <a class="text-link showcase-app-link" :href="appUrl" target="_blank" rel="noreferrer">{{ showcaseUi.openApp[language] }} <ArrowUpRight :size="15" /></a>
      </div>
    </div>
    <details class="showcase-support">
      <summary>{{ showcaseSupport.title[language] }}<ChevronDown :size="18" aria-hidden="true" /></summary>
      <div class="showcase-support-grid"><div v-for="item in showcaseSupport.items" :key="item.title.en"><h4>{{ item.title[language] }}</h4><p>{{ item.body[language] }}</p></div></div>
      <p class="showcase-cloud-status">{{ showcaseSupport.cloudStatus[language] }}</p>
    </details>
    <Teleport v-if="mounted" to="body">
      <dialog ref="dialog" class="lightbox showcase-dialog" :aria-label="showcaseUi.dialogLabel[language]" @click.self="closeImage" @close="restoreDialog" @keydown.tab.prevent="closeButton?.focus()">
        <button ref="closeButton" type="button" class="icon-button lightbox-close" :aria-label="showcaseUi.closeImage[language]" @click="closeImage"><X :size="21" /></button>
        <img v-if="view.image" :data-view-id="view.id" :src="view.image" :alt="view.alt[language]" @error="failImage" />
      </dialog>
    </Teleport>
  </div>
</template>

<style scoped>
.showcase-categories { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 26px; }
.showcase-categories button, .showcase-views button { min-height: 44px; border: 1px solid var(--line); background: var(--surface); color: var(--ink-soft); cursor: pointer; transition: background .2s ease, color .2s ease; }
.showcase-categories button { display: inline-flex; align-items: center; gap: 9px; padding: 10px 16px; border-radius: 12px; font-size: 14px; font-weight: 650; }
.showcase-categories button:hover, .showcase-views button:hover { background: var(--surface-soft); }
.showcase-categories button.active, .showcase-views button.active { border-color: var(--accent-deep); background: var(--accent-soft); color: var(--accent-deep); }
.category-count { font-size: 12px; opacity: .75; }
.showcase-layout { align-items: start; }
.showcase-preview-column { min-width: 0; }
.showcase-image-button { width: 100%; }
.showcase-image-button img { object-position: center; }
.showcase-caption { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 6px 16px; margin: 14px 2px 12px; color: var(--muted); font-size: 12px; line-height: 1.6; }
.showcase-caption > span:first-child { color: var(--ink-soft); font-weight: 650; }
.showcase-views { display: flex; flex-wrap: wrap; gap: 7px; }
.showcase-views button { padding: 9px 13px; border-radius: 10px; font-size: 13px; line-height: 1.45; }
.showcase-description > p { font-size: 14px; line-height: 1.85; }
.showcase-points { display: grid; gap: 12px; margin: 22px 0; padding: 0; list-style: none; }
.showcase-points li { display: flex; align-items: flex-start; gap: 9px; color: var(--ink-soft); font-size: 14px; line-height: 1.65; }
.showcase-points svg { flex-shrink: 0; margin-top: 4px; color: var(--accent-deep); }
.showcase-description > .showcase-note { padding: 12px 14px; border-left: 2px solid var(--line); background: var(--surface-soft); font-size: 13px; }
.showcase-app-link { margin-top: 22px; }
.showcase-support { margin-top: 30px; border-block: 1px solid var(--line); }
.showcase-support summary { display: flex; align-items: center; justify-content: space-between; min-height: 56px; gap: 12px; cursor: pointer; color: var(--ink-soft); font-size: 14px; font-weight: 650; list-style: none; }
.showcase-support summary::-webkit-details-marker { display: none; }
.showcase-support[open] summary svg { transform: rotate(180deg); }
.showcase-support-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 22px; padding: 8px 0 20px; }
.showcase-support h4 { margin: 0 0 8px; font-size: 14px; color: var(--ink); }
.showcase-support p { margin: 0; font-size: 13px; line-height: 1.8; color: var(--muted); }
.showcase-support .showcase-cloud-status { padding-bottom: 18px; }
.showcase-schematic { display: grid; width: 100%; aspect-ratio: 16 / 10; place-items: center; padding: clamp(14px, 3vw, 36px); border: 1px solid var(--line); border-radius: 24px; background: var(--surface-soft); }
.schematic-window { width: 100%; border: 1px solid var(--line); border-radius: 7px; background: var(--surface); }
.schematic-chrome { display: flex; justify-content: space-between; gap: 10px; padding: 12px 16px; border-bottom: 1px solid var(--line); color: var(--muted); font-size: 12px; }
.schematic-chrome > span:first-child { display: inline-flex; align-items: center; gap: 7px; }
.schematic-content { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: clamp(18px, 3vw, 36px) 16px; text-align: center; color: var(--accent-deep); }
.schematic-content strong { font-size: clamp(17px, 1.6vw, 23px); color: var(--ink); line-height: 1.5; }
.schematic-items { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
.schematic-items span { padding: 6px 10px; border-radius: 6px; background: var(--surface-soft); color: var(--ink-soft); font-size: 12px; line-height: 1.5; }
/* Native dialog focus handling; retain the original full-size image presentation. */
.showcase-dialog { width: 100vw; height: 100dvh; max-width: none; max-height: none; margin: 0; border: 0; }
.showcase-dialog:not([open]) { display: none; }
.showcase-dialog::backdrop { background: transparent; }
@media (max-width: 900px) { .showcase-support-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 640px) {
  .showcase-categories { gap: 7px; margin-bottom: 20px; }
  .showcase-categories button { gap: 6px; padding: 9px 11px; font-size: 13px; }
  .showcase-layout { gap: 24px; }
  .showcase-description { padding: 0; }
  .showcase-support-grid { grid-template-columns: 1fr; gap: 20px; }
  .showcase-schematic { aspect-ratio: auto; min-height: 240px; }
}
@media (prefers-reduced-motion: reduce) { .showcase-categories button, .showcase-views button { transition: none; } }
</style>
