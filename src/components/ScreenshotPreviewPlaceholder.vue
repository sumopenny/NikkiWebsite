<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  title: string
  icon: Component
  kind: 'outfit-code' | 'image-parameters' | 'lucky-times'
  slotLabel: string
  note: string
  ratio: string
}>()
</script>

<template>
  <div class="preview-placeholder" :class="`preview-placeholder--${kind}`" role="img" :aria-label="`${title}. ${note}. ${ratio}.`">
    <div class="preview-placeholder__window" aria-hidden="true">
      <div class="preview-placeholder__chrome">
        <span class="preview-placeholder__brand"><component :is="icon" :size="15" /> Nikki³</span>
        <span class="preview-placeholder__controls"><i></i><i></i><i></i></span>
      </div>
      <div class="preview-placeholder__content">
        <span class="preview-placeholder__label">{{ slotLabel }}</span>
        <span class="preview-placeholder__icon"><component :is="icon" :size="28" stroke-width="1.6" /></span>
        <strong>{{ title }}</strong>
        <span class="preview-placeholder__note">{{ note }}</span>
        <span class="preview-placeholder__ratio">{{ ratio }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.preview-placeholder {
  --slot-accent: var(--accent-deep);
  --slot-tint: var(--accent-soft);
  display: grid;
  width: 100%;
  aspect-ratio: 1.55;
  place-items: center;
  overflow: hidden;
  padding: clamp(14px, 4vw, 42px);
  border: 1px solid var(--line);
  border-radius: 7px;
  background: var(--surface-soft);
}

.preview-placeholder--image-parameters {
  --slot-accent: var(--sun);
  --slot-tint: var(--sun-soft);
}

.preview-placeholder--lucky-times {
  --slot-accent: var(--mint);
  --slot-tint: var(--mint-soft);
}

.preview-placeholder__window {
  width: min(100%, 520px);
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 7px;
  background: var(--surface);
  box-shadow: 0 16px 38px rgba(76, 50, 60, .1);
}

.preview-placeholder__chrome {
  display: flex;
  min-height: 38px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 14px;
  border-bottom: 1px solid var(--line);
  color: var(--muted);
  font-size: 9px;
  font-weight: 700;
}

.preview-placeholder__brand,
.preview-placeholder__controls {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.preview-placeholder__brand svg {
  color: var(--slot-accent);
}

.preview-placeholder__controls i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--line-strong);
}

.preview-placeholder__controls i:first-child {
  background: var(--slot-accent);
}

.preview-placeholder__content {
  display: flex;
  min-height: 230px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 18px;
  text-align: center;
}

.preview-placeholder__label {
  color: var(--slot-accent);
  font-size: 10px;
  font-weight: 700;
}

.preview-placeholder__icon {
  display: grid;
  width: 52px;
  height: 52px;
  place-items: center;
  margin-top: 12px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--slot-tint);
  color: var(--slot-accent);
}

.preview-placeholder__content strong {
  margin-top: 10px;
  color: var(--ink);
  font-size: 16px;
  line-height: 1.4;
}

.preview-placeholder__note {
  margin-top: 5px;
  color: var(--ink-soft);
  font-size: 12px;
  line-height: 1.5;
}

.preview-placeholder__ratio {
  margin-top: 12px;
  padding: 5px 9px;
  border: 1px solid var(--line);
  border-radius: 4px;
  color: var(--muted);
  font-size: 10px;
  line-height: 1.3;
}

@media (max-width: 640px) {
  .preview-placeholder__chrome {
    min-height: 32px;
    padding-inline: 10px;
    font-size: 8px;
  }

  .preview-placeholder__content {
    min-height: 190px;
    padding: 16px 12px;
  }

  .preview-placeholder__content strong {
    font-size: 14px;
  }

  .preview-placeholder__note {
    font-size: 11px;
  }
}
</style>
