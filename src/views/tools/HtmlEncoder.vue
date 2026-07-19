<script setup lang="ts">
import { ref } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import { useCopy } from '@/composables/useCopy'
import { BaseButton, BaseCard } from '@purdia/ui'
import { Copy, Check, ArrowLeftRight } from 'lucide-vue-next'

const { copied, copy } = useCopy()

const input = ref('')
const output = ref('')
const mode = ref<'encode' | 'decode'>('encode')
const error = ref('')

const ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
}

const REVERSE_ENTITIES: Record<string, string> = {}
for (const [ch, entity] of Object.entries(ENTITIES)) {
  REVERSE_ENTITIES[entity] = ch
}

function encode() {
  try {
    error.value = ''
    output.value = input.value.replace(/[&<>"'/]/g, (ch) => ENTITIES[ch] || ch)
  } catch (e: unknown) {
    error.value = (e as Error).message
    output.value = ''
  }
}

function decode() {
  try {
    error.value = ''
    let result = input.value
    for (const [entity, ch] of Object.entries(REVERSE_ENTITIES)) {
      result = result.replace(new RegExp(entity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), ch)
    }
    // Also handle numeric entities
    result = result.replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)))
    result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    output.value = result
  } catch (e: unknown) {
    error.value = (e as Error).message
    output.value = ''
  }
}

function convert() {
  if (mode.value === 'encode') encode()
  else decode()
}

function swap() {
  const temp = input.value
  input.value = output.value
  output.value = temp
  mode.value = mode.value === 'encode' ? 'decode' : 'encode'
}
</script>

<template>
  <ToolLayout tool-id="html-encoder" title="HTML Entities" description="Encode and decode HTML entities">
    <div class="flex items-center gap-3 mb-4">
      <div class="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
        <button
          class="px-3 py-1.5 text-sm rounded-md transition-colors"
          :class="mode === 'encode' ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'"
          @click="mode = 'encode'"
        >Encode</button>
        <button
          class="px-3 py-1.5 text-sm rounded-md transition-colors"
          :class="mode === 'decode' ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'"
          @click="mode = 'decode'"
        >Decode</button>
      </div>
      <BaseButton size="sm" @click="convert">Convert</BaseButton>
      <BaseButton variant="secondary" size="sm" :icon="ArrowLeftRight" @click="swap">Swap</BaseButton>
      <BaseButton v-if="output" variant="ghost" size="sm" :icon="copied ? Check : Copy" class="ml-auto" @click="copy(output)">{{ copied ? 'Copied!' : 'Copy' }}</BaseButton>
    </div>

    <div v-if="error" class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">{{ error }}</div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <BaseCard variant="bordered" :padding="false">
        <template #header><span class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ mode === 'encode' ? 'Plain text' : 'Encoded text' }}</span></template>
        <textarea
          v-model="input"
          class="w-full h-64 p-4 font-mono text-sm bg-transparent border-0 resize-none focus:outline-none"
          :placeholder="mode === 'encode' ? 'Enter HTML to encode...' : 'Enter encoded text to decode...'"
          spellcheck="false"
          @input="convert"
        />
      </BaseCard>
      <BaseCard variant="bordered" :padding="false">
        <template #header><span class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ mode === 'encode' ? 'Encoded output' : 'Decoded output' }}</span></template>
        <pre class="w-full h-64 p-4 font-mono text-sm overflow-auto whitespace-pre-wrap break-all text-gray-700 dark:text-gray-300">{{ output || 'Output will appear here...' }}</pre>
      </BaseCard>
    </div>
  </ToolLayout>
</template>
