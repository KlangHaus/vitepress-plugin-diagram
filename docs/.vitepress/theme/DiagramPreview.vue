<script setup lang="ts">
import { ref } from 'vue'

const tab = ref<'preview' | 'code'>('preview')
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
    </div>
    <div v-show="tab === 'preview'" class="dp-preview">
      <slot name="preview" />
    </div>
    <div v-show="tab === 'code'" class="dp-code">
      <slot name="code" />
    </div>
  </div>
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
</style>
