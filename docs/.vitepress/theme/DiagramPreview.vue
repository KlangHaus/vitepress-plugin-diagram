<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

const tab = ref<'preview' | 'code'>('preview')
const fullscreen = ref(false)
const overlay = ref<HTMLElement | null>(null)

// Pan & zoom state
let scale = 1
let panX = 0
let panY = 0
let isPanning = false
let startX = 0
let startY = 0

function openFullscreen() {
  scale = 1
  panX = 0
  panY = 0
  isPanning = false
  fullscreen.value = true
  nextTick(() => applyTransform())
  document.body.style.overflow = 'hidden'
}

function closeFullscreen() {
  fullscreen.value = false
  document.body.style.overflow = ''
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && fullscreen.value) closeFullscreen()
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})

function getSvgContainer(): HTMLElement | null {
  return overlay.value?.querySelector('.fs-svg-wrap') as HTMLElement | null
}

function applyTransform() {
  const el = getSvgContainer()
  if (el) el.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  const delta = e.deltaY > 0 ? 0.9 : 1.1
  scale = Math.min(Math.max(scale * delta, 0.1), 10)
  applyTransform()
}

function onPointerDown(e: PointerEvent) {
  isPanning = true
  startX = e.clientX - panX
  startY = e.clientY - panY
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!isPanning) return
  panX = e.clientX - startX
  panY = e.clientY - startY
  applyTransform()
}

function onPointerUp() {
  isPanning = false
}

function resetView() {
  scale = 1
  panX = 0
  panY = 0
  applyTransform()
}
</script>

<template>
  <div class="diagram-preview">
    <div class="dp-tabs">
      <button
        :class="['dp-tab', { active: tab === 'preview' }]"
        @click="tab = 'preview'"
      >Preview</button>
      <button
        :class="['dp-tab', { active: tab === 'code' }]"
        @click="tab = 'code'"
      >Code</button>
      <button
        class="dp-tab dp-fullscreen-btn"
        @click="openFullscreen"
        title="Fullscreen"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
      </button>
    </div>
    <div v-show="tab === 'preview'" class="dp-preview">
      <slot name="preview" />
    </div>
    <div v-show="tab === 'code'" class="dp-code">
      <slot name="code" />
    </div>
  </div>

  <Teleport to="body">
    <div
      v-if="fullscreen"
      ref="overlay"
      class="fs-overlay"
      @wheel.prevent="onWheel"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <div class="fs-toolbar" @pointerdown.stop @pointerup.stop>
        <button class="fs-btn" @click="resetView" title="Reset view">Reset</button>
        <button class="fs-btn" @click="closeFullscreen" title="Close (Esc)">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="fs-svg-wrap">
        <slot name="preview" />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.diagram-preview {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  margin: 16px 0;
}

.dp-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.dp-tab {
  padding: 6px 16px;
  border: none;
  background: none;
  color: var(--vp-c-text-3);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  font-family: var(--vp-font-family-base);
  transition: color 0.15s, border-color 0.15s;
}

.dp-tab:hover {
  color: var(--vp-c-text-2);
}

.dp-tab.active {
  color: var(--vp-c-brand-1);
  border-bottom-color: var(--vp-c-brand-1);
}

.dp-fullscreen-btn {
  margin-left: auto;
  display: flex;
  align-items: center;
  padding: 6px 12px;
}

.dp-preview {
  padding: 24px;
  display: flex;
  justify-content: center;
  overflow-x: auto;
  background: var(--vp-c-bg);
}

.dp-preview :deep(svg) {
  max-width: 100%;
  height: auto;
}

.dp-code :deep(pre) {
  margin: 0;
  border-radius: 0;
  padding: 16px 20px;
  background: var(--vp-code-block-bg);
  overflow-x: auto;
}

.dp-code :deep(code) {
  font-size: 13px;
  line-height: 1.7;
  color: var(--vp-c-text-1);
  white-space: pre;
}

/* Fullscreen overlay */
.fs-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: var(--vp-c-bg);
  cursor: grab;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fs-overlay:active {
  cursor: grabbing;
}

.fs-toolbar {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
  display: flex;
  gap: 8px;
}

.fs-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 13px;
  font-family: var(--vp-font-family-base);
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
}

.fs-btn:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-mute);
}

.fs-svg-wrap {
  transform-origin: center center;
  transition: transform 0.05s ease-out;
}

.fs-svg-wrap :deep(svg) {
  max-width: none;
  max-height: none;
}
</style>
