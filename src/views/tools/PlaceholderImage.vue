<script setup lang="ts">
import { ref, computed } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import { useCopy } from '@/composables/useCopy'
import { BaseButton, BaseCard } from '@purdia/ui'
import { Copy, Check } from 'lucide-vue-next'

const { copied, copy } = useCopy()

const width = ref(300)
const height = ref(200)
const bgColor = ref('#e2e8f0')
const textColor = ref('#64748b')
const customText = ref('')

const displayText = computed(() => customText.value || `${width.value}x${height.value}`)
const fontSize = computed(() => Math.max(12, Math.floor(Math.min(width.value, height.value) / 5)))

const svgMarkup = computed(() => {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width.value}" height="${height.value}"><rect width="100%" height="100%" fill="${bgColor.value}"/><text x="50%" y="50%" font-family="sans-serif" font-size="${fontSize.value}" fill="${textColor.value}" text-anchor="middle" dominant-baseline="middle">${displayText.value}</text></svg>`
})

const dataUri = computed(() => {
  return `data:image/svg+xml,${encodeURIComponent(svgMarkup.value)}`
})

function copySvg() {
  copy(svgMarkup.value)
}

function copyDataUri() {
  copy(dataUri.value)
}
</script>

<template>
  <ToolLayout tool-id="placeholder-image" title="Placeholder Image" description="Generate placeholder SVG images with custom dimensions and colors">
    <div class="space-y-4">
      <!-- Controls -->
      <BaseCard variant="bordered">
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Width</label>
            <input
              v-model.number="width"
              type="number"
              min="10"
              max="2000"
              class="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Height</label>
            <input
              v-model.number="height"
              type="number"
              min="10"
              max="2000"
              class="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Text</label>
            <input
              v-model="customText"
              type="text"
              class="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              :placeholder="`${width}x${height}`"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Background</label>
            <div class="flex items-center gap-2">
              <input v-model="bgColor" type="color" class="w-8 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer" />
              <input
                v-model="bgColor"
                type="text"
                class="flex-1 px-2 py-1.5 text-xs font-mono bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Text Color</label>
            <div class="flex items-center gap-2">
              <input v-model="textColor" type="color" class="w-8 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer" />
              <input
                v-model="textColor"
                type="text"
                class="flex-1 px-2 py-1.5 text-xs font-mono bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none"
              />
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- Actions -->
      <div class="flex gap-2">
        <BaseButton size="sm" :icon="copied ? Check : Copy" @click="copySvg">Copy SVG</BaseButton>
        <BaseButton variant="secondary" size="sm" :icon="Copy" @click="copyDataUri">Copy Data URI</BaseButton>
      </div>

      <!-- Preview -->
      <BaseCard variant="bordered" :padding="false">
        <template #header>
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Preview</span>
        </template>
        <div class="p-4 flex items-center justify-center bg-[repeating-conic-gradient(#f3f4f6_0%_25%,#fff_0%_50%)] dark:bg-[repeating-conic-gradient(#1f2937_0%_25%,#111827_0%_50%)] bg-[length:16px_16px]">
          <img :src="dataUri" :width="width" :height="height" :alt="displayText" class="max-w-full h-auto" />
        </div>
      </BaseCard>

      <!-- SVG Source -->
      <BaseCard variant="bordered" :padding="false">
        <template #header>
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400">SVG Source</span>
        </template>
        <pre class="p-4 font-mono text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-all">{{ svgMarkup }}</pre>
      </BaseCard>
    </div>
  </ToolLayout>
</template>
